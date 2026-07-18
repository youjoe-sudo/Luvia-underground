import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Github, 
  Twitter, 
  Chrome, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { dbService } from '../lib/db';
import { Profile } from '../types';

interface AuthPageProps {
  onAuthSuccess: (profile: Profile) => void;
  onCancel: () => void;
}

type AuthMode = 'signin' | 'signup' | 'verify';

export default function AuthPage({ onAuthSuccess, onCancel }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-rose-500' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');

  // Password evaluation score
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Empty', color: 'bg-slate-200' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score === 2) {
      label = 'Moderate';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Strong';
      color = 'bg-emerald-500';
    } else if (score === 4) {
      label = 'Apple-Grade Enterprise';
      color = 'bg-cyan-500 shadow-md shadow-cyan-500/20';
    }

    setPasswordStrength({ score, label, color });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signin') {
      if (!email || !password) {
        setError('Please fill in all security credentials.');
        return;
      }
      setIsLoading(true);
      try {
        const profile = await dbService.signIn(email);
        setIsLoading(false);
        onAuthSuccess(profile);
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Credentials match error. Try again.');
      }
    } else if (mode === 'signup') {
      if (!name || !email || !password) {
        setError('Complete registration elements required.');
        return;
      }
      if (password.length < 8) {
        setError('Security standards require at least 8 characters.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setMode('verify');
      }, 1000);
    }
  };

  const handlePinChange = (value: string, idx: number) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[idx] = value.substring(value.length - 1);
    setPin(newPin);

    // Auto focus next input
    if (value && idx < 5) {
      const nextInput = document.getElementById(`pin-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    if (pin.includes('')) {
      setError('Please input the entire 6-digit confirmation key.');
      return;
    }
    setIsLoading(true);
    try {
      const profile = await dbService.signUp(email, name, role);
      setIsLoading(false);
      onAuthSuccess(profile);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Error executing secure registration.');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* Absolute background visual glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white">
        
        {/* Cancel button */}
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 text-xs font-mono tracking-widest text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
        >
          ESC
        </button>

        {/* Dynamic header logic */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1.5px] mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-display font-black text-xl text-cyan-400">
              L
            </div>
          </div>
          
          {mode === 'signin' && (
            <>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">Welcome back</h2>
              <p className="text-xs text-slate-400 font-light">Re-enter your credentials to stream your active modules.</p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">Initiate New Blueprint</h2>
              <p className="text-xs text-slate-400 font-light">Gain direct access to advanced motion and typographic systems.</p>
            </>
          )}

          {mode === 'verify' && (
            <>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">Confirm Your Identity</h2>
              <p className="text-xs text-slate-400 font-light">Enter standard 6-digit confirmation key to decrypt access.</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-left">{error}</span>
          </div>
        )}

        {/* Input/form areas */}
        {mode !== 'verify' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <>
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">FULL NAME</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                      id="auth-name-input"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">CHOOSE ROLE</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        role === 'student' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 hover:bg-slate-800/40'
                      }`}
                    >
                      Student Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('instructor')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        role === 'instructor' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 hover:bg-slate-800/40'
                      }`}
                    >
                      Instructor Role
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1 text-left">
              <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">SECURE EMAIL</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@mercer-design.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                  id="auth-email-input"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">PASSWORD</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                  id="auth-password-input"
                />
              </div>

              {/* Password strength visualizer */}
              {mode === 'signup' && password && (
                <div className="space-y-2 mt-2 pt-1 text-left">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>SECURITY STANDARDS</span>
                    <span className="font-bold text-cyan-400 uppercase">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border-none"
              id="auth-submit-btn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Verify Credentials' : 'Request Security Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Email Verification Step Container */
          <div className="space-y-6">
            <div className="flex justify-between space-x-2">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(e.target.value, idx)}
                  className="w-12 h-14 bg-slate-950/80 border border-white/10 rounded-xl text-center text-xl font-display font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              ))}
            </div>

            <div className="text-center">
              <span className="block text-[10px] font-mono text-slate-500 uppercase">DIDNT RECEIVE THE PACKET CODE?</span>
              <button 
                onClick={() => setPin(['', '', '', '', '', ''])}
                className="text-xs font-semibold text-cyan-400 hover:underline mt-1 cursor-pointer border-none bg-transparent"
              >
                Re-dispatch secure packet
              </button>
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-opacity cursor-pointer border-none"
              id="auth-verify-pin-btn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Decrypt Access Room</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer options */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-4 text-center">
          <span className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase">FEDERATED SIGN-IN OPTIONS</span>
          
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => {
                alert('Federated Auth is in secure-preview container mode. Please register/login with standard credentials.');
              }}
              className="flex items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-colors cursor-pointer"
              title="GitHub"
            >
              <Github className="w-4 h-4 text-slate-300" />
            </button>
            <button 
              onClick={() => {
                alert('Federated Auth is in secure-preview container mode. Please register/login with standard credentials.');
              }}
              className="flex items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-colors cursor-pointer"
              title="Google"
            >
              <Chrome className="w-4 h-4 text-slate-300" />
            </button>
            <button 
              onClick={() => {
                alert('Federated Auth is in secure-preview container mode. Please register/login with standard credentials.');
              }}
              className="flex items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-colors cursor-pointer"
              title="Twitter"
            >
              <Twitter className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          <div className="text-center pt-2">
            {mode === 'signin' ? (
              <span className="text-xs text-slate-500">
                New architect?{' '}
                <button 
                  onClick={() => setMode('signup')}
                  className="font-bold text-white hover:underline cursor-pointer border-none bg-transparent"
                >
                  Create credentials
                </button>
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Active resident?{' '}
                <button 
                  onClick={() => setMode('signin')}
                  className="font-bold text-white hover:underline cursor-pointer border-none bg-transparent"
                >
                  Enter workspace
                </button>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
