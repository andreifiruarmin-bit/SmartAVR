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
import { SavingDetailModal } from './components/SavingDetailModal';
import { DashboardSettingsModal } from './components/dashboard/DashboardSettingsModal';
import { LegalModal } from './components/LegalModal';
import { Auth } from './components/Auth';
import { useUserProfile } from './hooks/useUserProfile';
import { useMaturityNotifications } from './hooks/useMaturityNotifications';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [savingsLoading, setSavingsLoading] = useState(true);
  const maturityNotifications = useMaturityNotifications(savings);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | 'gdpr' }>({ isOpen: false, type: 'terms' });
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const [detailSaving, setDetailSaving] = useState<Saving | null>(null);
  const [listFilter, setListFilter] = useState<{ type?: SavingType; currency?: Currency } | null>(null);
  const { preferences, updateCardVisibility, updateDisplayCurrency } = useUserProfile(user?.id);
  const cardVisibility = preferences.cardVisibility;
  const setCardVisibility = updateCardVisibility;
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

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

  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    if (!user) return;
    const INACTIVITY_LIMIT = 30 * 60 * 1000;
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, updateActivity));
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_LIMIT) {
        supabase.auth.signOut();
      }
    }, 60000);
    return () => {
      events.forEach(name => document.removeEventListener(name, updateActivity));
      clearInterval(interval);
    };
  }, [user, lastActivity]);

  const toggleDarkMode = () => setIsDark(!isDark);

  const handleEdit = (saving: Saving) => {
    setEditingSaving(saving);
    setIsModalOpen(true);
  };

  const openLegal = (type: 'terms' | 'privacy' | 'gdpr') => {
    setLegalModal({ isOpen: true, type });
  };

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

  useEffect(() => {
    fetchLiveRates().then(newRates => {
      if (newRates) setRates(newRates);
    });
  }, []);

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
        const mappedData = data.map((item: any) => ({
          ...item,
          interestRate: item.interest_rate,
          maturityDate: item.maturity_date,
          isCapitalized: item.capitalized,
          createdAt: new Date(item.created_at).getTime(),
          ...(item.details || {})
        }));
        setSavings(mappedData as unknown as Saving[]);
      }
      setSavingsLoading(false);
    };

    fetchSavings();
  }, [user]);

  const addSaving = async (newSaving: any) => {
    if (!user) return;
    try {
      const payload: any = {
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

      if (editingSaving) {
        payload.id = editingSaving.id;
      }

      const { data, error } = await supabase
        .from('savings_products')
        .upsert(payload)
        .select()
        .single();
      
      if (error) throw error;

      const mappedData = {
        ...data,
        interestRate: data.interest_rate,
        maturityDate: data.maturity_date,
        isCapitalized: data.capitalized,
        createdAt: new Date(data.created_at).getTime(),
        ...(data.details || {})
      } as unknown as Saving;

      if (editingSaving) {
        setSavings(prev => prev.map(s => s.id === editingSaving.id ? mappedData : s));
      } else {
        setSavings(prev => [mappedData, ...prev]);
      }

      setIsModalOpen(false);
      setEditingSaving(null);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Eroare la salvare: ' + (error instanceof Error ? error.message : 'Eroare necunoscută'));
    }
  };

  const deleteSaving = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('savings_products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      setSavings(prev => prev.filter(s => s.id !== id));
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

    return { 
      totalInBase, byCurrency, byType, 
      averageYield: totalInBase > 0 ? (weightedYieldSum / totalInBase) * 100 : 0,
      averageDepositYield: totalDepositsBase > 0 ? (weightedDepositYieldSum / totalDepositsBase) * 100 : 0,
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

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Auth isDark={isDark} onToggleDark={toggleDarkMode} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10 relative overflow-x-hidden transition-colors dark:bg-black dark:text-slate-200">
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-colors dark:bg-slate-900/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">S</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Smart<span className="text-primary">AVR</span></h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700">
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-white dark:hover:bg-slate-700"><Settings className="w-5 h-5" /></button>
              <button onClick={toggleDarkMode} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-white dark:hover:bg-slate-700">{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
              <button onClick={() => setIsModalOpen(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-white dark:hover:bg-slate-700"><Plus className="w-5 h-5" /></button>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(activeTab === 'dashboard' ? 'list' : 'dashboard')}
              className="flex items-center gap-2 bg-slate-900 dark:bg-primary text-white px-4 md:px-6 py-2.5 rounded-xl md:rounded-full text-sm font-bold shadow-lg"
            >
              {activeTab === 'dashboard' ? <><List className="w-5 h-5" /><span className="hidden md:inline">Listă Active</span></> : <><PieChartIcon className="w-5 h-5" /><span className="hidden md:inline">Dashboard</span></>}
            </motion.button>
            <button onClick={() => supabase.auth.signOut()} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-10 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Dashboard isDark={isDark} savings={savings} totals={totals} rates={rates} onSliceClick={handleDashboardFilter} onEdit={handleEdit} onDelete={deleteSaving} loading={savingsLoading} cardVisibility={cardVisibility} setCardVisibility={setCardVisibility} onOpenLegal={openLegal} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <SavingsList savings={filteredSavings} onDelete={deleteSaving} onEdit={handleEdit} onViewDetails={setDetailSaving} filter={listFilter} onClearFilter={clearFilters} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AddSavingModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingSaving(null); }} onAdd={addSaving} editingSaving={editingSaving} />
      <DashboardSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} visibility={cardVisibility} setVisibility={setCardVisibility} availableTypes={Array.from(new Set(savings.map(s => s.type))) as SavingType[]} />
      <LegalModal isOpen={legalModal.isOpen} type={legalModal.type} onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))} />
      <SavingDetailModal saving={detailSaving} onClose={() => setDetailSaving(null)} />
    </div>
  );
}