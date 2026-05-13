import React, { useMemo, useState } from 'react';
import { Saving, SavingType, Currency } from '../types';
import { formatCurrency } from '../lib/utils';
import { CURRENCY_SYMBOLS } from '../constants';
import { Trash2, Landmark, Coins, TrendingUp, Wallet, ArrowRight, Layers, FileText, Home, ArrowUpDown, Calendar, ChevronDown, ChevronUp, Filter, ArrowUpRight, Search, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Virtuoso } from 'react-virtuoso';

interface SavingsListProps {
  savings: Saving[];
  onDelete: (id: string) => void;
  onEdit: (saving: Saving) => void;
  filter: { type?: SavingType; currency?: Currency } | null;
  onClearFilter: () => void;
}

type SortField = 'amount' | 'type' | 'date' | 'name';
type SortDirection = 'asc' | 'desc';

const TYPE_ICONS: Record<string, any> = {
  [SavingType.DEPOSIT]: Landmark,
  [SavingType.GOLD]: Coins,
  [SavingType.STOCKS]: TrendingUp,
  [SavingType.ETF]: Layers,
  [SavingType.BONDS]: FileText,
  [SavingType.RENT]: Home,
  [SavingType.CASH_RESERVE]: Wallet,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring' as const, bounce: 0.2 }
  }
};

