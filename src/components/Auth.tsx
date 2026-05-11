import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, ShieldCheck, ArrowRight, Chrome } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        // Custom check for the test account to auto-create it if it doesn't exist
        if (error && (error.message.includes('Invalid login credentials') || error.status === 400) && email === 'test.smartavr@gmail.com') {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) {
            if (signUpError.message.includes('rate limit')) {
              throw new Error('Supabase a limitat viteza. Te rog așteaptă 60 de secunde înainte de a încerca din nou.');
            }
            throw signUpError;
          }
          setError('Contul de test a fost creat! Încearcă să te loghezi din nou peste 1 minut (limită de viteză Supabase).');
        } else if (error) {
          if (error.message.includes('rate limit')) {
            throw new Error('Prea multe încercări. Așteaptă 1 minut sau mărește limita în Supabase (Auth -> Settings -> Rate Limits).');
          }
          throw error;
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

  const useTestAccount = () => {
    setEmail('test.smartavr@gmail.com');
    setPassword('parola123456');
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/30 mb-4">
            S
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Smart<span className="text-primary">AVR</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2 px-1 text-center">
            {isLogin ? 'Bine ai revenit' : 'Creează un cont premium'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@exemplu.ro"
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Parolă</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Procesăm...' : isLogin ? 'Autentificare' : 'Înregistrare'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black">
            <span className="bg-white px-4 text-slate-300 tracking-widest">Sau</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Chrome className="w-4 h-4 text-primary" />
            Continuă cu Google
          </button>
          <button
            onClick={useTestAccount}
            className="w-full py-2 text-[10px] font-black uppercase text-slate-300 hover:text-slate-400 transition-all tracking-widest"
          >
            Folosește cont de test
          </button>
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-tight">
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
