import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  User, 
  Mail, 
  Settings, 
  MessageSquare,
  Globe, 
  Plus, 
  Trash2, 
  Cpu, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { dbService } from '../lib/db';
import { PlatformSettings } from '../types';

interface PlatformSetupProps {
  onSetupComplete: () => void;
}

export default function PlatformSetup({ onSetupComplete }: PlatformSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Admin Credentials
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Step 2: Platform Settings
  const [platformName, setPlatformName] = useState('Luvia');
  const [platformDescription, setPlatformDescription] = useState('Minimalist Educational SaaS for elite software creatives.');
  const [whatsappNumber, setWhatsappNumber] = useState('+1 (555) 019-2834');
  const [heroTitle, setHeroTitle] = useState('Deconstruct High-End Interface Engineering');
  const [heroSubtitle, setHeroSubtitle] = useState('Immersive, physics-based courses breaking down secret motion guidelines and spatial layout design systems.');

  // Step 3: First Course creation
  const [courseTitle, setCourseTitle] = useState('Advanced Interaction Design & Spring Physics');
  const [courseSubtitle, setCourseSubtitle] = useState('Learn the secret animation rules used by Apple, Linear, and Stripe.');
  const [coursePrice, setCoursePrice] = useState('199');
  const [courseDifficulty, setCourseDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Advanced');
  const [courseCategory, setCourseCategory] = useState('Design Engineering');
  const [courseDuration, setCourseDuration] = useState('12h 45m');
  const [courseDescription, setCourseDescription] = useState('Deconstruct Framer, Linear, and macOS custom spring dynamics, micro-interactions, and responsive sizing.');
  const [outcomes, setOutcomes] = useState<string[]>([
    'Master spring stiffness and damping ratios',
    'Design hardware-accelerated fluid UI transitions'
  ]);
  const [newOutcome, setNewOutcome] = useState('');

  const addOutcome = () => {
    if (newOutcome.trim() && !outcomes.includes(newOutcome.trim())) {
      setOutcomes([...outcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const removeOutcome = (index: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!adminName.trim() || !adminEmail.trim()) {
        setError('Super Admin name and secure email are strictly required.');
        return;
      }
      if (!adminEmail.includes('@')) {
        setError('Please input a valid administrative email.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!platformName.trim() || !heroTitle.trim() || !whatsappNumber.trim()) {
        setError('Platform identity configuration requires all fields.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalizeSetup = async () => {
    setError('');
    setIsLoading(true);
    try {
      // 1. Create Super Admin Profile
      const adminProfile = await dbService.signUp(adminEmail, adminName, 'admin');

      // 2. Save Platform Settings
      const settings: PlatformSettings = {
        platformName,
        platformDescription,
        whatsappNumber,
        heroTitle,
        heroSubtitle,
        bannerMessage: `🎉 Welcome to ${platformName}! Custom enrollment is now live.`
      };
      await dbService.updateSettings(settings);

      // 3. Create First Curated Course
      if (courseTitle.trim()) {
        const createdCourse = await dbService.createCourse({
          title: courseTitle,
          subtitle: courseSubtitle,
          duration: courseDuration,
          xpReward: 1200,
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          category: courseCategory,
          description: courseDescription,
          outcomes,
          requirements: ['Basic familiarity with React and Tailwind CSS', 'An appetite for pixel-perfection'],
          price: Number(coursePrice),
          difficulty: courseDifficulty,
          instructorId: adminProfile.id
        });

        // 4. Create first default lesson inside that course
        await dbService.createLesson(createdCourse.id, {
          title: 'Deconstructing Apple & Linear Motion Mechanics',
          duration: '14:20',
          videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          isLocked: false,
          xp: 150,
          attachments: [
            { name: 'Linear Animation Specs.pdf', size: '2.4 MB', url: '#' }
          ],
          transcript: [
            { time: '0:05', text: 'Welcome to your premium dashboard environment.' },
            { time: '1:12', text: 'Today, we deconstruct why physical springs feel faster than standard easing.' }
          ]
        });
      }

      setIsLoading(false);
      onSetupComplete();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'An error occurred during system provisioning.');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 overflow-hidden">
      
      {/* Background aesthetic blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl space-y-8">
        
        {/* Header Indicator */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 rounded-xl">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] font-mono tracking-widest text-cyan-400 font-bold">LUVIA PROTOCOL INITIALIZATION</span>
              <h1 className="font-display text-xl font-bold tracking-tight">Enterprise Setup Wizard</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
            <span className={step === 1 ? 'text-white font-bold' : ''}>01</span>
            <span>/</span>
            <span className={step === 2 ? 'text-white font-bold' : ''}>02</span>
            <span>/</span>
            <span className={step === 3 ? 'text-white font-bold' : ''}>03</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-left">
            {error}
          </div>
        )}

        {/* Step 1: Create Super Admin */}
        {step === 1 && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="font-display text-lg font-bold">Establish Administrator Identity</h2>
              <p className="text-xs text-slate-400 mt-1 font-light">As the first user on this Luvia deployment, your account is automatically provisioned with the highest Super Admin security clearance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">SUPER ADMIN NAME</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">SECURE ADMINISTRATIVE EMAIL</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@luviaclass.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Next: Customize Branding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Platform Settings */}
        {step === 2 && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="font-display text-lg font-bold">Customize Platform Persona</h2>
              <p className="text-xs text-slate-400 mt-1 font-light">Set up details that will populate the dynamic landing page and navigation headers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">PLATFORM PUBLIC NAME</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">WHATSAPP SUPPORT NUMBER</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">LANDING HERO HEADING</label>
                <input 
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">LANDING HERO SUBTITLE / MISSION</label>
                <textarea 
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3.5 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold uppercase transition-all hover:bg-slate-800 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Next: Instantiate Syllabus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Instantiate Syllabus */}
        {step === 3 && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="font-display text-lg font-bold">Instantiate First Course Blueprint</h2>
              <p className="text-xs text-slate-400 mt-1 font-light">To guarantee immediate visual feedback, initialize Luvia with your first high-end education course. All content stays fully editable.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">COURSE TITLE</label>
                  <input 
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">TUITION FEE ($)</label>
                  <input 
                    type="number"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">DIFFICULTY</label>
                  <select 
                    value={courseDifficulty}
                    onChange={(e) => setCourseDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">CATEGORY</label>
                  <input 
                    type="text"
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase">DURATION</label>
                  <input 
                    type="text"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Outcomes CMS list */}
              <div className="space-y-2">
                <label className="block text-[9px] font-mono text-slate-400 uppercase">LEARNING OUTCOMES</label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="Add specific mastery point..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                  <button 
                    onClick={addOutcome}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {outcomes.map((out, i) => (
                    <div key={i} className="flex items-center space-x-1 px-2.5 py-1 bg-slate-950 border border-white/5 text-[10px] rounded-lg">
                      <span className="text-slate-300">{out}</span>
                      <button onClick={() => removeOutcome(i)} className="text-slate-500 hover:text-white cursor-pointer">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                disabled={isLoading}
                onClick={() => setStep(2)}
                className="px-6 py-3.5 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold uppercase transition-all hover:bg-slate-800 cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={isLoading}
                onClick={handleFinalizeSetup}
                className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Initialize Enterprise Workspace</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
