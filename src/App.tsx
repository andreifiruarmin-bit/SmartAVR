/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Wallet, PieChart as PieChartIcon, List, TrendingUp, Landmark, Coins, Layers, FileText, Home, PlusCircle, ArrowUpRight, DollarSign, LogOut, ChevronLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Saving, SavingType, Currency } from './types';
import { DEFAULT_RATES, BASE_CURRENCY } from './constants';
import { cn, formatCurrency, convertToRON, fetchLiveRates } from './lib/utils';
import { useDarkMode } from './hooks/useDarkMode';
import { Dashboard } from './components/dashboard';
import { SavingsList } from './components/SavingsList';
import { AddSavingModal } from './components/AddSavingModal';
import { Auth } from './components/Auth';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { BankDepositsDetail } from './pages/BankDepositsDetail';
import { CashReserveDetail } from './pages/CashReserveDetail';
import { GoldDetail } from './pages/GoldDetail';
import { EquitiesDetail } from './pages/EquitiesDetail';

export default function App() {
  const { isDark, toggleDark } = useDarkMode();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'list' | 'terms' | 'privacy' 
             | 'detail-deposits' | 'detail-cash' 
             | 'detail-gold' | 'detail-equities'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [savingsLoading, setSavingsLoading] = useState(true);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const [listFilter, setListFilter] = useState<{ type?: SavingType; currency?: Currency } | null>(null);

  const handleEdit = (saving: Saving) => {
    setEditingSaving(saving);
    setIsModalOpen(true);
  };

  // Handle Auth
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Live Rates
  useEffect(() => {
    fetchLiveRates().then(newRates => {
      if (newRates) setRates(newRates);
    });
  }, []);

  // Sync Savings from Supabase
  useEffect(() => {
    if (!user) {
      setSavings([]);
      return;
    }

    const fetchSavings = async () => {
      setSavingsLoading(true);
      const { data, error } = await supabase
        .from('savings_products')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Supabase fetch error:', error);
      } else {
        const mappedData = data.map((item: any) => {
          return {
            ...item,
            interestRate: item.interest_rate,
            maturityDate: item.maturity_date,
            isCapitalized: item.capitalized,
            createdAt: new Date(item.created_at).getTime(),
            ...(item.details || {})
          };
        });
        setSavings(mappedData as unknown as Saving[]);
      }
      setSavingsLoading(false);
    };

    fetchSavings();

    // Real-time subscription
    const channel = supabase
      .channel('savings-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'savings_products', 
        filter: `user_id=eq.${user.id}` 
      }, () => {
        fetchSavings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addSaving = async (newSaving: any) => {
    if (!user) return;
    try {
      // Map frontend fields to Supabase schema based on user standardization
      const payload: any = {
        id: newSaving.id,
        user_id: user.id,
        name: newSaving.name,
        type: newSaving.type,
        currency: newSaving.currency,
        amount: newSaving.amount,
        interest_rate: newSaving.interestRate || null,
        maturity_date: newSaving.maturityDate || null,
        capitalized: newSaving.isCapitalized ?? null,
        bank: newSaving.bank || newSaving.bankName || null,
        details: {
          shares: newSaving.shares,
          symbol: newSaving.symbol,
          weightInGrams: newSaving.weightInGrams,
          startDate: newSaving.startDate,
          ...(newSaving.details || {})
        }
      };

      const { error } = await supabase
        .from('savings_products')
        .upsert(payload);
      
      if (error) throw error;
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add saving:', error);
      alert('Eroare la salvare: ' + (error instanceof Error ? error.message : 'Eroare necunoscută'));
    }
  };

  const deleteSaving = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('savings_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete saving:', error);
    }
  };

  const totals = useMemo(() => {
    let totalInBase = 0;
    let weightedYieldSum = 0;
    let totalDepositsBase = 0;
    let weightedDepositYieldSum = 0;

    const byCurrency: Record<string, number> = {};
    const byType: Record<string, number> = {};

    savings.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      totalInBase += ronValue;
      
      const yieldRate = (s as any).interestRate || 0;
      weightedYieldSum += ronValue * (yieldRate / 100);

      if (s.type === SavingType.DEPOSIT || s.type === SavingType.BONDS) {
        totalDepositsBase += ronValue;
        weightedDepositYieldSum += ronValue * (yieldRate / 100);
      }

      byCurrency[s.currency] = (byCurrency[s.currency] || 0) + ronValue;
      byType[s.type] = (byType[s.type] || 0) + ronValue;
    });

    const averageYield = totalInBase > 0 ? (weightedYieldSum / totalInBase) * 100 : 0;
    const averageDepositYield = totalDepositsBase > 0 ? (weightedDepositYieldSum / totalDepositsBase) * 100 : 0;

    return { 
      totalInBase, 
      byCurrency, 
      byType, 
      averageYield,
      averageDepositYield,
      totalDepositsBase
    };
  }, [savings, rates]);

  const filteredSavings = useMemo(() => {
    if (!listFilter) return savings;
    return savings.filter(s => {
      if (listFilter.type && s.type !== listFilter.type) return false;
      if (listFilter.currency && s.currency !== listFilter.currency) return false;
      return true;
    });
  }, [savings, listFilter]);

  const handleDashboardFilter = (filter: { type?: SavingType; currency?: Currency }) => {
    setListFilter(filter);
    setActiveTab('list');
  };

  const clearFilters = () => setListFilter(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Supabase nu este configurat</h2>
          <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
            Pentru a folosi SmartAVR, trebuie să configurezi variabilele de mediu <span className="text-primary">VITE_SUPABASE_URL</span> și <span className="text-primary">VITE_SUPABASE_ANON_KEY</span>.
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl text-left font-mono text-[10px] text-slate-400 space-y-3 border border-slate-100">
            <div>
              <p className="text-slate-900 font-black mb-1 flex items-center gap-2">
                <span className="w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center text-[8px]">1</span>
                CONEXIUNE BAZĂ DE DATE
              </p>
              <p>• Mergi la Settings &rarr; API</p>
              <p>• Project URL (fără /rest/v1 la final)</p>
              <p>• anon public key</p>
            </div>
            <div>
              <p className="text-slate-900 font-black mb-1 flex items-center gap-2">
                <span className="w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center text-[8px]">2</span>
                CONFIGURARE AUTH (SUPABASE)
              </p>
              <p>• Authentication &rarr; Providers &rarr; Activează Google</p>
              <p>• Authentication &rarr; Settings &rarr; Dezactivează "Confirm Email"</p>
            </div>
            <div>
              <p className="text-slate-900 font-black mb-1 flex items-center gap-2">
                <span className="w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center text-[8px]">3</span>
                DEPLOY PE NETLIFY
              </p>
              <p>• Site Settings &rarr; Environment variables</p>
              <p>• Adaugă VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY</p>
              <p>• Mergi la Deploys &rarr; Trigger deploy &rarr; Clear cache and deploy</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
        />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizare active...</p>
      </div>
    );
  }
  if (!user) {
    return <Auth />;
  }
  if (savings.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center px-4"
      >
        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-center mb-8 animate-bounce transition-all duration-1000">
          <Wallet className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">Încă nu ai economii</h2>
        <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
          Planifică-ți viitorul financiar adăugând primul tău depozit sau titlu de stat chiar acum.
        </p>
      </motion.div>
    );
  }

  // Render based on current page
  if (currentPage === 'terms') {
    return <TermsAndConditions />;
  }

  if (currentPage === 'privacy') {
    return <PrivacyPolicy />;
  }

  if (currentPage === 'detail-deposits') {
    return (
      <motion.div 
        initial={{opacity:0, x:30}} 
        animate={{opacity:1, x:0}} 
        exit={{opacity:0, x:-30}} 
        transition={{duration:0.25}}
        className="min-h-screen bg-slate-50 pb-24"
      >
        <BankDepositsDetail 
          savings={savings} 
          rates={rates} 
          onBack={() => setCurrentPage('dashboard')} 
        />
      </motion.div>
    );
  }

  if (currentPage === 'detail-cash') {
    return (
      <motion.div 
        initial={{opacity:0, x:30}} 
        animate={{opacity:1, x:0}} 
        exit={{opacity:0, x:-30}} 
        transition={{duration:0.25}}
        className="min-h-screen bg-slate-50 pb-24"
      >
        <CashReserveDetail 
          savings={savings} 
          onBack={() => setCurrentPage('dashboard')} 
        />
      </motion.div>
    );
  }

  if (currentPage === 'detail-gold') {
    return (
      <motion.div 
        initial={{opacity:0, x:30}} 
        animate={{opacity:1, x:0}} 
        exit={{opacity:0, x:-30}} 
        transition={{duration:0.25}}
        className="min-h-screen bg-slate-50 pb-24"
      >
        <GoldDetail 
          savings={savings} 
          rates={rates} 
          onBack={() => setCurrentPage('dashboard')} 
        />
      </motion.div>
    );
  }

  if (currentPage === 'detail-equities') {
    return (
      <motion.div 
        initial={{opacity:0, x:30}} 
        animate={{opacity:1, x:0}} 
        exit={{opacity:0, x:-30}} 
        transition={{duration:0.25}}
        className="min-h-screen bg-slate-50 pb-24"
      >
        <EquitiesDetail 
          savings={savings} 
          rates={rates} 
          onBack={() => setCurrentPage('dashboard')} 
        />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-12 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
              S
            </div>
            <h1 className="text-2xl font-extrabold tracking-tighter text-slate-900">
              Smart<span className="text-primary">AVR</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full shadow-sm border border-slate-200">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <DollarSign className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-semibold leading-none">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilizator'}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Profil Premium</p>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                title="Deconectare"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adaugă Active</span>
            </motion.button>

            <button 
              onClick={() => supabase.auth.signOut()}
              className="md:hidden p-2 bg-white border border-slate-200 rounded-full text-slate-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard 
                savings={savings} 
                totals={totals}
                rates={rates}
                onSliceClick={handleDashboardFilter}
                loading={savingsLoading}
                onNavigate={(page) => setCurrentPage(page as any)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SavingsList 
                savings={filteredSavings} 
                onDelete={deleteSaving}
                onEdit={handleEdit}
                filter={listFilter}
                onClearFilter={clearFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddClick={() => setIsModalOpen(true)}
      />

      <Footer setCurrentPage={setCurrentPage} />

      <AddSavingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSaving(null);
        }}
        onAdd={addSaving}
        editingSaving={editingSaving}
      />
    </div>
  );
}
