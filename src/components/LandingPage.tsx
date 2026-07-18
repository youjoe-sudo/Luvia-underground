import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Zap, 
  Clock, 
  Layers, 
  Award, 
  Star, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  Keyboard, 
  MessageSquare,
  Bookmark,
  CheckCircle,
  Tag,
  PhoneCall
} from 'lucide-react';
import { Course, FAQ, Testimonial, PlatformSettings } from '../types';
import { dbService } from '../lib/db';

interface LandingPageProps {
  onSelectCourse: (courseId: string) => void;
  onStartLearning: () => void;
}

export default function LandingPage({ onSelectCourse, onStartLearning }: LandingPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  // Voucher Simulator
  const [vCode, setVCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);

  useEffect(() => {
    const loadLandingData = async () => {
      try {
        const liveCourses = await dbService.getCourses();
        const liveFaqs = await dbService.getFaqs();
        const liveTestimonials = await dbService.getTestimonials();
        const liveSettings = await dbService.getSettings();

        setCourses(liveCourses);
        setFaqs(liveFaqs);
        setTestimonials(liveTestimonials);
        setPlatformSettings(liveSettings);
      } catch (err) {
        console.error('Error loading dynamic landing assets:', err);
      }
    };
    loadLandingData();

    // Listen for custom settings changes event
    window.addEventListener('platformSettingsUpdated', loadLandingData);
    return () => window.removeEventListener('platformSettingsUpdated', loadLandingData);
  }, []);

  const handleVerifyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim()) return;

    try {
      const v = await dbService.verifyVoucher(vCode.toUpperCase());
      if (v) {
        setDiscountPercent(v.discountPercent);
        setCouponFeedback(`🎉 Code verified! ${v.discountPercent}% discount is active in your checkout drawer.`);
      } else {
        setDiscountPercent(null);
        setCouponFeedback('❌ Invalid or expired coupon code.');
      }
    } catch (err) {
      setDiscountPercent(null);
      setCouponFeedback('❌ Verification exception.');
    }
  };

  const stats = [
    { value: '14,000+', label: 'Active Thinkers' },
    { value: '99.8%', label: 'Completion Rate' },
    { value: '4.95 ★', label: 'Average Feedback' },
    { value: '120+', label: 'Digital Credentials' }
  ];

  const trustedBrands = [
    'Apple', 'Stripe', 'Linear', 'Notion', 'Framer', 'Arc', 'Raycast', 'Coursera', 'Superhuman'
  ];

  const categories = [
    { title: 'Design Engineering', count: `${courses.filter(c => c.category.toLowerCase().includes('design') || c.category.toLowerCase().includes('engine')).length} Blueprint(s)`, icon: Cpu, desc: 'Spring physics, hardware acceleration, gesture mechanics.' },
    { title: 'Interactive Code', count: `${courses.filter(c => c.category.toLowerCase().includes('code') || c.category.toLowerCase().includes('react')).length} Blueprint(s)`, icon: Terminal, desc: 'Translating visual motion formulas into production React.' },
    { title: 'Systems Architecting', count: `${courses.filter(c => c.category.toLowerCase().includes('system')).length} Blueprint(s)`, icon: ShieldCheck, desc: 'Establishing unified guidelines, variables, and specs.' },
    { title: 'Product Design', count: '1 Available', icon: Layers, desc: 'Spatial grids, advanced typography hierarchy, negative space.' }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden font-sans">
      
      {/* Immersive Animated Gradient Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-30">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/30 blur-[100px]" />
        <div className="absolute top-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute top-[30%] left-[25%] w-[300px] h-[300px] rounded-full bg-cyan-400/20 blur-[80px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Text details */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 rounded-full text-xs font-mono font-bold text-blue-700 dark:text-cyan-400 tracking-wide animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A NEW ERA OF DESIGN ACCREDITATION</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
            {platformSettings?.heroTitle || 'Where Code meets Visual Mastery.'}
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl font-light leading-relaxed">
            {platformSettings?.heroSubtitle || 'Forget ordinary templates. Imprint Apple-grade interactions, advanced spring physics, spatial layout grids, and pristine micro-interactions directly into your muscle memory.'}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={onStartLearning}
              className="group relative flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              id="hero-start-btn"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#courses-showcase"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 hover:dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl font-semibold border border-slate-200 dark:border-slate-800 transition-all duration-300 cursor-pointer"
              id="hero-browse-btn"
            >
              <Play className="w-4 h-4 text-blue-600" />
              <span>Browse Courses</span>
            </a>
          </div>

          {/* KPI Dashboard Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-200/50 dark:border-slate-800/40">
            {stats.map((st, i) => (
              <div key={i} className="text-left">
                <span className="block font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{st.value}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 uppercase tracking-wide">{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3D Floating L Logo Panel */}
        <div className="lg:col-span-5 flex justify-center items-center relative py-12">
          {/* Logo backdrop glowing orb */}
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-[80px] opacity-40 animate-pulse" />
          
          <div className="relative w-80 h-80 flex items-center justify-center bg-white/10 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-800/80 shadow-2xl overflow-hidden group">
            
            {/* Ambient lighting mesh wrapper */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-cyan-500/10" />

            {/* Simulated 3D Rotating floating Glass "L" Card */}
            <div className="relative flex flex-col items-center justify-center w-48 h-48 rounded-[2rem] bg-gradient-to-tr from-white/20 via-white/40 to-white/10 dark:from-slate-950/30 dark:to-slate-900/50 p-1 border border-white/30 dark:border-slate-800/60 shadow-inner transform transition-transform duration-700 hover:scale-105 group-hover:rotate-6">
              
              <div className="flex items-center justify-center w-full h-full bg-white dark:bg-slate-950 rounded-[1.8rem] relative shadow-lg">
                {/* Embedded custom golden typography */}
                <span className="font-display font-extrabold text-9xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  {(platformSettings?.platformName || 'Luvia').charAt(0)}
                </span>
                
                {/* Floating particles around letter */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
              </div>
            </div>

            {/* Glowing border overlays */}
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-900 text-center">
              <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase font-bold block">PLATFORM RECONSTRUCTED V2.16</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mt-0.5 block">100% Secure Client Node</span>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Logo Carousel */}
      <section className="py-12 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-8">
            TRUSTED BY PRODUCT BUILDERS FROM LEADING SAAS COMPANIES
          </p>
          
          <div className="relative flex items-center justify-center">
            {/* Fade overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
            
            <div className="flex space-x-12 animate-infinite-scroll overflow-hidden whitespace-nowrap">
              {/* Duplicate logos to allow seamless loop scrolling */}
              {[...trustedBrands, ...trustedBrands].map((brand, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center space-x-2 font-display text-lg font-bold text-slate-400 hover:text-slate-800 dark:text-slate-600 dark:hover:text-slate-200 transition-colors duration-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">EXPERTISE SECTORS</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Structured Knowledge Landscapes</h2>
          <p className="text-slate-500 dark:text-slate-400 font-light">Break free from fragmented tutorials. Transition through architectural modules developed by veteran designers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div 
                key={idx} 
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/40 hover:border-blue-500/50 dark:hover:border-cyan-400/50 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">{cat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{cat.desc}</p>
                <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">{cat.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Courses Segment */}
      <section id="courses-showcase" className="py-20 bg-white/40 dark:bg-slate-900/10 border-y border-slate-100 dark:border-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">CURATED EXPERIENCES</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Active Learning Blueprints</h2>
              <p className="text-slate-500 dark:text-slate-400 font-light max-w-xl">Deep, immersive certification modules featuring high-resolution interactive screens and direct evaluation.</p>
            </div>
            
            <button 
              onClick={onStartLearning} 
              className="self-start md:self-auto flex items-center space-x-2 text-sm font-semibold text-blue-600 dark:text-cyan-400 group cursor-pointer font-bold"
            >
              <span>Explore full syllabus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                onMouseEnter={() => setHoveredCourseId(course.id)}
                onMouseLeave={() => setHoveredCourseId(null)}
                onClick={() => onSelectCourse(course.id)}
                className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-500/20 dark:hover:border-cyan-400/20 transition-all duration-500 cursor-pointer text-left"
                id={`featured-course-card-${course.id}`}
              >
                {/* Cover Image with gradient overlay */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={course.coverImage} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Floating badges on image */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className={`px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider ${
                      course.difficulty === 'Advanced' ? 'bg-red-500/30' : 'bg-amber-500/30'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-white text-[10px] uppercase">
                        {course.instructor?.name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold">{course.instructor?.name || 'Lead Architect'}</span>
                        <span className="block text-[9px] text-slate-300 font-mono uppercase">INSTRUCTOR</span>
                      </div>
                    </div>
                    <div className="bg-white/25 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-white">
                      {course.duration}
                    </div>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-bold mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span>4.95 FEEDBACK RATING</span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-light line-clamp-2">
                      {course.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">TUITION COST</span>
                      <span className="block font-display text-2xl font-bold text-slate-900 dark:text-white">${course.price}</span>
                    </div>

                    <button
                      className="flex items-center space-x-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-cyan-500 hover:text-white dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all duration-300 group-hover:translate-x-1 cursor-pointer"
                    >
                      <span>Syllabus details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Coupon verification drawer */}
      <section className="py-16 max-w-3xl mx-auto px-6 text-left">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-cyan-400">
            <Tag className="w-5 h-5 animate-bounce" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">SECURE PROMO VALIDATION GATEWAY</span>
          </div>
          <h3 className="font-display font-bold text-lg">Verify Dynamic Vouchers</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            Got an invitation code or discount from our newsletter or support network? Run it here to lock in your tuition discount.
          </p>

          <form onSubmit={handleVerifyCoupon} className="flex gap-2">
            <input 
              type="text" 
              value={vCode}
              onChange={(e) => setVCode(e.target.value)}
              placeholder="e.g. LUVIA20"
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/10 rounded-xl text-xs font-mono uppercase"
            />
            <button className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer">
              Verify
            </button>
          </form>
          {couponFeedback && (
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
              {couponFeedback}
            </p>
          )}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-white/40 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-900/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">SYSTEM CLEARING</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Queries</h2>
            <p className="text-slate-500 dark:text-slate-400 font-light">Everything you need to know about our visual and pedagogical layout.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 overflow-hidden transition-all text-left"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left font-display font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light border-t border-slate-50 dark:border-slate-800/40 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Direct Contact Floating Call to action (WhatsApp link in branding) */}
      {platformSettings?.whatsappNumber && (
        <section className="py-12 bg-blue-600/10 border-y border-blue-600/10 max-w-5xl mx-auto rounded-3xl my-10 px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <span className="block text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold uppercase tracking-widest">LIVE WORKSPACE COUNSELING</span>
            <h4 className="font-display text-lg font-bold">Have individual tuition or syllabus questions?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Connect directly with our Lead Architect via secure WhatsApp pipeline.</p>
          </div>
          <a 
            href={`https://wa.me/${platformSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span>Chat via WhatsApp {platformSettings.whatsappNumber}</span>
          </a>
        </section>
      )}

      {/* High-End Bottom CTA */}
      <section className="py-20 relative overflow-hidden text-center bg-slate-950 text-white border-t border-slate-900">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">IMMEDIATE COGNITIVE LAUNCH</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Stop Consuming. <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Start Crafting.</span>
          </h2>
          <p className="text-slate-400 font-light max-w-xl mx-auto leading-relaxed text-sm">
            Unlock the engineering visual guidelines of Linear, Apple, and Stripe. Join thousands of design engineers today.
          </p>

          <div className="flex justify-center pt-2">
            <button
              onClick={onStartLearning}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white rounded-2xl font-semibold shadow-2xl transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center space-x-2 border-none"
              id="bottom-cta-btn"
            >
              <span>Initialize My Access</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-display font-bold text-white text-xs">L</div>
            <span className="font-display font-bold text-slate-900 dark:text-white tracking-tight">{platformSettings?.platformName || 'Luvia'} Platforms</span>
          </div>

          <div className="flex space-x-6 text-slate-500 dark:text-slate-400">
            <span className="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer">Syllabus Guidelines</span>
            <span className="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer">Cryptographic Security</span>
            <span className="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer">Whiteboard Specs</span>
          </div>

          <div className="font-mono text-[10px] text-slate-400">
            © 2026 {platformSettings?.platformName || 'LUVIA'} INC. ALL RIGHTS RESERVED. SECURED VIA DESKTOP PROTOCOL.
          </div>
        </div>
      </footer>

    </div>
  );
}
