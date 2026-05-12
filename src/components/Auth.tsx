import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ShieldCheck, ArrowRight, Chrome } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('smartavr_remember_me') !== 'false';
  });

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('smartavr_saved_email');
    if (savedEmail && rememberMe) {
      setEmail(savedEmail);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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

        if (rememberMe) {
          localStorage.setItem('smartavr_remember_me', 'true');
          localStorage.setItem('smartavr_saved_email', email);
        } else {
          localStorage.setItem('smartavr_remember_me', 'false');
          localStorage.removeItem('smartavr_saved_email');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
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

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Introdu adresa de email pentru a reseta parola.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      alert('Email de resetare trimis! Verifică inbox-ul.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 px-8 py-10 border border-slate-100">

          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-[1.1rem] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/30 mb-4">
              S
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
              Smart<span className="text-primary">AVR</span>
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {isLogin ? 'Bine ai revenit' : 'Creează contul'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nume@exemplu.ro"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Parolă
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            {isLogin && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      localStorage.setItem('smartavr_remember_me', e.target.checked.toString());
                    }}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ține-mă minte
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                >
                  Ai uitat parola?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  {isLogin ? 'Autentificare' : 'Creează cont'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                Sau
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            <Chrome className="w-4 h-4 text-primary" />
            Continuă cu Google
          </button>

          {/* Toggle Login / Register */}
          <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {isLogin ? 'Nu ai cont?' : 'Ai deja un cont?'}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="ml-1.5 text-primary font-black hover:opacity-70 transition-opacity"
            >
              {isLogin ? 'Înscrie-te' : 'Autentificare'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
