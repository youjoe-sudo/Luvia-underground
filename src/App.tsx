import React, { useState, useEffect } from 'react';
import { Course, StudentProgress, Voucher, LiveClass, Profile, PlatformSettings } from './types';
import { dbService } from './lib/db';

// Importing our custom high-fidelity SaaS components
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import CourseDetails from './components/CourseDetails';
import LearningExperience from './components/LearningExperience';
import AssignmentsPage from './components/AssignmentsPage';
import CertificatesPage from './components/CertificatesPage';
import LiveClasses from './components/LiveClasses';
import AdminDashboard from './components/AdminDashboard';
import PlatformSetup from './components/PlatformSetup';

export default function App() {
  const [currentView, setView] = useState<string>('landing');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  
  // System states
  const [isSystemEmpty, setIsSystemEmpty] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  // Auth states
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pendingView, setPendingView] = useState<string | null>(null);

  // Core datasets synced from DB
  const [courses, setCourses] = useState<Course[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Initial mount verification
  useEffect(() => {
    const initializePlatform = async () => {
      setIsLoading(true);
      try {
        // 1. Check if the database has no administrative setup
        const empty = await dbService.isSystemEmpty();
        setIsSystemEmpty(empty);

        if (!empty) {
          // 2. Load platform-wide variables
          const [loadedCourses, loadedLive, loadedVouchers, settings] = await Promise.all([
            dbService.getCourses(),
            dbService.getLiveClasses(),
            dbService.getVouchers(),
            dbService.getSettings()
          ]);
          setCourses(loadedCourses);
          setLiveClasses(loadedLive);
          setVouchers(loadedVouchers);
          setPlatformSettings(settings);

          // Restore session from cache if available
          const cachedUserId = localStorage.getItem('luvia_active_user_id');
          if (cachedUserId) {
            const profile = await dbService.getProfile(cachedUserId);
            if (profile) {
              setCurrentUser(profile);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (e) {
        console.error("Initialization error", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializePlatform();
  }, []);

  // Sync Tailwind v4 Light/Dark Mode theme variable changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Refresh DB datasets reactively
  const refreshData = async () => {
    try {
      const [loadedCourses, loadedLive, loadedVouchers, settings] = await Promise.all([
        dbService.getCourses(),
        dbService.getLiveClasses(),
        dbService.getVouchers(),
        dbService.getSettings()
      ]);
      setCourses(loadedCourses);
      setLiveClasses(loadedLive);
      setVouchers(loadedVouchers);
      setPlatformSettings(settings);

      if (currentUser) {
        const freshProfile = await dbService.getProfile(currentUser.id);
        if (freshProfile) {
          setCurrentUser(freshProfile);
        }
      }
    } catch (e) {
      console.error("State refresh failed", e);
    }
  };

  const handleSetupComplete = async () => {
    setIsSystemEmpty(false);
    await refreshData();
    setView('landing');
  };

  // Intercept view transitions to enforce authentication
  const navigateWithAuth = (view: string) => {
    const publicViews = ['landing', 'coursedetails'];
    if (!isAuthenticated && !publicViews.includes(view)) {
      setPendingView(view);
      setView('auth');
    } else {
      setView(view);
    }
  };

  const handleAuthSuccess = (profile: Profile) => {
    setCurrentUser(profile);
    setIsAuthenticated(true);
    localStorage.setItem('luvia_active_user_id', profile.id);
    
    // Auto sync loaded courses to populate student progress components
    refreshData();

    if (pendingView) {
      setView(pendingView);
      setPendingView(null);
    } else {
      setView('dashboard');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('luvia_active_user_id');
    setView('landing');
  };

  const handleCompleteLesson = async (lessonId: string, xpAwarded: number) => {
    if (!currentUser) return;
    try {
      const freshProfile = await dbService.updateProfileProgress(currentUser.id, xpAwarded);
      setCurrentUser(freshProfile);
    } catch (e) {
      console.error("XP assignment failure", e);
    }
  };

  const handleCompleteQuiz = async (xpAwarded: number) => {
    if (!currentUser) return;
    try {
      const freshProfile = await dbService.updateProfileProgress(currentUser.id, xpAwarded);
      setCurrentUser(freshProfile);
    } catch (e) {
      console.error("Quiz XP assignment failure", e);
    }
  };

  // Admin dynamic voucher additions/deletions
  const handleAddVoucher = async (v: Voucher) => {
    await dbService.createVoucher(v);
    await refreshData();
  };

  const handleDeleteVoucher = async (code: string) => {
    await dbService.deleteVoucher(code);
    await refreshData();
  };

  // Derive simple legacy progress schema for header display compatibility
  const derivedProgress: StudentProgress = currentUser ? {
    currentStreak: currentUser.currentStreak,
    totalXp: currentUser.totalXp,
    coursesCompleted: 0, // derived dynamically if courses completed
    currentLevel: currentUser.currentLevel
  } : {
    currentStreak: 1,
    totalXp: 0,
    coursesCompleted: 0,
    currentLevel: 1
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white font-sans">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="block text-xs font-mono tracking-widest text-slate-500 uppercase animate-pulse">Initializing Luvia secure sandbox environment...</span>
        </div>
      </div>
    );
  }

  // Render PlatformSetup if no administrators exist in the database
  if (isSystemEmpty) {
    return <PlatformSetup onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col font-sans">
      
      {/* Universal Floating High-End Header */}
      {currentView !== 'auth' && (
        <Navigation 
          currentView={currentView} 
          setView={navigateWithAuth} 
          progress={derivedProgress}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Content Area Routing */}
      <div className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage 
            onSelectCourse={(id) => {
              setSelectedCourseId(id);
              setView('coursedetails');
            }}
            onStartLearning={() => navigateWithAuth('dashboard')}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => {
              setView('landing');
              setPendingView(null);
            }}
          />
        )}

        {currentView === 'coursedetails' && (
          <CourseDetails 
            courseId={selectedCourseId}
            courses={courses}
            onStartCourse={(id) => {
              setSelectedCourseId(id);
              navigateWithAuth('learning');
            }}
            onGoBack={() => setView('landing')}
          />
        )}

        {currentView === 'dashboard' && (
          <StudentDashboard 
            currentUser={currentUser || { id: 'guest', email: 'guest@luvia.com', name: 'Guest', role: 'student', currentStreak: 1, totalXp: 0, currentLevel: 1 }}
            courses={courses}
            liveClasses={liveClasses}
            onResumeLesson={(courseId, lessonId) => {
              setSelectedCourseId(courseId);
              setSelectedLessonId(lessonId);
              setView('learning');
            }}
            onSelectCourse={(id) => {
              setSelectedCourseId(id);
              setView('coursedetails');
            }}
            onGoToLive={() => setView('live')}
            onGoToCertificates={() => setView('certificates')}
            onGoToQuiz={() => setView('assignments')}
          />
        )}

        {currentView === 'learning' && (
          <LearningExperience 
            courseId={selectedCourseId}
            courses={courses}
            activeLessonId={selectedLessonId}
            onCompleteLesson={handleCompleteLesson}
            onGoBack={() => setView('dashboard')}
          />
        )}

        {currentView === 'assignments' && (
          <AssignmentsPage 
            onQuizComplete={handleCompleteQuiz}
            onGoBack={() => setView('dashboard')}
          />
        )}

        {currentView === 'certificates' && (
          <CertificatesPage 
            onGoBack={() => setView('dashboard')}
          />
        )}

        {currentView === 'live' && (
          <LiveClasses 
            onGoBack={() => setView('dashboard')}
            speakerName={liveClasses[0]?.speaker || "Marcus Vance"}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard 
            currentUser={currentUser!}
            onGoBack={() => setView('dashboard')}
            onRefreshCourses={refreshData}
          />
        )}
      </div>

    </div>
  );
}
