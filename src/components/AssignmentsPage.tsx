import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  HelpCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  ShieldCheck, 
  Flame, 
  Sparkles,
  Zap
} from 'lucide-react';
import { QuizQuestion } from '../types';

interface AssignmentsPageProps {
  onQuizComplete: (xpEarned: number) => void;
  onGoBack: () => void;
}

const localQuizQuestions: QuizQuestion[] = [
  {
    id: 'q-1',
    question: 'Why does Apple recommend using spring animations over standard cubic-bezier curves for fluid interfaces?',
    options: [
      'Springs look slightly cooler on mobile devices.',
      'Springs dynamically calculate velocity, mass, and drag based on physical properties, ensuring organic tracking and continuous velocity.',
      'Springs consume less CPU power and reduce background battery drain.',
      'Springs force the browser to skip the compositing step of rendering.'
    ],
    correctAnswer: 1,
    explanation: 'Physical springs do not have a fixed time duration. Instead, they respond directly to mass, stiffness, and starting velocities, providing fluid continuity without sudden, artificial deceleration hooks.'
  },
  {
    id: 'q-2',
    question: 'In minimalist typography, what is the primary purpose of tight tracking (letter-spacing) on extra large display headings?',
    options: [
      'To squeeze more words onto a single line.',
      'To match old newspaper print styles.',
      'To increase typographical density and create a cohesive, authoritative block aesthetic that feels integrated.',
      'To satisfy search engine crawling algorithms.'
    ],
    correctAnswer: 2,
    explanation: 'Tight letter-spacing on display sizes (32px+) pulls the characters together, improving word shape recognition and providing a cohesive, premium, and structured visual lockup.'
  },
  {
    id: 'q-3',
    question: 'Which CSS property configuration is critical for hardware-accelerated, high-fidelity glassmorphism blurs?',
    options: [
      'filter: blur(10px) with transform: scale(0.9)',
      'background: rgba(...) combined with backdrop-filter: blur(...) and will-change: transform/backdrop-filter',
      'border-width: 4px with box-shadow: inset',
      'mix-blend-mode: color-burn and contrast: 150%'
    ],
    correctAnswer: 1,
    explanation: 'By pairing transparent alpha values in the background with backdrop-filter: blur(...) and marking key layers with will-change, the browser leverages the GPU for smooth real-time compositor blending during scrolling.'
  }
];

export default function AssignmentsPage({ onQuizComplete, onGoBack }: AssignmentsPageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(180); // 3 minutes total
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const activeQuestion = localQuizQuestions[currentIdx];

  // Active Timer Countdown
  useEffect(() => {
    if (isFinished) return;
    if (secondsRemaining <= 0) {
      setIsFinished(true);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, isFinished]);

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || hasSubmitted) return;
    
    setHasSubmitted(true);
    const newAnswers = { ...userAnswers, [currentIdx]: selectedAnswer };
    setUserAnswers(newAnswers);

    if (selectedAnswer === activeQuestion.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setHasSubmitted(false);

    if (currentIdx < localQuizQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
      onQuizComplete(correctCount * 300); // 300 XP per correct answer
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setCorrectCount(0);
    setIsFinished(false);
    setSecondsRemaining(180);
    setUserAnswers({});
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const scorePercentage = Math.round((correctCount / localQuizQuestions.length) * 100);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans text-left">
      
      {/* Visual Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onGoBack}
            className="text-xs font-mono font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer border-none bg-transparent"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl font-mono text-xs font-bold border border-solid border-rose-500/15">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>TIME REMAINING: {formatTimer(secondsRemaining)}</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">ACTIVE CHALLENGE ASSIGNMENT</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mt-1">UX/UI Cognitive Validation Exam</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Validate your design engineering and spring calculus credentials.</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>EXAM COMPLETION BAR</span>
            <span>QUESTION {currentIdx + 1} OF {localQuizQuestions.length}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${((currentIdx + (hasSubmitted ? 1 : 0)) / localQuizQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main interactive segment */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        {!isFinished ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            
            <div className="space-y-4">
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-slate-850 text-blue-600 dark:text-cyan-400 rounded-lg text-[10px] font-mono font-bold uppercase">
                COGNITIVE DILEMMA
              </span>
              <h2 className="font-display font-bold text-lg md:text-xl text-slate-900 dark:text-white leading-snug">
                {activeQuestion.question}
              </h2>
            </div>

            {/* Selection Options */}
            <div className="space-y-3 pt-2">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOption = idx === activeQuestion.correctAnswer;
                
                let optionStyle = 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-850 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                if (isSelected) {
                  optionStyle = 'bg-blue-500/5 border-blue-500 text-blue-600 dark:text-cyan-400 font-bold';
                }
                
                if (hasSubmitted) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'bg-rose-500/10 border-rose-500 text-rose-500';
                  } else {
                    optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-transparent text-slate-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4.5 rounded-2xl border border-solid text-left text-xs md:text-sm transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="flex-1 leading-relaxed font-light">{option}</span>
                    
                    {hasSubmitted && isCorrectOption && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    {hasSubmitted && isSelected && !isCorrectOption && (
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {hasSubmitted && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/20 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-slate-400">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>CURATOR EXPLANATION</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  {activeQuestion.explanation}
                </p>
              </div>
            )}

            {/* Control triggers */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400">SECURED LOCAL PACKET</span>
              
              {!hasSubmitted ? (
                <button
                  disabled={selectedAnswer === null}
                  onClick={handleAnswerSubmit}
                  className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer border-none"
                  id="quiz-submit-btn"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center space-x-1.5 border-none"
                  id="quiz-next-btn"
                >
                  <span>{currentIdx < localQuizQuestions.length - 1 ? 'Next Challenge' : 'Complete Assignment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ) : (
          /* Finished score dashboard visualization */
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 text-center text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-md mx-auto space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1.5px] mx-auto">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Award className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">TELEMETRY RECEIVED</span>
                <h2 className="font-display text-3xl font-bold tracking-tight">Assignment Concluded</h2>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Excellent focus Mercer! Your evaluations have been integrated into our design system databases.
                </p>
              </div>

              {/* Dynamic Score Ring */}
              <div className="py-4">
                <div className="relative w-28 h-28 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="56" cy="56" r="48" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={301} strokeDashoffset={301 - (301 * scorePercentage) / 100} className="text-cyan-400" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl font-black">{scorePercentage}%</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{correctCount} / {localQuizQuestions.length} CORRECT</span>
                  </div>
                </div>
              </div>

              {/* Custom suggestions performance guidelines */}
              <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl text-left space-y-3">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>RECOMMENDED REINFORCEMENTS:</span>
                </div>
                
                {scorePercentage >= 80 ? (
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    You have achieved elite proficiency. We recommend enrolling in <span className="text-white font-semibold">"SaaS Design Systems at Scale"</span> or exploring advanced layout morph guidelines.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Good attempt. We suggest reviewing <span className="text-white font-semibold">"The Mathematics of Springs"</span> segment and trying the interactive quiz again to solidify parameters.
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleResetQuiz}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 border-none"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Exam</span>
                </button>
                
                <button
                  onClick={onGoBack}
                  className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer border-none"
                >
                  Return to Dashboard
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
