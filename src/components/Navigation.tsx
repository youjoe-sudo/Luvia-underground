import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Video, 
  CheckSquare, 
  Award, 
  Radio, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Bell, 
  Flame, 
  Zap, 
  Menu, 
  X,
  BookOpen,
  LogOut
} from 'lucide-react';
import { StudentProgress, Profile, PlatformSettings } from '../types';
import { dbService } from '../lib/db';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  progress: StudentProgress;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  currentUser: Profile | null;
  onSignOut: () => void;
}

export default function Navigation({ 
  currentView, 
  setView, 
  progress, 
  isDarkMode, 
  setIsDarkMode,
  currentUser,
  onSignOut
}: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(1);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await dbService.getSettings();
        setPlatformSettings(s);
      } catch (e) {
        // fallback
      }
    };
    loadSettings();
    
    // Listen for custom settings changes event
    window.addEventListener('platformSettingsUpdated', loadSettings);
    return () => window.removeEventListener('platformSettingsUpdated', loadSettings);
  }, []);

  // Filter Nav Items according to user role
  const isPrivileged = currentUser && ['admin', 'instructor', 'ta'].includes(currentUser.role);

  const baseNavItems = [
    { id: 'landing', label: 'Explore', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'live', label: 'Live Seminar', icon: Radio },
  ];

  const navItems = isPrivileged 
    ? [...baseNavItems, { id: 'admin', label: 'Admin Terminal', icon: ShieldAlert }]
    : baseNavItems;

  const notifications = [
    { id: 1, text: `Welcome to ${platformSettings?.platformName || 'Luvia'}! Get started by exploring course syllabi.`, type: 'info' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and Brand */}
        <button 
          onClick={() => setView('landing')} 
          className="flex items-center space-x-3 group text-left cursor-pointer"
          id="nav-logo-btn"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[2px] transition-transform duration-500 group-hover:rotate-12">
            <div className="flex items-center justify-center w-full h-full bg-white dark:bg-slate-950 rounded-[10px] transition-colors duration-300">
              <span className="font-display font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                {(platformSettings?.platformName || 'Luvia').charAt(0)}
              </span>
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              {platformSettings?.platformName || 'Luvia'}
            </span>
            <span className="block text-[9px] font-mono tracking-widest text-blue-600 dark:text-cyan-400 font-bold uppercase">PRO PLATFORM</span>
          </div>
        </button>

        {/* Desktop Navigation Items */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'learning' && currentView === 'coursedetails');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setMobileOpen(false);
                }}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white hover:bg-white/40 hover:dark:bg-slate-800/20'
                }`}
                id={`nav-item-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-cyan-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center space-x-3">
          
          {currentUser && (
            <>
              {/* Streak Indicator */}
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/20 rounded-xl font-mono text-xs font-bold shadow-sm">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{currentUser.currentStreak} DAY STREAK</span>
              </div>

              {/* XP Badge */}
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/20 rounded-xl font-mono text-xs font-bold shadow-sm">
                <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                <span>{currentUser.totalXp} XP</span>
              </div>
            </>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 hover:dark:bg-slate-800 rounded-xl border border-slate-200/10 transition-colors cursor-pointer"
            id="theme-toggle"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-blue-600" />}
          </button>

          {/* Notifications Panel Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setUnreadNotifications(0);
              }}
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 hover:dark:bg-slate-800 rounded-xl border border-slate-200/10 transition-colors cursor-pointer"
              id="notifications-toggle"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            {/* Notification Drawer */}
            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-display font-semibold text-sm text-slate-900 dark:text-white">Recent Updates</span>
                  <button 
                    onClick={() => setNotificationOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto text-left">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className="p-2.5 rounded-xl text-xs leading-relaxed border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 text-slate-700 dark:text-slate-300"
                    >
                      {n.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Action */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center space-x-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/10 rounded-2xl hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors cursor-pointer"
                id="user-profile-btn"
              >
                <div className="w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left pr-2">
                  <span className="block text-xs font-semibold text-slate-900 dark:text-white">{currentUser.name}</span>
                  <span className="block text-[9px] font-mono text-slate-400 uppercase">{currentUser.role}</span>
                </div>
              </button>
              
              <button
                onClick={onSignOut}
                className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-900 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
                id="signout-btn"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('auth')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
              id="nav-login-btn-public"
            >
              Sign In
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pointer"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="lg:hidden mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg space-y-2 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-1 text-left">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                  id={`mobile-nav-${item.id}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
