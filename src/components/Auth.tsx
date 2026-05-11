import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Github, Chrome, Mail, Lock, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { cn } from '../lib/utils';

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
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          // If it's the specific test account and user is not found, try to create it
          if ((err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') && email === 'test@smartavr.pro' && password === 'SmartAVR2026!') {
            await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw err;
          }
        }
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificare');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const useTestAccount = () => {
    setEmail('tester_7a2b@smartavr.test');
    setPassword('A9x!2Pz8qL');
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
