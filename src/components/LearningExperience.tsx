import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  BookOpen, 
  Download, 
  MessageSquare, 
  Bookmark, 
  Keyboard, 
  Maximize, 
  Volume2, 
  Lock, 
  Tv, 
  Eye, 
  EyeOff, 
  Award, 
  Send,
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, Lesson, UserComment } from '../types';

interface LearningExperienceProps {
  courseId: string;
  courses: Course[];
  activeLessonId?: string;
  onCompleteLesson: (lessonId: string, xpAwarded: number) => void;
  onGoBack: () => void;
}

export default function LearningExperience({
  courseId,
  courses,
  activeLessonId,
  onCompleteLesson,
  onGoBack
}: LearningExperienceProps) {
  const course = courses.find(c => c.id === courseId) || courses[0];
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // mock duration seconds
  const [ambientGlow, setAmbientGlow] = useState('from-blue-600/20 to-purple-600/20');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [notesList, setNotesList] = useState<{ id: number; timestamp: string; text: string }[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showShortcutsInfo, setShowShortcutsInfo] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (course && course.lessons) {
      const selected = course.lessons.find(l => l.id === activeLessonId) || course.lessons[0];
      setActiveLesson(selected);
    }
  }, [courseId, activeLessonId, course]);

  // Sync ambient lighting shadows on lesson shift
  useEffect(() => {
    if (!activeLesson) return;
    if (activeLesson.id.endsWith('l1')) {
      setAmbientGlow('from-blue-600/30 to-purple-600/30');
    } else if (activeLesson.id.endsWith('l2')) {
      setAmbientGlow('from-purple-600/30 to-rose-600/30');
    } else {
      setAmbientGlow('from-cyan-400/30 to-indigo-600/30');
    }
    // Set video back to zero on shift
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, [activeLesson]);

  // Register Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Avoid hotkeys if typing in inputs or textareas
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        const nextSecs = Math.floor(videoRef.current?.currentTime || currentTime);
        addNoteAtTime(nextSecs);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const addNoteAtTime = (secs: number) => {
    const timestampStr = formatTime(secs);
    const newNote = {
      id: Date.now(),
      timestamp: timestampStr,
      text: `Draft note at ${timestampStr} - Enter thoughts here...`
    };
    setNotesList(prev => [newNote, ...prev]);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added: UserComment = {
      id: `comment-${Date.now()}`,
      authorName: 'Alex Mercer',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      content: newComment,
      timestamp: 'Just now',
      reactions: [
        { emoji: '🔥', count: 0 }
      ]
    };

    setComments(prev => [...prev, added]);
    setNewComment('');
  };

  const toggleReaction = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const reactions = c.reactions.map(r => {
          if (r.emoji === emoji) {
            const added = r.userReacted ? -1 : 1;
            return { ...r, count: r.count + added, userReacted: !r.userReacted };
          }
          return r;
        });
        return { ...c, reactions };
      }
      return c;
    }));
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const triggerCompletion = () => {
    if (!activeLesson) return;
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    setShowCelebration(true);
    activeLesson.isCompleted = true;
    onCompleteLesson(activeLesson.id, activeLesson.xp);
  };

  const selectNewLesson = (lesson: Lesson) => {
    if (lesson.isLocked) return;
    setActiveLesson(lesson);
  };

  if (!course || !activeLesson) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white">
        <h2 className="font-display text-xl font-bold">Module session initializing...</h2>
        <button onClick={onGoBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs uppercase font-bold cursor-pointer">
          Return
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans">
      
      {/* Ambient background blur sync layer */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] pointer-events-none z-0">
        <div className={`w-full h-full bg-gradient-to-r ${ambientGlow} blur-[120px] transition-all duration-1000 rounded-3xl opacity-50`} />
      </div>

      {/* Primary Video Screen Area */}
      <div className="max-w-7xl mx-auto px-6 pt-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Video Player column - 8/12 layout */}
        <div className="lg:col-span-8 text-left space-y-6">
          
          {/* Header row */}
          <div className="flex items-center justify-between">
            <button 
              onClick={onGoBack}
              className="text-xs font-mono font-bold tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent"
            >
              ← RETURN TO LANDSCAPE
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer bg-transparent ${
                  isFocusMode 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/20 text-slate-500 hover:text-slate-900'
                }`}
                title="Toggle focus mode hides comments and list"
              >
                {isFocusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isFocusMode ? 'FOCUS MODE ACTIVE' : 'FOCUS MODE'}</span>
              </button>

              <button
                onClick={() => setShowShortcutsInfo(!showShortcutsInfo)}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-slate-400 hover:text-slate-900 cursor-pointer"
                title="Keyboard shortcuts info"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showShortcutsInfo && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">KEYBOARD POWER ACTIONS</span>
                <button onClick={() => setShowShortcutsInfo(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd> Play / Pause</div>
                <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">F</kbd> Focus Mode</div>
                <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">N</kbd> Instant Note</div>
              </div>
            </div>
          )}

          {/* Actual Video Element Container */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/10 shadow-2xl group">
            
            <video
              ref={videoRef}
              src={activeLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Custom Interactive Floating overlay controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 space-y-4">
              
              {/* Timeline progress line bar */}
              <div 
                className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative"
                onClick={(e) => {
                  if (videoRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    videoRef.current.currentTime = percent * duration;
                  }
                }}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center space-x-4">
                  <button onClick={togglePlay} className="p-1 hover:text-cyan-400 cursor-pointer bg-transparent border-none">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current text-white" /> : <Play className="w-5 h-5 fill-current text-white" />}
                  </button>
                  <span className="font-mono text-[10px] tracking-wider text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-slate-300">
                  <Volume2 className="w-4.5 h-4.5" />
                  <span className="font-mono text-[10px] uppercase">{activeLesson.xp} XP</span>
                  <Maximize className="w-4.5 h-4.5 cursor-pointer" onClick={() => videoRef.current?.requestFullscreen()} />
                </div>
              </div>

            </div>
          </div>

          {/* Lesson details & Completion Checkbox */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl shadow-sm text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE CHAPTER MODULE</span>
              <h2 className="font-display font-bold text-lg">{activeLesson.title}</h2>
              <p className="text-xs text-slate-500">Unlocks {activeLesson.xp} XP points upon active session validation.</p>
            </div>

            <button
              onClick={triggerCompletion}
              className={`px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 cursor-pointer border-none ${
                activeLesson.isCompleted 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
              }`}
              id="complete-lesson-btn"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{activeLesson.isCompleted ? 'MODULE COMPLETED' : 'VALIDATE COMPLETION'}</span>
            </button>
          </div>

          {/* Tabs for Notes, Transcript and Comments */}
          {!isFocusMode && (
            <div className="space-y-6">
              
              {/* Lab Attachments Box */}
              {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-3 shadow-sm">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase">ACADEMIC ATTACHMENTS</span>
                  <div className="space-y-2">
                    {activeLesson.attachments.map((att, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-xs">
                        <span className="font-semibold">{att.name}</span>
                        <a href="#" className="flex items-center space-x-1.5 text-blue-600 dark:text-cyan-400 font-mono text-[10px] font-bold">
                          <Download className="w-3.5 h-3.5" />
                          <span>{att.size}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live transcript lines list */}
              {activeLesson.transcript && (
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">INTELLIGENT SCROLL TRANSCRIPT</span>
                    <span className="text-[9px] font-mono text-blue-600 dark:text-cyan-400 font-bold">● ACTIVE SYNC</span>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {activeLesson.transcript.map((line, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const [m, s] = line.time.split(':').map(Number);
                          if (videoRef.current) {
                            videoRef.current.currentTime = m * 60 + s;
                            setCurrentTime(m * 60 + s);
                            setIsPlaying(true);
                            videoRef.current.play().catch(() => {});
                          }
                        }}
                        className="w-full flex items-start space-x-4 text-left p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg text-xs leading-relaxed text-slate-600 dark:text-slate-400 cursor-pointer border-none bg-transparent"
                      >
                        <span className="font-mono text-[10px] text-blue-600 dark:text-cyan-400 font-bold mt-0.5 shrink-0">{line.time}</span>
                        <span className="font-light">{line.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes pad area */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm">
                <span className="block text-[10px] font-mono text-slate-400 uppercase">STUDY SCRATCHPAD</span>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Type notes and anchor them to timestamp..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/20 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    id="note-input"
                  />
                  <button
                    onClick={() => {
                      if (!notesText.trim()) return;
                      const added = {
                        id: Date.now(),
                        timestamp: formatTime(currentTime),
                        text: notesText
                      };
                      setNotesList(prev => [added, ...prev]);
                      setNotesText('');
                    }}
                    className="p-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {notesList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800/40">
                    {notesList.map((nt) => (
                      <div key={nt.id} className="flex justify-between items-start text-xs p-2 bg-slate-50 dark:bg-slate-950/20 rounded-xl">
                        <div className="space-x-2">
                          <span className="font-mono text-[9px] text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">{nt.timestamp}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-light">{nt.text}</span>
                        </div>
                        <button 
                          onClick={() => setNotesList(prev => prev.filter(x => x.id !== nt.id))}
                          className="text-slate-400 hover:text-slate-600 bg-transparent border-none"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamped Comments and feedback section */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base">Lecture Discussion Room</h3>
                
                <form onSubmit={handleAddComment} className="flex space-x-3 bg-white dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-800/60 rounded-2xl shadow-sm">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Contribute ideas to current timestamp..."
                    className="flex-1 px-3 py-2 bg-transparent text-xs focus:outline-none placeholder:text-slate-500"
                    id="comment-input"
                  />
                  <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl cursor-pointer border-none">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="space-y-4">
                  {comments.map((cm) => (
                    <div key={cm.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl text-left space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <img src={cm.authorAvatar} alt={cm.authorName} className="w-7 h-7 rounded-full object-cover" />
                          <div className="text-left">
                            <span className="block text-xs font-semibold">{cm.authorName}</span>
                            <span className="block text-[9px] font-mono text-slate-400">{cm.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                        {cm.content}
                      </p>

                      <div className="flex space-x-2 pt-1">
                        {cm.reactions.map((re, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => toggleReaction(cm.id, re.emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
                              re.userReacted 
                                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/10' 
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            <span>{re.emoji}</span>
                            <span>{re.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Floating Chapter Lesson navigation panel - 4/12 layout */}
        {!isFocusMode && (
          <div className="lg:col-span-4 text-left space-y-6">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-xl sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span className="font-display font-bold text-sm">Syllabus Index</span>
                <span className="text-[10px] font-mono text-slate-400">{(course.lessons || []).length} LESSONS</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {course.lessons && course.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    disabled={lesson.isLocked}
                    onClick={() => selectNewLesson(lesson)}
                    className={`w-full flex items-start justify-between p-3 rounded-xl transition-all border text-left cursor-pointer ${
                      activeLesson.id === lesson.id 
                        ? 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-cyan-400 font-bold' 
                        : lesson.isLocked 
                          ? 'opacity-40 border-transparent bg-transparent cursor-not-allowed' 
                          : 'border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 text-xs">
                      <span className="font-mono text-[9px] text-slate-400 mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        <span className="block truncate max-w-56">{lesson.title}</span>
                        <span className="block text-[9px] font-mono text-slate-400 mt-0.5">{lesson.duration} • {lesson.xp} XP</span>
                      </div>
                    </div>

                    {lesson.isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : lesson.isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modern Completion Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md p-8 bg-slate-900 border border-white/10 rounded-3xl text-center space-y-6 shadow-2xl text-white">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-3xl p-[1px] flex items-center justify-center shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Award className="w-10 h-10 text-cyan-400" />
              </div>
            </div>

            <div className="pt-8 space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">ACADEMIC DECISION MINTED</span>
              <h3 className="font-display text-2xl font-bold tracking-tight">Active Module Decrypted</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Congratulations Mercer! You have acquired <span className="font-bold text-white">+{activeLesson.xp} XP</span> and successfully registered completion of:
              </p>
              <span className="block text-xs font-semibold bg-slate-950 p-2.5 rounded-xl border border-white/5">{activeLesson.title}</span>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer border-none"
              >
                Close Logs
              </button>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  const nextIdx = course.lessons.findIndex(l => l.id === activeLesson.id) + 1;
                  if (nextIdx < course.lessons.length && !course.lessons[nextIdx].isLocked) {
                    setActiveLesson(course.lessons[nextIdx]);
                  } else {
                    onGoBack();
                  }
                }}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer border-none"
              >
                Next Lesson
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
