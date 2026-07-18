import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Lock, 
  Unlock, 
  Star, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Tag, 
  Award,
  Users,
  ShieldCheck
} from 'lucide-react';
import { Course, PlatformSettings } from '../types';
import { dbService } from '../lib/db';

interface CourseDetailsProps {
  courseId: string;
  courses: Course[];
  onStartCourse: (courseId: string) => void;
  onGoBack: () => void;
}

export default function CourseDetails({ courseId, courses, onStartCourse, onGoBack }: CourseDetailsProps) {
  const course = courses.find(c => c.id === courseId) || courses[0];
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0) {
      setExpandedLessons({ [course.lessons[0].id]: true });
    }
    const loadSettings = async () => {
      const s = await dbService.getSettings();
      setPlatformSettings(s);
    };
    loadSettings();
  }, [course]);

  const toggleLesson = (id: string) => {
    setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    setVoucherSuccess('');

    if (!voucherCode.trim()) return;

    try {
      const matched = await dbService.verifyVoucher(voucherCode.trim().toUpperCase());
      if (matched) {
        setDiscountPercent(matched.discountPercent);
        setVoucherSuccess(`Promo code verified successfully! Saved ${matched.discountPercent}% off.`);
      } else {
        setVoucherError('Invalid, inactive, or expired coupon code.');
        setDiscountPercent(0);
      }
    } catch (err: any) {
      setVoucherError('Validation system exception.');
      setDiscountPercent(0);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white">
        <h2 className="font-display text-xl font-bold">Course Blueprint not found</h2>
        <button onClick={onGoBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs uppercase font-bold cursor-pointer">
          Return to Explore
        </button>
      </div>
    );
  }

  const originalPrice = course.price;
  const finalPrice = originalPrice - (originalPrice * discountPercent) / 100;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans">
      
      {/* Visual Header Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img 
          src={course.coverImage} 
          alt={course.title} 
          className="w-full h-full object-cover brightness-50" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto z-10 text-left space-y-3">
          <button 
            onClick={onGoBack}
            className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-semibold text-white tracking-wide cursor-pointer transition-colors border-none"
          >
            ← Back to Explorations
          </button>
          
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-full text-[9px] font-mono font-bold text-white uppercase">
              {course.category}
            </span>
            <span className="px-3 py-1 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-full text-[9px] font-mono font-bold text-white uppercase">
              {course.difficulty} LEVEL
            </span>
          </div>

          <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-4xl">
            {course.title}
          </h1>
          
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-light">
            {course.subtitle}
          </p>
        </div>
      </div>

      {/* Main Grid: Description (Left) + Floating Purchase Sidebar (Right) */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Elements (Syllabus details) - 7/12 layout */}
        <div className="lg:col-span-7 text-left space-y-10">
          
          {/* Main commentary */}
          <div className="space-y-4">
            <h2 className="font-display text-xl md:text-2xl font-bold">Curator Commentary</h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light whitespace-pre-line">
              {course.description}
            </div>
          </div>

          {/* Outcomes list */}
          {course.outcomes && course.outcomes.length > 0 && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-display font-bold text-base">Key Skillset Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.outcomes.map((out, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">{out}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements list */}
          {course.requirements && course.requirements.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base">Prerequisites & Baseline Setup</h3>
              <ul className="space-y-2.5">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-center space-x-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400 font-light">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Accordion Chapter Syllabus list */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base">Interactive Lecture Timeline</h3>
            <p className="text-xs text-slate-400 font-light">Click modules to expand lecture scopes, available transcripts, and physical code assets.</p>

            <div className="space-y-3">
              {course.lessons && course.lessons.map((lesson) => {
                const isOpen = expandedLessons[lesson.id];
                return (
                  <div 
                    key={lesson.id} 
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => toggleLesson(lesson.id)}
                      className="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
                    >
                      <div className="flex items-center space-x-3 text-xs font-semibold">
                        {lesson.isLocked ? (
                          <Lock className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Unlock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        )}
                        <span>{lesson.title}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400">{lesson.duration}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-50 dark:border-slate-800/40 space-y-3 text-left">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-light">
                          {lesson.isLocked ? (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center space-x-1 font-mono text-[10px]">
                              <span>🔒 SECURE SHIELD ACTIVE. COMPLETE PRECEDING CHALLENGES TO DECRYPT.</span>
                            </span>
                          ) : (
                            <span>This active workspace sandbox focuses on spring configurations, variables, and interaction mechanics.</span>
                          )}
                        </div>

                        {!lesson.isLocked && lesson.attachments && (
                          <div className="space-y-2 pt-2">
                            <span className="block text-[9px] font-mono text-slate-400 uppercase">INCLUDED LAB ASSETS:</span>
                            <div className="flex flex-wrap gap-2">
                              {lesson.attachments.map((att, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 rounded-lg text-[10px] text-slate-700 dark:text-slate-300">
                                  {att.name} ({att.size})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor Bio Profile Card */}
          {course.instructor && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-3xl uppercase shrink-0">
                {course.instructor.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold uppercase">SYLLABUS DEVELOPER</span>
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">{course.instructor.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Expert educator guiding spatial systems and enterprise interface designs.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar (Pricing & Vouchers) - 5/12 layout */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Floating Pricing Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-xl space-y-6 text-left sticky top-24">
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">TUITION FEE SUMMARY</span>
              <div className="flex items-baseline space-x-2">
                <span className="font-display text-4xl font-extrabold text-slate-900 dark:text-white">${finalPrice.toFixed(2)}</span>
                {discountPercent > 0 && (
                  <span className="text-sm text-slate-400 line-through">${originalPrice.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onStartCourse(course.id)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-wide shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border-none"
                id="buy-course-btn"
              >
                <span>Initialize Module Decryption</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <span className="block text-[9px] text-slate-400 text-center font-mono uppercase">14-DAY MONEY-BACK QUALITY ACCORD</span>
            </div>

            {/* Voucher Redemption panel */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">COUPON REDEMPTION TOKEN</span>
              
              <form onSubmit={handleApplyVoucher} className="flex space-x-2">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="e.g. SYSTEM50"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/20 dark:border-slate-800 rounded-xl text-xs uppercase font-mono text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none"
                  id="voucher-input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl text-xs font-semibold cursor-pointer border-none"
                >
                  Apply
                </button>
              </form>

              {voucherError && <span className="block text-[10px] font-mono text-rose-500">{voucherError}</span>}
              {voucherSuccess && <span className="block text-[10px] font-mono text-emerald-500">{voucherSuccess}</span>}
            </div>

            {/* Structured specifications of tuition */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>LECTURE PACKS</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{course.lessons?.length || 0} Modules</span>
              </div>
              <div className="flex items-center justify-between">
                <span>XP REWARD MULTIPLIER</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">+{course.xpReward} XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span>DIGITAL CERTIFICATE</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">Verified QR Showcase</span>
              </div>
            </div>

            {/* WhatsApp Contact Action */}
            {platformSettings?.whatsappNumber && (
              <a 
                href={`https://wa.me/${platformSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold transition-colors border border-emerald-500/10"
                id="whatsapp-cta-link"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <span>Consult Syllabus on WhatsApp</span>
              </a>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
