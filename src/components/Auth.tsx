import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, ShieldCheck, ArrowRight, Chrome, Sun, Moon, Fingerprint, Eye, EyeOff, Phone } from 'lucide-react';

interface AuthProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export const Auth: React.FC<AuthProps> = ({ isDark, onToggleDark }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ repeatPassword?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('smartavr_remember_me') !== 'false';
  });

  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  React.useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      setBiometricsAvailable(true);
    }

    const savedEmail = localStorage.getItem('smartavr_saved_email');
    if (savedEmail && rememberMe) {
      setEmail(savedEmail);
    }
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real production app with Supabase, you would use a WebAuthn strategy.
      // For now, we provide the UI trigger and the check for Android/iOS native prompt.
      if (!window.PublicKeyCredential) {
        throw new Error('Biometria nu este suportată pe acest dispozitiv.');
      }

      // This triggers the native Android/iOS biometric prompt
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Note: This is the structure for WebAuthn. 
      // To fully implement this, you'd need a backend endpoint to verify the assertion.
      // We are "preparing" the logic as requested.
      setError('Autentificarea biometrică necesită configurarea unui Passkey în setările profilului tău.');
      
      // Simulation of a successful biometric check for UI purposes
      // await navigator.credentials.get({ ...options });
      
    } catch (err: any) {
      setError(err.message || 'Eroare biometrie');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          if (error.message.includes('email_not_confirmed')) {
            throw new Error('E-mailul nu este confirmat. Verifică Inbox sau mergi la Supabase Dashboard -> Auth -> Settings și dezactivează "Confirm Email".');
          }
          if (error.message.includes('rate limit')) {
            throw new Error('Prea multe încercări. Așteaptă 1 minut sau mărește limita în Supabase (Auth -> Settings -> Rate Limits).');
          }
          throw error;
        }

        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('smartavr_remember_me', 'true');
          localStorage.setItem('smartavr_saved_email', email);
        } else {
          localStorage.setItem('smartavr_remember_me', 'false');
          localStorage.removeItem('smartavr_saved_email');
        }
      } else {
        // Validation for signup
        const newFieldErrors: { repeatPassword?: string; phone?: string } = {};
        
        if (password !== repeatPassword) {
          newFieldErrors.repeatPassword = 'Parolele nu coincid';
        }
        
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length !== 9) {
          newFieldErrors.phone = 'Numărul de telefon trebuie să aibă exact 9 cifre';
        }
        
        if (!termsAccepted) {
          throw new Error('Trebuie să fii de acord cu Termenii și condițiile și Politica de confidențialitate');
        }
        
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          throw new Error('Verifică câmpurile marcate cu roșu');
        }

        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              phone: `+40${phoneDigits}`
            }
          }
        });
        if (error) {
          if (error.message.includes('rate limit')) {
            throw new Error('Limită de viteză atinsă. Așteaptă un minut.');
          }
          throw error;
        }
        if (data.user && data.session) {
          // Success
        } else {
          alert('Cont creat! Verifică email-ul. Dacă nu primești nimic, mergi la Supabase -> Authentication -> Settings -> Dezactivează "Confirm Email".');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificare');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          throw new Error('Autentificarea cu Google nu este activată în Supabase Dashboard (Authentication -> Providers).');
        }
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 md:p-10 border border-slate-100 dark:border-slate-800 overflow-hidden relative"
      >
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={onToggleDark}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:text-primary transition-all border border-transparent hover:border-primary/20"
            aria-label={isDark ? "Comută la modul luminos" : "Comută la modul întunecat"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/30 mb-4">
            S
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Smart<span className="text-primary">AVR</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 px-1 text-center">
            {isLogin ? 'Bine ai revenit' : 'Creează un cont premium'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@exemplu.ro"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Parolă</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-primary transition-colors"
                aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Repetă parola</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                  <input
                    type={showRepeatPassword ? 'text' : 'password'}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-primary transition-colors"
                    aria-label={showRepeatPassword ? "Ascunde parola" : "Arată parola"}
                  >
                    {showRepeatPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.repeatPassword && (
                  <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{fieldErrors.repeatPassword}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Număr de telefon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden">
                    <span className="pl-12 pr-2 py-3.5 text-sm font-bold text-slate-400 dark:text-slate-500">+40</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 9) {
                          setPhone(value);
                        }
                      }}
                      placeholder="7XX XXX XXX"
                      className="flex-1 bg-transparent border-none py-3.5 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      required
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-start gap-2 cursor-pointer group px-1">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-all checked:bg-primary checked:border-primary focus:outline-none"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed">
                    Sunt de acord cu{' '}
                    <a href="/termeni-si-conditii" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Termenii și condițiile
                    </a>
                    {' '}și{' '}
                    <a href="/politica-de-confidentialitate" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Politica de confidențialitate
                    </a>
                  </span>
                </label>
              </div>
            </>
          )}

          <div className="flex items-center justify-between px-1 py-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-all checked:bg-primary checked:border-primary focus:outline-none"
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors tracking-widest">Ține-mă minte</span>
            </label>
            
            {isLogin && (
              <button 
                type="button" 
                className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest"
              >
                Ai uitat parola?
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!isLogin && !termsAccepted)}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesăm...' : isLogin ? 'Autentificare' : 'Înregistrare'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black">
            <span className="bg-white dark:bg-slate-900 px-4 text-slate-300 dark:text-slate-700 tracking-widest">Sau</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Chrome className="w-4 h-4 text-primary" />
            Continuă cu Google
          </button>
          
          {biometricsAvailable && (
            <button
              onClick={handleBiometricAuth}
              className="w-full flex items-center justify-center gap-3 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-primary/20 transition-all group"
            >
              <Fingerprint className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              Autentificare Biometrică
            </button>
          )}
        </div>

        <p className="mt-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-tight">
          {isLogin ? 'Nu ai cont?' : 'Ai deja un cont?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-primary hover:underline"
          >
            {isLogin ? 'Înscrie-te' : 'Conectează-te'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
