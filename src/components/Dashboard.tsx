import React, { useMemo, useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Saving, SavingType, Currency, BankDeposit } from '../types';
import { formatCurrency, convertToRON, cn } from '../lib/utils';
import { BASE_CURRENCY, DEFAULT_RATES } from '../constants';
import { Wallet, TrendingUp, Landmark, Filter, ArrowUpRight, DollarSign, PieChart as PieChartIcon, Activity, Coins, Settings2, EyeOff, Eye, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface DashboardProps {
  savings: Saving[];
  rates: Record<string, number>;
  totals: {
    totalInBase: number;
    byCurrency: Record<string, number>;
    byType: Record<string, number>;
    averageYield: number;
    averageDepositYield: number;
    totalDepositsBase: number;
  };
  onSliceClick: (filter: { type?: SavingType; currency?: Currency }) => void;
  loading?: boolean;
}

const COLORS = ['#f43e01', '#10b981', '#f59e0b', '#6366f1', '#1e293b', '#94a3b8'];
const CURRENCIES: (Currency | 'ALL')[] = ['ALL', 'RON', 'EUR', 'USD', 'GBP', 'CHF', 'XAU'];

const CURRENCY_INFO: Record<string, { icon: string, name: string }> = {
  'RON': { icon: 'L', name: 'Leu Românesc' },
  'EUR': { icon: '€', name: 'Euro' },
  'USD': { icon: '$', name: 'Dolar American' },
  'GBP': { icon: '£', name: 'Liră Sterlină' },
  'CHF': { icon: '₣', name: 'Franc Elvețian' },
  'XAU': { icon: 'Au', name: 'Gram Aur' },
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.3 }
  }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{data.name}</p>
        <p className="text-base font-black tracking-tight">{formatCurrency(data.value, 'RON')}</p>
        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ savings, totals, rates, onSliceClick, loading }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [displayCurrencyMode, setDisplayCurrencyMode] = useState<'RON' | 'EUR'>('RON');
  const [showConfig, setShowConfig] = useState(false);
  const [confirmHideId, setConfirmHideId] = useState<string | null>(null);

  // Dashboard configuration state (with local storage persistence)
  const [cardSettings, setCardSettings] = useState<Record<string, { visible: boolean, currency: Currency | 'BASE' }>>(() => {
    const saved = localStorage.getItem('dashboard_config');
    const defaults = {
      'portfolio_summary': { visible: true, currency: 'BASE' },
      'cash_reserve': { visible: true, currency: 'BASE' },
      'bank_deposits': { visible: true, currency: 'BASE' },
      'gold_assets': { visible: true, currency: 'BASE' },
      'equities_assets': { visible: true, currency: 'BASE' },
      'portfolio_evolution': { visible: true, currency: 'BASE' },
      'deposits_evolution': { visible: true, currency: 'BASE' },
      'currency_stats': { visible: true, currency: 'BASE' },
    };
    if (saved) return { ...defaults, ...JSON.parse(saved) };
    return defaults;
  });

  const updateCardSettings = (id: string, updates: Partial<{ visible: boolean, currency: Currency | 'BASE' }>) => {
    setCardSettings(prev => {
      const next = { ...prev, [id]: { ...prev[id], ...updates } };
      localStorage.setItem('dashboard_config', JSON.stringify(next));
      return next;
    });
  };

  const getCardValue = (id: string, type?: SavingType) => {
    const settings = cardSettings[id];
    const currency = settings.currency === 'BASE' ? (displayCurrencyMode as Currency) : settings.currency;
    
    let ronValue = 0;
    if (type) {
      ronValue = totals.byType[type] || 0;
      if (type === SavingType.STOCKS || type === SavingType.ETF) {
        ronValue = (totals.byType[SavingType.STOCKS] || 0) + (totals.byType[SavingType.ETF] || 0);
      }
    } else if (id === 'portfolio_summary') {
      ronValue = filteredTotals.totalInBase;
    }

    if (currency === 'RON') return ronValue;
    return ronValue / (rates[currency] || 1);
  };

  const activeCurrencies = useMemo(() => {
    const used = new Set<Currency>(['RON', 'EUR']); // Always allow RON/EUR for display
    savings.forEach(s => used.add(s.currency));
    return Array.from(used);
  }, [savings]);

  // Parallax setup
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 1000], [0, -40]);
  const parallaxY2 = useTransform(scrollY, [0, 1000], [0, -20]);

  const availableCurrencies = useMemo(() => {
    const used = new Set<string>();
    savings.forEach(s => used.add(s.currency));
    const list: (Currency | 'ALL')[] = ['ALL'];
    CURRENCIES.forEach(c => {
      if (c !== 'ALL' && used.has(c)) list.push(c);
    });
    return list;
  }, [savings]);

  const filteredSavings = useMemo(() => {
    if (selectedCurrency === 'ALL') return savings;
    return savings.filter(s => s.currency === selectedCurrency);
  }, [savings, selectedCurrency]);

  const filteredTotals = useMemo(() => {
    let totalInBase = 0;
    const byType: Record<string, number> = {};

    filteredSavings.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      totalInBase += ronValue;
      byType[s.type] = (byType[s.type] || 0) + ronValue;
    });

    return { totalInBase, byType };
  }, [filteredSavings, rates]);

  const typeData = useMemo(() => {
    return Object.entries(filteredTotals.byType).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredTotals.byType]);

  const currencyData = useMemo(() => {
    return Object.entries(totals.byCurrency).map(([name, value]) => ({
      name,
      value
    }));
  }, [totals.byCurrency]);

  const portfolioHistory = useMemo(() => {
    if (savings.length === 0) return [];

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find earliest point
    const timestamps = savings.map(s => {
      const dep = s as any;
      return dep.startDate ? new Date(dep.startDate).getTime() : (s.createdAt || Date.now());
    });
    const minTimestamp = Math.min(...timestamps);
    const earliestAssetDate = new Date(minTimestamp);
    earliestAssetDate.setDate(1);
    earliestAssetDate.setHours(0, 0, 0, 0);

    // Cap lookback at 12 months
    const twelveMonthsAgo = new Date(startOfCurrentMonth);
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const chartStartDate = earliestAssetDate < twelveMonthsAgo ? twelveMonthsAgo : earliestAssetDate;

    const data = [];
    let current = new Date(chartStartDate);
    
    // Avoid infinite loop if somehow current > startOfCurrentMonth initially
    if (current > startOfCurrentMonth) {
      current = new Date(startOfCurrentMonth);
    }

    while (current <= startOfCurrentMonth) {
      const timestamp = current.getTime();
      
      let totalPortfolioRON = 0;
      let totalDepositsValueRON = 0;

      savings.forEach(s => {
        // Effective start date for this calculation
        const dep = s as any;
        const assetStartDate = dep.startDate ? new Date(dep.startDate).getTime() : (s.createdAt || timestamp);

        if (assetStartDate <= timestamp) {
          const baseRON = convertToRON(s.amount, s.currency, rates);
          totalPortfolioRON += baseRON;

          if (s.type === SavingType.DEPOSIT || s.type === SavingType.BONDS) {
            const daysAccrued = Math.max(0, (timestamp - assetStartDate) / (1000 * 60 * 60 * 24));
            const yearlyRate = (dep.interestRate || 0) / 100;
            const accruedInterest = baseRON * yearlyRate * (daysAccrued / 365) * 0.9;
            
            if (s.type === SavingType.DEPOSIT) {
              totalDepositsValueRON += (baseRON + accruedInterest);
            }
            
            totalPortfolioRON += accruedInterest;
          }
        }
      });

      data.push({
        name: current.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }),
        total: totalPortfolioRON,
        deposits: totalDepositsValueRON,
        fullDate: current.toLocaleDateString('ro-RO')
      });

      // Advance to next month
      current = new Date(current);
      current.setMonth(current.getMonth() + 1);
    }
    return data;
  }, [savings, rates]);

  // New Bank Deposits Evolution Section
  const depositsHistory = useMemo(() => {
    return portfolioHistory.map(point => ({
      ...point,
      netValue: point.deposits
    }));
  }, [portfolioHistory]);

  const hasDeposits = (totals.byType[SavingType.DEPOSIT] || 0) > 0;
  const hasCash = (totals.byType[SavingType.CASH_RESERVE] || 0) > 0;
  const hasGold = (totals.byType[SavingType.GOLD] || 0) > 0;
  const hasInvestments = (totals.byType[SavingType.STOCKS] || 0) > 0 || (totals.byType[SavingType.ETF] || 0) > 0;

  if (loading) {
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-32 px-1"
    >
      {/* Search/Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase">Portofoliu Dashboard</h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Analiză financiară în timp real</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto scrollbar-hide">
            {availableCurrencies.map((cur) => (
              <button
                key={cur}
                onClick={() => setSelectedCurrency(cur)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedCurrency === cur 
                    ? "bg-slate-900 text-white shadow-lg active:scale-95" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {cur}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:bg-slate-50 transition-all group"
            title="Configurare Dashboard"
          >
            <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:rotate-90 transition-all duration-500" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Hiding */}
      <AnimatePresence>
        {confirmHideId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border border-slate-200"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <EyeOff className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Ascunde acest card?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">
                Vrei să ascunzi cardul "{confirmHideId.replace('_', ' ')}"? Îl poți readuce oricând din meniul de configurare.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmHideId(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-400 text-[10px] font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Nu, anulează
                </button>
                <button 
                  onClick={() => {
                    updateCardSettings(confirmHideId, { visible: false });
                    setConfirmHideId(null);
                  }}
                  className="flex-1 py-4 bg-red-600 text-white text-[10px] font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all uppercase tracking-widest"
                >
                  Da, ascunde
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Dashboard Configuration Overlay */}
        {showConfig && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full md:max-w-2xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Configurare Dashboard</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Alege cardurile pe care vrei să le vezi</p>
                </div>
                <button 
                  onClick={() => setShowConfig(false)}
                  className="p-4 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(cardSettings).map(id => {
                  const settings = cardSettings[id];
                  const title = id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  
                  // Check if instrument is available
                  let isAvailable = true;
                  if (id === 'cash_reserve') isAvailable = hasCash;
                  if (id === 'bank_deposits') isAvailable = hasDeposits;
                  if (id === 'gold_assets') isAvailable = hasGold;
                  if (id === 'equities_assets') isAvailable = hasInvestments;
                  if (id === 'deposits_evolution') isAvailable = hasDeposits;

                  return (
                    <div 
                      key={id}
                      className={cn(
                        "p-5 rounded-3xl border transition-all flex items-center justify-between",
                        settings.visible 
                          ? "bg-white border-primary shadow-sm" 
                          : "bg-slate-50 border-slate-100",
                        !isAvailable && "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          settings.visible ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"
                        )}>
                          {settings.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{title}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {isAvailable ? 'Instrument activ' : 'Fără active'}
                          </p>
                        </div>
                      </div>
                      
                      {isAvailable && (
                        <button
                          onClick={() => updateCardSettings(id, { visible: !settings.visible })}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all",
                            settings.visible 
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                              : "bg-white border border-slate-200 text-slate-400 hover:text-slate-900"
                          )}
                        >
                          {settings.visible ? 'Afișat' : 'Ascuns'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <button 
                onClick={() => setShowConfig(false)}
                className="w-full py-5 bg-slate-900 text-white text-[10px] font-black rounded-3xl mt-8 hover:bg-primary transition-all uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20"
              >
                Salvează Configurația
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Summary Card */}
        {cardSettings['portfolio_summary'].visible && (
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-8 flex flex-col bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 z-10">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      {selectedCurrency === 'ALL' ? 'Sold Total Portofoliu' : `Total ${selectedCurrency} (RON)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="relative">
                      <select 
                        value={cardSettings['portfolio_summary'].currency}
                        onChange={(e) => updateCardSettings('portfolio_summary', { currency: e.target.value as any })}
                        className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 pr-10 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="BASE">Auto ({displayCurrencyMode})</option>
                        {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button 
                      onClick={() => setConfirmHideId('portfolio_summary')}
                      className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter break-all sm:break-normal">
                    {formatCurrency(getCardValue('portfolio_summary'), cardSettings['portfolio_summary'].currency === 'BASE' ? displayCurrencyMode as Currency : cardSettings['portfolio_summary'].currency)}
                  </h3>
                  <button 
                    onClick={() => setDisplayCurrencyMode(prev => prev === 'RON' ? 'EUR' : 'RON')}
                    className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-primary transition-all uppercase tracking-widest flex items-center gap-2 self-start md:mb-1.5 shadow-lg active:scale-95"
                  >
                    <Filter className="w-3 h-3" />
                    Sist. {displayCurrencyMode}
                  </button>
                </div>
              </div>
              <div className="hidden md:flex gap-2">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all cursor-help">
                  <PieChartIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-auto z-10">
            {/* Chart 1 */}
            <div className="flex flex-col items-center">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      onClick={(data) => {
                        if (data && data.name) {
                          onSliceClick({ type: data.name as SavingType });
                        }
                      }}
                      cursor="pointer"
                    >
                      {typeData.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-center leading-none mb-1">Categorii</span>
                  <span className="text-[10px] font-black text-slate-900">{typeData.length} Tipuri</span>
                </div>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="flex flex-col items-center">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      onClick={(data) => {
                        if (data && data.name) {
                          onSliceClick({ currency: data.name as Currency });
                        }
                      }}
                      cursor="pointer"
                    >
                      {currencyData.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[(index + 3) % COLORS.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-center leading-none mb-1">Monede</span>
                   <span className="text-[10px] font-black text-slate-900">{currencyData.length} Total</span>
                </div>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.03, scale: 1 }}
            className="absolute -bottom-20 -right-20 pointer-events-none"
          >
            <PieChartIcon className="w-[30rem] h-[30rem] text-slate-900" />
          </motion.div>
        </motion.div>
      )}

        {/* Small Highlight Cards Container */}
        {(hasCash || hasDeposits || hasGold || hasInvestments) && (
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            {hasCash && cardSettings['cash_reserve'].visible && (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between relative group transition-all duration-500 overflow-hidden"
              >
                <div className="flex justify-between items-start z-10">
                  <div className="p-3 bg-primary rounded-2xl group-hover:ring-4 group-hover:ring-primary/20 transition-all duration-500">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          value={cardSettings['cash_reserve'].currency}
                          onChange={(e) => updateCardSettings('cash_reserve', { currency: e.target.value as any })}
                          className="appearance-none bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 pr-6 text-[8px] font-black uppercase focus:outline-none"
                        >
                          <option value="BASE">Auto</option>
                          {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="w-2 h-2 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button 
                        onClick={() => setConfirmHideId('cash_reserve')}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Rezervă Cash</p>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatCurrency(getCardValue('cash_reserve', SavingType.CASH_RESERVE), cardSettings['cash_reserve'].currency === 'BASE' ? displayCurrencyMode as Currency : cardSettings['cash_reserve'].currency)}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-6 z-10">
                  <div className="w-2 h-2 rounded-full bg-primary/20" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fond de urgență</p>
                </div>
              </motion.div>
            )}

            {hasDeposits && cardSettings['bank_deposits'].visible && (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-slate-900 p-8 rounded-[3rem] shadow-xl shadow-slate-900/10 text-white flex flex-col justify-between border border-slate-800 relative group overflow-hidden transition-all duration-500"
              >
                <div className="z-10">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Depozite Bancare</p>
                       <button 
                          onClick={() => setConfirmHideId('bank_deposits')}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          value={cardSettings['bank_deposits'].currency}
                          onChange={(e) => updateCardSettings('bank_deposits', { currency: e.target.value as any })}
                          className="appearance-none bg-white/10 border border-white/10 rounded-lg px-2 py-1 pr-6 text-[8px] font-black uppercase text-white focus:outline-none"
                        >
                          <option value="BASE" className="bg-slate-900">Auto</option>
                          {activeCurrencies.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                        </select>
                        <ChevronDown className="w-2 h-2 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-[10px] font-black">{totals.averageDepositYield.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight">
                    {formatCurrency(getCardValue('bank_deposits', SavingType.DEPOSIT), cardSettings['bank_deposits'].currency === 'BASE' ? displayCurrencyMode as Currency : cardSettings['bank_deposits'].currency)}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-4 z-10">
                  <div className="p-2 bg-white/5 rounded-xl group-hover:ring-4 group-hover:ring-white/10 transition-all duration-500">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Randament Mediu Portofoliu</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight italic">Depozite active acum</p>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            )}

            {/* Gold Card */}
            {hasGold && cardSettings['gold_assets'].visible && (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-[#facc15] p-8 rounded-[3rem] shadow-xl shadow-yellow-500/10 text-slate-900 flex flex-col justify-between relative group overflow-hidden transition-all duration-500"
              >
                <div className="flex justify-between items-start z-10">
                  <div className="p-3 bg-white/40 rounded-2xl backdrop-blur-sm group-hover:ring-4 group-hover:ring-white/20 transition-all duration-500">
                    <Coins className="w-6 h-6 text-slate-900" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          value={cardSettings['gold_assets'].currency}
                          onChange={(e) => updateCardSettings('gold_assets', { currency: e.target.value as any })}
                          className="appearance-none bg-white/40 border border-white/20 rounded-lg px-2 py-1 pr-6 text-[8px] font-black uppercase focus:outline-none"
                        >
                          <option value="BASE">Auto</option>
                          {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="w-2 h-2 text-slate-900/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button 
                        onClick={() => setConfirmHideId('gold_assets')}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-900/30 hover:text-red-600 transition-all"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-slate-900/60 text-[10px] font-black uppercase tracking-widest">Aur Fizic / Investiții</p>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatCurrency(getCardValue('gold_assets', SavingType.GOLD), cardSettings['gold_assets'].currency === 'BASE' ? displayCurrencyMode as Currency : cardSettings['gold_assets'].currency)}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-6 z-10">
                 <div className="w-2 h-2 rounded-full bg-white/60" />
                  <p className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">Rezerva de valoare</p>
                </div>
              </motion.div>
            )}

            {/* Equities Card */}
            {hasInvestments && cardSettings['equities_assets'].visible && (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between relative group transition-all duration-500 overflow-hidden"
              >
                <div className="flex justify-between items-start z-10">
                  <div className="p-3 bg-indigo-500 rounded-2xl group-hover:ring-4 group-hover:ring-indigo-500/20 transition-all duration-500">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          value={cardSettings['equities_assets'].currency}
                          onChange={(e) => updateCardSettings('equities_assets', { currency: e.target.value as any })}
                          className="appearance-none bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 pr-6 text-[8px] font-black uppercase focus:outline-none"
                        >
                          <option value="BASE">Auto</option>
                          {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="w-2 h-2 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button 
                        onClick={() => setConfirmHideId('equities_assets')}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Piața de Capital</p>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatCurrency(getCardValue('equities_assets', SavingType.STOCKS), cardSettings['equities_assets'].currency === 'BASE' ? displayCurrencyMode as Currency : cardSettings['equities_assets'].currency)}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-6 z-10">
                  <div className="w-2 h-2 rounded-full bg-indigo-500/20" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acțiuni & ETF-uri</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* New Project Evolution Chart */}
      {cardSettings['portfolio_evolution'].visible && (
        <motion.div 
          variants={itemVariants}
          className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/30" />
                Evoluție Istorică & Proiectată
              </h4>
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Analiză Portofoliu</h3>
                <button 
                  onClick={() => setConfirmHideId('portfolio_evolution')}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Include dobanda netă depozite (-10% impozit)</p>
            </div>
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Portofoliu</span>
            </div>
            {hasDeposits && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Depozite + Dobândă</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43e01" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43e01" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 p-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{payload[0].payload.fullDate}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-[10px] font-black text-primary uppercase">Total:</span>
                            <span className="text-sm font-black text-white">{formatCurrency(payload[0].value as number, 'RON')}</span>
                          </div>
                          {hasDeposits && payload[1] && (
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[10px] font-black text-emerald-400 uppercase">Depozite:</span>
                              <span className="text-sm font-black text-white">{formatCurrency(payload[1].value as number, 'RON')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#f43e01" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorTotal)"
                animationDuration={2000}
              />
              {hasDeposits && (
                <Area 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorDeposits)"
                  animationDuration={2500}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    )}

      {/* Detailed Bank Deposits Evolution Chart */}
      {hasDeposits && cardSettings['deposits_evolution'].visible && (
        <motion.div 
          variants={itemVariants}
          className="bg-slate-900 p-6 md:p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group transition-all duration-500"
        >
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 relative z-10">
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30" />
                Focus: Depozite Bancare
              </h4>
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-white tracking-tighter">Evoluție Dobândă Netă</h3>
                <button 
                  onClick={() => setConfirmHideId('deposits_evolution')}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white/5 text-slate-500 hover:text-red-400 rounded-xl transition-all"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Proiecție acumulată pe 12 luni (taxare 10% inclusă)</p>
            </div>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
               <Landmark className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={depositsHistory} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} 
                  dy={10}
                />
                <YAxis 
                  hide 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col gap-3 min-w-[200px]">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{data.fullDate}</p>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valoare Depozite + Dobândă</p>
                            <p className="text-xl font-black text-slate-900 tracking-tighter">
                              {formatCurrency(payload[0].value as number, 'RON')}
                            </p>
                          </div>
                          <div className="pt-2">
                             <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-tighter w-fit">
                               <TrendingUp className="w-3 h-3" />
                               Include 10% Impozit Reținut
                             </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="netValue" 
                  stroke="#10b981" 
                  strokeWidth={6} 
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ 
                    r: 10, 
                    strokeWidth: 4, 
                    stroke: 'rgba(16, 185, 129, 0.2)',
                    fill: '#10b981'
                  }}
                  animationDuration={3000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <TrendingUp className="w-64 h-64 text-white" />
          </div>
        </motion.div>
      )}

      {/* Currency Details List (Stats Grid) */}
      {cardSettings['currency_stats'].visible && (
        <motion.div 
          variants={itemVariants}
          className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/30" />
              Distribuție Analitică Monede
            </h4>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setConfirmHideId('currency_stats')}
                className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
              >
                <EyeOff className="w-4 h-4" />
              </button>
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">
                {new Date().toLocaleDateString('ro-RO')}
              </div>
            </div>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(totals.byCurrency).map(([cur, val], idx) => {
            const info = CURRENCY_INFO[cur] || { icon: cur[0], name: cur };
            const percentage = (val as number / totals.totalInBase) * 100;
            
            // Calculate total in original currency for this group
            const totalInOriginal = savings
              .filter(s => s.currency === cur)
              .reduce((acc, s) => acc + s.amount, 0);
            
            return (
              <motion.div 
                key={cur}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-5 rounded-[2.5rem] bg-slate-50 hover:bg-white transition-all border border-transparent hover:border-slate-100 group shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
              >
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-[1.2rem] bg-white border border-slate-100 flex items-center justify-center font-black text-xl text-slate-900 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                     {info.icon}
                   </div>
                   <div>
                     <p className="text-sm font-black text-slate-900">{info.name}</p>
                     <p className="text-[10px] font-black text-primary mt-0.5">
                       {formatCurrency(totalInOriginal, cur as Currency)}
                     </p>
                     <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">
                       1 {cur} = {(rates[cur] || 1).toFixed(4)} RON
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{formatCurrency(val as number, 'RON')}</p>
                   <div 
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black mt-2 shadow-sm transition-all border border-white/20",
                      percentage > 30 ? "bg-emerald-500 text-white" : "bg-slate-900 text-white group-hover:bg-primary"
                    )}
                   >
                     {percentage.toFixed(1)}% <span className="opacity-50 tracking-tighter">DIN TOTAL</span>
                   </div>
                 </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    )}
      
      {/* Footer Info */}
      <motion.footer 
        variants={itemVariants}
        className="pt-8 flex flex-col md:flex-row justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] gap-6 text-center md:text-left"
      >
        <div className="space-y-1">
          <p className="bg-slate-100 px-3 py-1 rounded-full inline-block">Conversie live curs BNR est.</p>
          <p className="block">1 EUR = {rates.EUR?.toFixed(4)} RON | 1 USD = {rates.USD?.toFixed(4)} RON | 1g Aur = {(rates.XAU || DEFAULT_RATES.XAU).toFixed(2)} RON</p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Securitate</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Termeni</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span>
          </div>
          <p>© 2026 SmartAVR Financial Ecosystem</p>
        </div>
      </motion.footer>
    </motion.div>
  );
};

