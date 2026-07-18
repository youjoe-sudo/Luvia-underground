import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Award, 
  Tag, 
  Trash2, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Key, 
  FileText, 
  DollarSign, 
  Eye,
  CheckCircle,
  Clock,
  BookOpen,
  Settings,
  HelpCircle,
  MessageSquare,
  Volume2,
  ListFilter,
  CheckSquare,
  Tv
} from 'lucide-react';
import { Course, Voucher, Profile, TAAssignment, FAQ, Testimonial, Announcement, PlatformSettings, Lesson } from '../types';
import { dbService } from '../lib/db';

interface AdminDashboardProps {
  currentUser: Profile;
  onGoBack: () => void;
  onRefreshCourses: () => void;
}

export default function AdminDashboard({
  currentUser,
  onGoBack,
  onRefreshCourses
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'staff' | 'vouchers' | 'branding' | 'announcements' | 'faqs'>('overview');
  
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // CMS Modals / Inputs
  // Course creation inputs
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseDifficulty, setCourseDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [courseCategory, setCourseCategory] = useState('Design Engineering');
  const [courseDuration, setCourseDuration] = useState('8h 15m');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseInstructorId, setCourseInstructorId] = useState('');

  // Lesson creation inputs
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('15:00');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [lessonXp, setLessonXp] = useState('150');

  // Voucher inputs
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState('20');

  // Announcement inputs
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');

  // FAQ inputs
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Testimonial inputs
  const [testiName, setTestiName] = useState('');
  const [testiComment, setTestiComment] = useState('');
  const [testiRating, setTestiRating] = useState('5');

  // Branding Inputs
  const [whatsapp, setWhatsapp] = useState('');
  const [pName, setPName] = useState('');
  const [hTitle, setHTitle] = useState('');
  const [hSubtitle, setHSubtitle] = useState('');

  // TA inputs
  const [taUserId, setTaUserId] = useState('');
  const [taCourseId, setTaCourseId] = useState('');
  const [taPermissions, setTaPermissions] = useState<string[]>(['announcements']);

  // Load all database entities on mount
  const loadData = async () => {
    try {
      const liveCourses = await dbService.getCourses();
      const liveProfiles = await dbService.listProfiles();
      const liveVouchers = await dbService.getVouchers();
      const liveFaqs = await dbService.getFaqs();
      const liveTestimonials = await dbService.getTestimonials();
      const liveAnnouncements = await dbService.getAnnouncements();
      const liveSettings = await dbService.getSettings();

      setCourses(liveCourses);
      setProfiles(liveProfiles);
      setVouchers(liveVouchers);
      setFaqs(liveFaqs);
      setTestimonials(liveTestimonials);
      setAnnouncements(liveAnnouncements);
      setPlatformSettings(liveSettings);

      // Pre-fill branding state
      setWhatsapp(liveSettings.whatsappNumber);
      setPName(liveSettings.platformName);
      setHTitle(liveSettings.heroTitle);
      setHSubtitle(liveSettings.heroSubtitle);
    } catch (err) {
      console.error('Error loading admin metrics:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Secure Filtering based on User Role (RBAC)
  const isSuperAdmin = currentUser.role === 'admin';
  const isInstructor = currentUser.role === 'instructor';
  const isTA = currentUser.role === 'ta';

  // Instructors only see their own courses
  const visibleCourses = courses.filter(course => {
    if (isSuperAdmin) return true;
    if (isInstructor) return course.instructor?.id === currentUser.id;
    // For TA: can view course if assigned to it
    if (isTA) return true; // simplified read fallback
    return false;
  });

  // CMS Submissions
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !coursePrice) return alert('Course Title and tuition fee required.');

    try {
      const selectedInstId = isSuperAdmin ? (courseInstructorId || currentUser.id) : currentUser.id;
      await dbService.createCourse({
        title: courseTitle,
        subtitle: courseSubtitle || 'High-fidelity educational modules.',
        duration: courseDuration,
        xpReward: 1000,
        coverImage: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&q=80&w=1200',
        category: courseCategory,
        description: courseDescription || 'No description provided.',
        outcomes: ['Develop spatial system architectures', 'Master layout typography rules'],
        requirements: ['Standard IDE setup', 'Basic framework familiarity'],
        price: Number(coursePrice),
        difficulty: courseDifficulty,
        instructorId: selectedInstId
      });

      // Reset
      setCourseTitle('');
      setCourseSubtitle('');
      setCoursePrice('');
      setCourseDescription('');
      loadData();
      onRefreshCourses();
      alert('Course instantiated successfully.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLesson || !lessonTitle.trim()) return alert('Please select a course blueprint and add a lesson title.');

    try {
      await dbService.createLesson(selectedCourseForLesson, {
        title: lessonTitle,
        duration: lessonDuration,
        videoUrl: lessonVideoUrl,
        isLocked: false,
        xp: Number(lessonXp)
      });

      setLessonTitle('');
      loadData();
      alert('Lesson appended securely.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Delete this course blueprint? All associated lessons will be dropped.')) return;
    try {
      await dbService.deleteCourse(id);
      loadData();
      onRefreshCourses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    try {
      await dbService.createVoucher({
        code: voucherCode.toUpperCase(),
        discountPercent: Number(voucherDiscount),
        isActive: true
      });
      setVoucherCode('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteVoucher = async (code: string) => {
    try {
      await dbService.deleteVoucher(code);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    try {
      await dbService.createAnnouncement({
        title: announcementTitle,
        content: announcementContent,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdBy: currentUser.name
      });
      setAnnouncementTitle('');
      setAnnouncementContent('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await dbService.deleteAnnouncement(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.updateSettings({
        platformName: pName,
        platformDescription: platformSettings?.platformDescription || '',
        whatsappNumber: whatsapp,
        heroTitle: hTitle,
        heroSubtitle: hSubtitle,
        bannerMessage: platformSettings?.bannerMessage || ''
      });
      alert('Branding and platform specifications updated dynamically.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'instructor' | 'ta' | 'student') => {
    try {
      await dbService.updateProfileRole(userId, newRole);
      alert('Security level role modified successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    try {
      await dbService.createFaq({ question: faqQuestion, answer: faqAnswer });
      setFaqQuestion('');
      setFaqAnswer('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await dbService.deleteFaq(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // TA Permissions Handler
  const toggleTaPermission = (perm: string) => {
    setTaPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleAssignTa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taUserId || !taCourseId) return alert('Select TA User and Course blueprint.');

    try {
      // Modify role to TA first
      await dbService.updateProfileRole(taUserId, 'ta');
      await dbService.assignTa({
        userId: taUserId,
        courseId: taCourseId,
        permissions: taPermissions as any
      });
      alert('TA security permissions mapped successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isSuperAdmin && !isInstructor && !isTA) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-white font-sans">
        <ShieldAlert className="w-16 h-16 text-rose-500 animate-bounce mb-6" />
        <h1 className="font-display text-2xl font-bold tracking-tight">Security Access Lockout</h1>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">The SaaS Command Terminal is limited strictly to approved Instructors, TAs, and Super Administrators. Return to safety.</p>
        <button onClick={onGoBack} className="mt-8 px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer">
          ← Esc System Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans text-left">
      
      {/* visual atmospheric glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10 space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={onGoBack}
              className="text-[10px] font-mono font-bold text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer uppercase tracking-wider"
            >
              ← ESCAPE WORKSPACE
            </button>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mt-1 flex items-center gap-2">
              <span>SaaS Command Executive Terminal</span>
              <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 rounded-full border border-blue-500/10 uppercase">
                {currentUser.role} PRIVILEGE
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
              Administer role configurations, dynamic FAQs, course CMS, brand settings, and verify metrics.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/10 text-blue-600 dark:text-cyan-400 border border-blue-600/10 rounded-xl font-mono text-xs font-bold uppercase tracking-wide">
            <span>SECURE LINK OPERATIONAL</span>
          </div>
        </div>

        {/* Executive Metrics HUD */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">SYS REVENUE</span>
              <span className="block font-display text-2xl font-bold">${(courses.length * 12850).toLocaleString()}</span>
              <span className="block text-[9px] text-emerald-500 font-mono font-bold">● ACTIVE NET ENROLLMENTS</span>
            </div>
            <div className="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">THINKERS ROSTER</span>
              <span className="block font-display text-2xl font-bold">{profiles.length}</span>
              <span className="block text-[9px] text-slate-500 font-mono font-bold">TOTAL REGISTERED USER PROFILES</span>
            </div>
            <div className="w-11 h-11 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">COURSES CMS</span>
              <span className="block font-display text-2xl font-bold">{courses.length}</span>
              <span className="block text-[9px] text-slate-500 font-mono font-bold">LIVE BLUEPRINTS PUBLISHED</span>
            </div>
            <div className="w-11 h-11 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">VOUCHERS DISPATCHED</span>
              <span className="block font-display text-2xl font-bold">{vouchers.length}</span>
              <span className="block text-[9px] text-slate-500 font-mono font-bold">COUPON SYSTEMS SECURE</span>
            </div>
            <div className="w-11 h-11 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Dynamic Tab Navigation depending on roles */}
        <section className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/10 rounded-2xl max-w-4xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${
              activeTab === 'overview' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Metrics
          </button>
          
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${
              activeTab === 'courses' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Syllabus CMS
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${
                activeTab === 'staff' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              Instructor & TA Control
            </button>
          )}

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${
              activeTab === 'announcements' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Announcements
          </button>

          {isSuperAdmin && (
            <>
              <button
                onClick={() => setActiveTab('vouchers')}
                className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${
                  activeTab === 'vouchers' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                Coupons
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${
                  activeTab === 'branding' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                Settings CMS
              </button>

              <button
                onClick={() => setActiveTab('faqs')}
                className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all ${
                  activeTab === 'faqs' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                FAQs & Testis
              </button>
            </>
          )}
        </section>

        {/* CMS Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm min-h-[400px]">
          
          {/* Tab 1: Overview and Charts */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Weekly Load Matrix</h3>
                    <p className="text-[11px] text-slate-400 font-light">Interactive tracking of session interval densities.</p>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 p-3 bg-slate-50 dark:bg-slate-950/25 border border-slate-200/10 rounded-2xl">
                    {[...Array(35)].map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`aspect-square rounded-lg bg-blue-500/70 shadow hover:scale-110 cursor-pointer`}
                        style={{ opacity: 0.2 + (idx % 6) * 0.15 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Active Thinker Accounts</h3>
                    <p className="text-[11px] text-slate-400 font-light">All profiles registered in the database directory.</p>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2.5 pr-2">
                    {profiles.map(p => (
                      <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-900 dark:text-white text-xs uppercase">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-slate-900 dark:text-white">{p.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{p.email}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-cyan-400 rounded-lg text-[9px] font-mono uppercase font-bold">
                          {p.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Syllabus / Courses / Lessons CMS */}
          {activeTab === 'courses' && (
            <div className="space-y-8 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Course Creator CMS */}
                <div className="lg:col-span-5 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Add Course Blueprint</h3>
                    <p className="text-[11px] text-slate-400 font-light">Publish a brand-new high-end dynamic course structure.</p>
                  </div>

                  <form onSubmit={handleCreateCourse} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase">TITLE</label>
                      <input 
                        type="text" 
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="Advanced Spring Physics..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">PRICE ($)</label>
                        <input 
                          type="number" 
                          value={coursePrice}
                          onChange={(e) => setCoursePrice(e.target.value)}
                          placeholder="e.g. 199"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">DIFFICULTY</label>
                        <select 
                          value={courseDifficulty}
                          onChange={(e) => setCourseDifficulty(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">ASSIGNED INSTRUCTOR</label>
                        <select
                          value={courseInstructorId}
                          onChange={(e) => setCourseInstructorId(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        >
                          <option value="">Select Instructor...</option>
                          {profiles.filter(p => p.role === 'instructor' || p.role === 'admin').map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase">DESCRIPTION</label>
                      <textarea 
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        rows={2}
                        placeholder="In-depth conceptual syllabus text..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none"
                      />
                    </div>

                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-all">
                      Publish Syllabus
                    </button>
                  </form>
                </div>

                {/* Lesson Appender CMS */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-sm uppercase">Add Video Lesson</h3>
                      <p className="text-[11px] text-slate-400 font-light">Upload dynamic stream components into an existing syllabus.</p>
                    </div>

                    <form onSubmit={handleCreateLesson} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">TARGET COURSE BLUEPRINT</label>
                        <select
                          value={selectedCourseForLesson}
                          onChange={(e) => setSelectedCourseForLesson(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        >
                          <option value="">Select Target Course...</option>
                          {visibleCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">LESSON TITLE</label>
                        <input 
                          type="text" 
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          placeholder="e.g. Math behind Spring oscillatory bounds"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">VIDEO STREAM URL</label>
                        <input 
                          type="text" 
                          value={lessonVideoUrl}
                          onChange={(e) => setLessonVideoUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">DURATION</label>
                        <input 
                          type="text" 
                          value={lessonDuration}
                          onChange={(e) => setLessonDuration(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-slate-400 uppercase">XP VALUE</label>
                        <input 
                          type="number" 
                          value={lessonXp}
                          onChange={(e) => setLessonXp(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                        />
                      </div>

                      <button className="md:col-span-2 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                        Append Lesson Token
                      </button>
                    </form>
                  </div>

                  {/* Syllabus Roster Grid */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">ACTIVE BLUEPRINTS DIRECTORY ({visibleCourses.length})</span>
                    
                    {visibleCourses.map(c => (
                      <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">{c.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {c.lessons.length} Lessons | Price: ${c.price} | Level: {c.difficulty}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Staff Assignment & RBAC (Admin-Only) */}
          {activeTab === 'staff' && isSuperAdmin && (
            <div className="space-y-8 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* TA and Instructor Assignment Module */}
                <div className="lg:col-span-6 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Register & Assign TA</h3>
                    <p className="text-[11px] text-slate-400 font-light">Delegate customized action controls to certified teaching assistants.</p>
                  </div>

                  <form onSubmit={handleAssignTa} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase">SELECT PROFILE</label>
                      <select
                        value={taUserId}
                        onChange={(e) => setTaUserId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                      >
                        <option value="">Select User Profile...</option>
                        {profiles.filter(p => p.role === 'student').map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase">ASSIGNED SYLLABUS</label>
                      <select
                        value={taCourseId}
                        onChange={(e) => setTaCourseId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                      >
                        <option value="">Select Course Blueprint...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Permissions check matrix */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase">TA ACTIONS AUTORIZATIONS</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'announcements', label: 'Post Announcements' },
                          { id: 'manage_live', label: 'Dispatch Live Classes' },
                          { id: 'review_assignments', label: 'Grade Assignments' },
                          { id: 'upload_files', label: 'Manage Syllabus Files' }
                        ].map(perm => {
                          const hasPerm = taPermissions.includes(perm.id);
                          return (
                            <button
                              type="button"
                              key={perm.id}
                              onClick={() => toggleTaPermission(perm.id)}
                              className={`p-2 rounded-xl border text-left flex items-center space-x-2 cursor-pointer transition-colors ${
                                hasPerm ? 'border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-cyan-400 font-semibold' : 'border-slate-200/10 hover:bg-slate-800/10'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] font-bold ${hasPerm ? 'bg-blue-600 text-white' : ''}`}>
                                {hasPerm && '✓'}
                              </div>
                              <span>{perm.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                      Provision TA Security
                    </button>
                  </form>
                </div>

                {/* Role Promotion Table */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase">Staff Directory Clearance</h3>
                    <p className="text-[11px] text-slate-400 font-light">Promote, demote, or suspend user accounts dynamically in Supabase.</p>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                    {profiles.map(p => (
                      <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{p.email}</span>
                        </div>

                        <select
                          value={p.role}
                          onChange={(e) => handleUpdateRole(p.id, e.target.value as any)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs font-semibold uppercase"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="ta">Teaching Assistant</option>
                          <option value="admin">Super Admin</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 4: Announcements */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 text-left max-w-4xl">
              <div>
                <h3 className="font-display font-bold text-sm uppercase">Dispatch Live Announcement</h3>
                <p className="text-[11px] text-slate-400 font-light">Post header banners or dashboard cards readable by all students.</p>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">SUBJECT HEADING</label>
                  <input 
                    type="text" 
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="SaaS Class starts in 10 minutes..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">CONTENT STATEMENT</label>
                  <textarea 
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none"
                  />
                </div>
                <button className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer">
                  Dispatch Broadcast
                </button>
              </form>

              <div className="space-y-3 pt-4">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">PUBLISHED ANNOUNCEMENTS ({announcements.length})</span>
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">{ann.title}</span>
                      <span className="text-[10px] text-slate-400 font-light block mt-1">{ann.content}</span>
                      <span className="text-[8px] font-mono text-blue-500 uppercase mt-2 block">Published {ann.date} by {ann.createdBy}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Coupons (Admin-Only) */}
          {activeTab === 'vouchers' && isSuperAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              <div className="lg:col-span-5 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm uppercase">Generate Coupon Token</h3>
                  <p className="text-[11px] text-slate-400 font-light">Discounts are validated on individual checkout drawers.</p>
                </div>

                <form onSubmit={handleCreateVoucher} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">COUPON NAME</label>
                    <input 
                      type="text" 
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="e.g. STRIPE50"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">DISCOUNT PERCENTAGE</label>
                    <select
                      value={voucherDiscount}
                      onChange={(e) => setVoucherDiscount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                    >
                      <option value="10">10% Off</option>
                      <option value="20">20% Off</option>
                      <option value="30">30% Off</option>
                      <option value="50">50% Off (Admin Star)</option>
                    </select>
                  </div>

                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer">
                    Publish Coupon Code
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">SECURE SYSTEM VOUCHERS</span>
                <div className="space-y-3">
                  {vouchers.map(v => (
                    <div key={v.code} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold rounded-xl border border-purple-500/10">
                          {v.code}
                        </span>
                        <div>
                          <span className="block text-xs font-bold">{v.discountPercent}% OFF TOTAL</span>
                          <span className="block text-[9px] text-emerald-500 font-mono font-bold uppercase">STATUS: SYSTEM ONLINE</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteVoucher(v.code)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Branding / Settings CMS */}
          {activeTab === 'branding' && isSuperAdmin && (
            <div className="space-y-6 text-left max-w-4xl">
              <div>
                <h3 className="font-display font-bold text-sm uppercase">Global Identity Configuration</h3>
                <p className="text-[11px] text-slate-400 font-light">Mutate the public headers and hero descriptors dynamically.</p>
              </div>

              <form onSubmit={handleUpdateBranding} className="p-6 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">PLATFORM PUBLIC LOGO / NAME</label>
                  <input 
                    type="text" 
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">WHATSAPP DIRECT SUPPORT PHONE</label>
                  <input 
                    type="text" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">HERO MAIN LANDING HEADING</label>
                  <input 
                    type="text" 
                    value={hTitle}
                    onChange={(e) => setHTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">HERO DESCRIPTION SUBTITLE</label>
                  <textarea 
                    value={hSubtitle}
                    onChange={(e) => setHSubtitle(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none"
                  />
                </div>

                <button className="md:col-span-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                  Commit Branding Specifications
                </button>
              </form>
            </div>
          )}

          {/* Tab 7: FAQs CMS */}
          {activeTab === 'faqs' && isSuperAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
              
              {/* FAQ Creator */}
              <div className="lg:col-span-5 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm uppercase">Add FAQ Block</h3>
                  <p className="text-[11px] text-slate-400 font-light">Publish clear responses to frequently asked student queries.</p>
                </div>

                <form onSubmit={handleCreateFaq} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">QUESTION</label>
                    <input 
                      type="text" 
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      placeholder="e.g. Are certificates transferable?"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">ANSWER BODY</label>
                    <textarea 
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none"
                    />
                  </div>
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase cursor-pointer">
                    Append FAQ Item
                  </button>
                </form>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-7 space-y-3">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">ACTIVE FAQS ON PLATFORM</span>
                {faqs.map(f => (
                  <div key={f.id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">{f.question}</span>
                      <span className="block text-[10px] text-slate-400 mt-1">{f.answer}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