export const SavingsList: React.FC<SavingsListProps> = ({ savings, onDelete, onEdit, filter, onClearFilter }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '30days' | 'thisYear'>('all');

  const filteredAndSortedSavings = useMemo(() => {
    let result = [...savings];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(term) || 
        (s.bank || (s as any).bankName)?.toLowerCase().includes(term)
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      const beginningOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();

      if (dateRange === '30days') {
        result = result.filter(s => (s.createdAt || 0) >= thirtyDaysAgo);
      } else if (dateRange === 'thisYear') {
        result = result.filter(s => (s.createdAt || 0) >= beginningOfYear);
      }
    }

    return result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'date':
        default:
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [savings, searchTerm, dateRange, sortField, sortDirection]);

  const handleReset = () => {
    setSearchTerm('');
    setDateRange('all');
    onClearFilter();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Virtualized Row Components
  const DesktopRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const s = filteredAndSortedSavings[index];
    const Icon = TYPE_ICONS[s.type] || Wallet;
    return (
      <div style={style} className="border-b border-slate-50 dark:border-slate-800/50">
        <motion.div
          variants={rowVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center group md:hover:bg-slate-50/50 dark:md:hover:bg-slate-800/50 transition-colors h-full px-4"
        >
          <div className="flex-[2] flex items-center gap-5 min-w-0 pr-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 md:group-hover:bg-primary md:group-hover:text-white transition-all">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white md:group-hover:text-primary transition-colors truncate">{s.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{s.type}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-[1.5] flex items-center gap-2 px-4">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 md:group-hover:bg-primary transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 truncate">
              {s.bank || (s.type === SavingType.GOLD ? 'SEIF PERSONAL' : 'CUSTODIE PROPRIE')}
            </p>
          </div>
          
          <div className="flex-[1.5] flex flex-col px-4">
            <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(s.amount, s.currency)}
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Valoare</span>
          </div>

          <div className="flex-[1.2] px-4">
            {(s.type === SavingType.DEPOSIT || s.type === SavingType.BONDS) && (s as any).interestRate ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-lg text-[9px] font-black border border-emerald-100 dark:border-emerald-500/20">
                +{(s as any).interestRate}%
              </div>
            ) : (
              <span className="text-[9px] font-black text-slate-400 uppercase italic">Variabil</span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-end gap-2 pl-4">
            <button onClick={() => onEdit(s)} className="p-2 text-slate-300 md:hover:text-primary transition-colors active:text-primary">
              <Pencil className="w-4 h-4" />
            </button>
            <AnimatePresence mode="wait">
              {confirmDeleteId === s.id ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-1">
                  <button onClick={() => setConfirmDeleteId(null)} className="p-1 text-[8px] font-black bg-slate-100 rounded text-slate-500">X</button>
                  <button onClick={() => { onDelete(s.id); setConfirmDeleteId(null); }} className="p-1 px-2 text-[8px] font-black bg-red-600 text-white rounded">OK</button>
                </motion.div>
              ) : (
                <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 text-slate-300 md:hover:text-red-500 transition-colors active:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  };

  const MobileRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const s = filteredAndSortedSavings[index];
    const Icon = TYPE_ICONS[s.type] || Wallet;
    return (
      <div style={{ ...style, padding: '8px 0' }}>
        <motion.div
          variants={rowVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-3xl p-5 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">{s.name}</p>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.type}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => onEdit(s)} className="p-2 text-slate-400"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex justify-between items-end border-t border-slate-200/50 pt-3 mt-1">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Valoare</p>
              <p className="font-black text-sm text-slate-900 dark:text-white">{formatCurrency(s.amount, s.currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Instituție</p>
              <p className="text-[9px] font-black uppercase text-slate-500 truncate max-w-[100px]">{s.bank || 'PROPRIE'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (savings.length === 0 && !filter && !searchTerm && dateRange === 'all') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100">
          <Layers className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Lista este goală</h2>
        <p className="text-slate-500 font-medium">Adaugă prima ta economie pentru a începe monitorizarea.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-1.5 flex-1 w-full">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
            <div className="w-3 h-10 bg-primary rounded-full shadow-2xl shadow-primary/50" />
            Portofoliu Active
          </h2>
          
          <div className="mt-4 flex flex-col md:flex-row gap-4 w-full">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text"
                placeholder="Caută după nume sau bancă..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm dark:text-white"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide shrink-0">
              <button 
                onClick={() => setDateRange('all')}
                className={cn(
                  "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  dateRange === 'all' ? "bg-slate-900 dark:bg-primary text-white shadow-md font-bold" : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Toate
              </button>
              <button 
                onClick={() => setDateRange('30days')}
                className={cn(
                  "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  dateRange === '30days' ? "bg-slate-900 dark:bg-primary text-white shadow-md font-bold" : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Ult. 30 zile
              </button>
              <button 
                onClick={() => setDateRange('thisYear')}
                className={cn(
                  "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  dateRange === 'thisYear' ? "bg-slate-900 dark:bg-primary text-white shadow-md font-bold" : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Anul curent
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {(filter || searchTerm || dateRange !== 'all') ? (
              <>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Filtre active:</span>
                <AnimatePresence mode="popLayout">
                  {filter?.type && (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-3 py-1.5 bg-primary text-white text-[9px] font-black rounded-xl uppercase flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      {React.createElement(TYPE_ICONS[filter.type] || Wallet, { className: "w-3 h-3" })}
                      {filter.type}
                    </motion.span>
                  )}
                  {filter?.currency && (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase shadow-lg shadow-slate-900/10"
                    >
                      {filter.currency}
                    </motion.span>
                  )}
                  {searchTerm && (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-3 py-1.5 bg-indigo-500 text-white text-[9px] font-black rounded-xl uppercase flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      <Search className="w-3 h-3" />
                      "{searchTerm}"
                    </motion.span>
                  )}
                  {dateRange !== 'all' && (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-xl uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Calendar className="w-3 h-3" />
                      {dateRange === '30days' ? 'Ult. 30 zile' : 'Anul curent'}
                    </motion.span>
                  )}
                </AnimatePresence>
                <button 
                  onClick={handleReset}
                  className="text-[9px] font-black text-slate-900 hover:text-primary uppercase ml-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                >
                  Resetează tot
                </button>
              </>
            ) : (
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Istoric tranzacții și dețineri</span>
            )}
          </div>
        </div>

        {/* Advanced Sorting UI */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 lg:block hidden">Sortează după:</p>
          <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full lg:w-auto">
            <button
              onClick={() => toggleSort('date')}
              className={cn(
                "flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                sortField === 'date' ? "bg-slate-900 dark:bg-primary text-white shadow-md scale-105" : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Dată {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={cn(
                "flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                sortField === 'amount' ? "bg-slate-900 dark:bg-primary text-white shadow-md scale-105" : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Valoare {sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
            </button>
            <button
              onClick={() => toggleSort('type')}
              className={cn(
                "flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                sortField === 'type' ? "bg-slate-900 dark:bg-primary text-white shadow-md scale-105" : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Tip {sortField === 'type' && (sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
            </button>
          </div>
        </div>
      </motion.div>

      {filteredAndSortedSavings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="w-8 h-8 text-slate-200 dark:text-slate-700" />
          </div>
          <p className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-4">Niciun rezultat pentru acest filtru</p>
          <button 
            onClick={handleReset}
            className="text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 px-6 py-3 rounded-2xl transition-all"
          >
            Vezi tot portofoliul
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-3 sm:p-6 lg:p-10 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
        >
          {/* Mobile View - Virtualized List */}
          <div className="lg:hidden h-[600px] w-full">
            <Virtuoso
              style={{ height: '600px' }}
              totalCount={filteredAndSortedSavings.length}
              itemContent={(index) => (
                <div className="pb-4">
                  <MobileRow index={index} style={{}} />
                </div>
              )}
              className="scrollbar-hide"
            />
          </div>

          {/* Desktop View - Virtualized Table */}
          <div className="hidden lg:block">
            <div className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-6 px-4">
              <div className="flex-[2]">Active / Instrument</div>
              <div className="flex-[1.5] px-4">Instituție / Locație</div>
              <div className="flex-[1.5] px-4">Sumă Deținută</div>
              <div className="flex-[1.2] px-4">Randament</div>
              <div className="flex-1 text-right">Acțiuni</div>
            </div>
            <div className="h-[600px] w-full">
              <Virtuoso
                style={{ height: '600px' }}
                totalCount={filteredAndSortedSavings.length}
                itemContent={(index) => (
                  <DesktopRow index={index} style={{ height: '88px' }} />
                )}
                className="scrollbar-hide"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Helper function for class merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
