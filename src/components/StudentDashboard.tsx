import React, { useState } from 'react';
import { 
  Play, 
  Award, 
  Flame, 
  Zap, 
  BookOpen, 
  Clock, 
  Video, 
  ChevronRight, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  Compass, 
  Terminal, 
  HelpCircle,
  X,
  Bell
} from 'lucide-react';
import { StudentProgress, Course, LiveClass, Profile } from '../types';

interface StudentDashboardProps {
  currentUser: Profile;
  courses: Course[];
  liveClasses: LiveClass[];
  onResumeLesson: (courseId: string, lessonId: string) => void;
  onSelectCourse: (courseId: string) => void;
  onGoToLive: () => void;
  onGoToCertificates: () => void;
  onGoToQuiz: () => void;
}

export default function StudentDashboard({
  currentUser,
  courses,
  liveClasses,
  onResumeLesson,
  onSelectCourse,
  onGoToLive,
  onGoToCertificates,
  onGoToQuiz
}: StudentDashboardProps) {
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Analytical data mapping weekly XP gains (SVG chart)
  const chartData = [
    { day: 'Mon', xp: Math.round(currentUser.totalXp * 0.1) },
    { day: 'Tue', xp: Math.round(currentUser.totalXp * 0.25) },
    { day: 'Wed', xp: Math.round(currentUser.totalXp * 0.4) },
    { day: 'Thu', xp: Math.round(currentUser.totalXp * 0.6) },
    { day: 'Fri', xp: Math.round(currentUser.totalXp * 0.75) },
    { day: 'Sat', xp: Math.round(currentUser.totalXp * 0.9) },
    { day: 'Sun', xp: currentUser.totalXp }
  ];

  // SVG Chart Calculation Helpers
  const chartHeight = 140;
  const chartWidth = 460;
  const padding = 25;
  const maxXp = Math.max(currentUser.totalXp, 1000);

  const points = chartData.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
    const y = chartHeight - padding - (d.xp / maxXp) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  const enrolledCourses = courses; 
  const continueCourse = enrolledCourses[0]; 
  const resumeLesson = continueCourse?.lessons?.find(l => !l.isCompleted) || continueCourse?.lessons?.[0];

  const recentActivities = [
    { text: `Decrypted session token on Luvia Node`, time: '1 hour ago' },
    { text: `Unlocked ${currentUser.currentStreak} Day Learning Streak multiplier`, time: '12 hours ago' },
    { text: `Logged dynamic security session with role ${currentUser.role}`, time: 'Yesterday' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Collapsible Left Side Panel */}
      <aside className={`hidden md:flex flex-col border-r border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md transition-all duration-300 shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-900">
          {!sidebarCollapsed && <span className="text-xs font-mono font-bold tracking-wider text-slate-400">STUDENT TERMINAL</span>}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white mx-auto cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronRight className={`w-4 h-4 transform transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <div className="p-3 flex-1 space-y-2">
          {enrolledCourses.slice(0, 3).map((c, i) => (
            <button 
              key={c.id}
              onClick={() => onSelectCourse(c.id)}
              className="flex items-center space-x-3 w-full p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold cursor-pointer"
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${i % 2 === 0 ? 'text-blue-600' : 'text-purple-600'}`} />
              {!sidebarCollapsed && <span className="truncate">{c.title}</span>}
            </button>
          ))}
          <button 
            onClick={onGoToLive}
            className="flex items-center space-x-3 w-full p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold cursor-pointer"
          >
            <Video className="w-4 h-4 text-red-500 shrink-0" />
            {!sidebarCollapsed && <span className="truncate text-red-500 font-bold">Live Seminar</span>}
          </button>
          <button 
            onClick={onGoToCertificates}
            className="flex items-center space-x-3 w-full p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">My Accreditations</span>}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 m-4 bg-slate-100 dark:bg-slate-900 rounded-2xl space-y-2">
            <span className="block text-[9px] font-mono text-slate-400">YOUR WORKSPACE LEVEL</span>
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-xl text-blue-600 dark:text-cyan-400">LVL {Math.max(1, Math.floor(currentUser.totalXp / 1000))}</span>
              <span className="text-[10px] font-mono font-bold text-slate-500">ACTIVE ACCOUNT</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Dynamic View Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 space-y-8 overflow-y-auto">
        
        {/* Top Header Greetings */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-left">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Analyze your telemetry and continue your interactive study tracks below.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/20 uppercase font-bold">
              ROLE: {currentUser.role} PRIVILEGED NODE
            </span>
          </div>
        </section>

        {/* Dynamic Telemetry KPI summary grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Streak */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">ACTIVE STREAK</span>
              <span className="block font-display text-2xl font-bold text-amber-500">{currentUser.currentStreak} Days</span>
              <span className="block text-[9px] text-slate-500 font-mono">STREAK MULTIPLIER ACTIVE</span>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
          </div>

          {/* Card 2: Accumulated XP */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">ACCUMULATED EXPERIENCE</span>
              <span className="block font-display text-2xl font-bold text-indigo-500">{currentUser.totalXp} XP</span>
              <span className="block text-[9px] text-slate-500 font-mono">100% DYNAMIC SYNCHRONIZATION</span>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 fill-indigo-500" />
            </div>
          </div>

          {/* Card 3: Courses Enrolled */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">ACTIVE MODULES</span>
              <span className="block font-display text-2xl font-bold text-emerald-500">{enrolledCourses.length} Registered</span>
              <span className="block text-[9px] text-slate-500 font-mono">COURSES IN TRAINING REPOSITORY</span>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Next Milestone progress wheel */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">LEVEL PROGRESS</span>
              <span className="block font-display text-2xl font-bold text-blue-600 dark:text-cyan-400">{Math.round((currentUser.totalXp % 1000) / 10)}%</span>
              <span className="block text-[9px] text-slate-500 font-mono">TO NEXT EDUCATION MULTIPLIER</span>
            </div>
            
            {/* Custom SVG dynamic progress ring */}
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="transparent" stroke="rgba(156,163,175,0.15)" strokeWidth="4" />
                <circle cx="24" cy="24" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={113} strokeDashoffset={113 - (113 * ((currentUser.totalXp % 1000) / 10)) / 100} className="text-blue-600 dark:text-cyan-400" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono">{Math.round((currentUser.totalXp % 1000) / 10)}%</div>
            </div>
          </div>

        </section>

        {/* Main Columns: Left (Activity & Resume), Right (Analytics & Seminars) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 7/12 layout */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Continue Learning interactive capsule */}
            {continueCourse ? (
              <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 rounded-3xl text-white text-left relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-blue-600 to-purple-600 blur-3xl opacity-20 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      <span>CURATED SYLLABUS RESUME</span>
                    </div>
                    
                    <h3 className="font-display font-bold text-xl text-white">{continueCourse.title}</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Next lesson: <span className="text-white font-semibold">{resumeLesson?.title || 'No lessons published'}</span>
                    </p>

                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                        <span>MODULES PASSED</span>
                        <span>{continueCourse.lessons.length} LESSONS TOTAL</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[16%]" />
                      </div>
                    </div>
                  </div>

                  {resumeLesson && (
                    <button
                      onClick={() => onResumeLesson(continueCourse.id, resumeLesson.id)}
                      className="px-6 py-4 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-2xl text-xs transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer border-none"
                      id="resume-video-btn"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Resume Player</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl text-center space-y-4">
                <BookOpen className="w-12 h-12 mx-auto text-slate-500" />
                <h3 className="font-display text-lg font-bold">No active enrollments detected</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Explore our syllabus grid to initialize high-fidelity modules directly on your profile.</p>
              </div>
            )}

            {/* Weekly Analytics Section with SVG graph */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg">Weekly Experience Telemetry</h3>
                  <p className="text-xs text-slate-400 font-light">Interactive tracking of learning points accrued in the current session cycle.</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-emerald-500 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+45% AVG</span>
                </div>
              </div>

              {/* High-Fidelity SVG Curve Chart with hover nodes */}
              <div className="relative w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3].map((g) => (
                    <line
                      key={g}
                      x1={padding}
                      y1={padding + (g * (chartHeight - padding * 2)) / 3}
                      x2={chartWidth - padding}
                      y2={padding + (g * (chartHeight - padding * 2)) / 3}
                      stroke="rgba(148, 163, 184, 0.08)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Gradient area beneath path */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
                    fill="url(#chartGlow)"
                  />

                  {/* Main animated path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>

                  {/* Hover interactive coordinate nodes */}
                  {points.map((p, idx) => (
                    <g 
                      key={idx} 
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredMetric(idx)}
                      onMouseLeave={() => setHoveredMetric(null)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredMetric === idx ? '6' : '4'}
                        fill={hoveredMetric === idx ? '#3b82f6' : 'currentColor'}
                        className="text-white dark:text-slate-900 stroke-blue-500 stroke-2 transition-all"
                      />
                      
                      {/* Active coordinates value popovers */}
                      {hoveredMetric === idx && (
                        <g transform={`translate(${p.x - 30}, ${p.y - 30})`}>
                          <rect width="60" height="22" rx="6" fill="#0f172a" />
                          <text x="30" y="14" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {p.xp} XP
                          </text>
                        </g>
                      )}
                    </g>
                  ))}

                  {/* X Axis labels */}
                  {points.map((p, idx) => (
                    <text
                      key={idx}
                      x={p.x}
                      y={chartHeight - 6}
                      fill="rgba(148, 163, 184, 0.6)"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {p.day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Quick action buttons list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={onGoToQuiz}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-blue-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow"
              >
                <Terminal className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold truncate">Practice Quiz</span>
              </button>
              <button 
                onClick={onGoToLive}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-red-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow"
              >
                <Video className="w-5 h-5 mx-auto text-red-500 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold truncate">Join Seminar</span>
              </button>
              <button 
                onClick={onGoToCertificates}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-amber-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow"
              >
                <Award className="w-5 h-5 mx-auto text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold truncate">My Certificates</span>
              </button>
              <button 
                onClick={() => onSelectCourse(courses[0]?.id || '')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-purple-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow"
              >
                <Compass className="w-5 h-5 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold truncate">Audit Grids</span>
              </button>
            </div>

          </div>

          {/* Right Column: 5/12 layout */}
          <div className="lg:col-span-5 space-y-8 text-left">
            
            {/* Live Class Waiting Room Indicator */}
            {liveClasses.map((lc) => (
              <div 
                key={lc.id}
                className={`p-5 rounded-3xl border text-left space-y-3 transition-all relative overflow-hidden group shadow-sm ${
                  lc.isLive 
                    ? 'bg-rose-500/5 border-rose-500/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${lc.isLive ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wide">
                      {lc.isLive ? 'ACTIVE LIVE NOW' : 'UPCOMING SEMINAR'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{lc.participantsCount} WATCHING</span>
                </div>

                <h4 className="font-display font-bold text-sm leading-snug">{lc.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-light">{lc.description}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/40">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bold">Guide: {lc.speaker}</span>
                  <button
                    onClick={onGoToLive}
                    className="px-4 py-2 bg-slate-950 dark:bg-slate-850 hover:bg-red-600 dark:hover:bg-red-600 text-white font-bold rounded-xl text-[10px] uppercase transition-colors cursor-pointer border-none"
                  >
                    Enter Room
                  </button>
                </div>
              </div>
            ))}

            {/* Calendar widget module */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4.5 h-4.5 text-blue-600" />
                  <span className="font-display font-bold text-sm">Study Calendar</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">JULY 2026</span>
              </div>

              {/* Simple calendar layout mock */}
              <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[9px] font-semibold text-slate-400">
                <span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span><span>SU</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono">
                {[...Array(12)].map((_, i) => <span key={i} className="text-slate-300 py-1">{20 + i}</span>)}
                <span className="bg-blue-600 text-white rounded-lg py-1 font-bold">12</span>
                <span className="bg-purple-600 text-white rounded-lg py-1 font-bold">13</span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg py-1 font-bold border border-blue-500">14</span>
                {[...Array(15)].map((_, i) => <span key={i} className="text-slate-600 dark:text-slate-400 py-1">{15 + i}</span>)}
              </div>
            </div>

            {/* Activity feed logs list */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm">
              <h4 className="font-display font-bold text-sm">Workspace Activity Logs</h4>
              <div className="space-y-4">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs leading-normal">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-slate-300 font-light">{act.text}</p>
                      <span className="text-[10px] font-mono text-slate-400">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}
