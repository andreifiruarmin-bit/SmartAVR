/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Plus, Wallet, PieChart as PieChartIcon, List, TrendingUp, Landmark, Coins, Layers, FileText, Home, PlusCircle, ArrowUpRight, DollarSign, LogOut } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Saving, SavingType, Currency } from './types';
import { DEFAULT_RATES, BASE_CURRENCY } from './constants';
import { cn, formatCurrency, convertToRON, fetchLiveRates } from './lib/utils';
import { Dashboard } from './components/dashboard/Dashboard';
import { SavingsList } from './components/SavingsList';
import { AddSavingModal } from './components/AddSavingModal';
import { DashboardSettingsModal } from './components/dashboard/DashboardSettingsModal';
import { LegalModal } from './components/LegalModal';
import { Auth } from './components/Auth';
import { Navigation } from './components/Navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [savingsLoading, setSavingsLoading] = useState(true);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | 'gdpr' }>({ isOpen: false, type: 'terms' });
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const [listFilter, setListFilter] = useState<{ type?: SavingType; currency?: Currency } | null>(null);
  const [cardVisibility, setCardVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard_visibility');
      return saved ? JSON.parse(saved) : {
        summary: true,
        evolution: true,
        cash: true,
        deposits: true,
        equities: true,
        gold: true,
        rent: true,
        analysis: true
      };
    }
    return { summary: true, evolution: true, cash: true, deposits: true, equities: true, gold: true, rent: true, analysis: true };
  });

  useEffect(() => {
    localStorage.setItem('dashboard_visibility', JSON.stringify(cardVisibility));
  }, [cardVisibility]);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  const handleEdit = (saving: Saving) => {
    setEditingSaving(saving);
    setIsModalOpen(true);
  };

  const openLegal = (type: 'terms' | 'privacy' | 'gdpr') => {
    setLegalModal({ isOpen: true, type });
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

      const currencyLabel = s.type === SavingType.GOLD ? 'AUR' : s.currency;
      byCurrency[currencyLabel] = (byCurrency[currencyLabel] || 0) + ronValue;
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Auth isDark={isDark} onToggleDark={toggleDarkMode} />;
  }

  const userSavingTypes = Array.from(new Set(savings.map(s => s.type)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-12 relative overflow-x-hidden transition-colors dark:bg-black dark:text-slate-200">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-colors dark:bg-slate-900/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
              S
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Smart<span className="text-primary">AVR</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 md:p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm md:shadow-none"
                title="Configurare Dashboard"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 md:p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-white dark:hover:bg-slate-700"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="hidden lg:flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 pr-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-semibold leading-none text-slate-900 dark:text-white">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilizator'}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Profil Premium</p>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500 transition-colors ml-2"
                title="Deconectare"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 md:px-6 py-2.5 rounded-xl md:rounded-full text-sm font-bold hover:opacity-90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adaugă</span>
            </motion.button>

            <button 
              onClick={() => supabase.auth.signOut()}
              className="lg:hidden p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-32 relative z-10">
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
                isDark={isDark}
                savings={savings} 
                totals={totals}
                rates={rates}
                onSliceClick={handleDashboardFilter}
                onEdit={handleEdit}
                onDelete={deleteSaving}
                loading={savingsLoading}
                cardVisibility={cardVisibility}
                setCardVisibility={setCardVisibility}
                onOpenLegal={openLegal}
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

      <AddSavingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSaving(null);
        }}
        onAdd={addSaving}
        editingSaving={editingSaving}
      />

      <DashboardSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        visibility={cardVisibility}
        setVisibility={setCardVisibility}
        availableTypes={userSavingTypes as SavingType[]}
      />

      <LegalModal 
        isOpen={legalModal.isOpen}
        type={legalModal.type}
        onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
