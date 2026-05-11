/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Wallet, PieChart as PieChartIcon, List, TrendingUp, Landmark, Coins, Layers, FileText, Home, PlusCircle, ArrowUpRight, DollarSign, LogOut } from 'lucide-react';
import { Saving, SavingType, Currency } from './types';
import { DEFAULT_RATES, BASE_CURRENCY } from './constants';
import { cn, formatCurrency, convertToRON, fetchLiveRates, handleFirestoreError, OperationType } from './lib/utils';
import { Dashboard } from './components/Dashboard';
import { SavingsList } from './components/SavingsList';
import { AddSavingModal } from './components/AddSavingModal';
import { Auth } from './components/Auth';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listFilter, setListFilter] = useState<{ type?: SavingType; currency?: Currency } | null>(null);

  // Handle Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Live Rates
  useEffect(() => {
    fetchLiveRates().then(newRates => {
      if (newRates) setRates(newRates);
    });
  }, []);

  // Sync Savings from Firestore
  useEffect(() => {
    if (!user) {
      setSavings([]);
      return;
    }

    const q = query(collection(db, 'savings'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Saving));
      setSavings(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'savings', auth);
    });

    return () => unsubscribe();
  }, [user]);

  const addSaving = async (newSaving: any) => {
    if (!user) return;
    try {
      const savingData = { ...newSaving, userId: user.uid };
      const docRef = doc(db, 'savings', newSaving.id);
      await setDoc(docRef, savingData);
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'savings', auth);
    }
  };

  const deleteSaving = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'savings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `savings/${id}`, auth);
    }
  };

  const totals = useMemo(() => {
    let totalInBase = 0;
    const byCurrency: Record<string, number> = {};
    const byType: Record<string, number> = {};

    savings.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      totalInBase += ronValue;
      
      byCurrency[s.currency] = (byCurrency[s.currency] || 0) + ronValue;
      byType[s.type] = (byType[s.type] || 0) + ronValue;
    });

    return { totalInBase, byCurrency, byType };
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
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
              S
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Smart<span className="text-primary">AVR</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full shadow-sm border border-slate-200">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <DollarSign className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-semibold leading-none">{user.displayName || 'Utilizator'}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Profil Premium</p>
              </div>
              <button 
                onClick={() => signOut(auth)}
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
              onClick={() => signOut(auth)}
              className="md:hidden p-2 bg-white border border-slate-200 rounded-full text-slate-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Dashboard 
                    savings={savings} 
                    totals={totals}
                    rates={rates}
                    onSliceClick={handleDashboardFilter}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SavingsList 
                    savings={filteredSavings} 
                    onDelete={deleteSaving}
                    filter={listFilter}
                    onClearFilter={clearFilters}
                  />
                </motion.div>
              )}
            </AnimatePresence>
      </main>

      {/* Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around h-20 px-6 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all text-slate-400",
            activeTab === 'dashboard' && "text-primary"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            activeTab === 'dashboard' && "bg-primary/5"
          )}>
            <PieChartIcon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all text-slate-400",
            activeTab === 'list' && "text-primary"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            activeTab === 'list' && "bg-primary/5"
          )}>
            <List className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
        </button>
      </nav>

      {/* Desktop Navigation Toggle */}
      <div className="hidden md:flex fixed left-1/2 -translate-x-1/2 bottom-8 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-full p-1.5 shadow-2xl gap-1.5 ring-1 ring-black/5">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "px-8 py-2.5 rounded-full text-sm font-bold transition-all text-slate-500 hover:bg-slate-50",
            activeTab === 'dashboard' && "bg-slate-900 text-white shadow-lg"
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-8 py-2.5 rounded-full text-sm font-bold transition-all text-slate-500 hover:bg-slate-50",
            activeTab === 'list' && "bg-slate-900 text-white shadow-lg"
          )}
        >
          Lista Economii
        </button>
      </div>

      <AddSavingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addSaving}
      />
    </div>
  );
}
