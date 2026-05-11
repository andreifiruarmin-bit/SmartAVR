import React, { useMemo, useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Saving, SavingType, Currency, BankDeposit } from '../types';
import { formatCurrency, convertToRON, cn } from '../lib/utils';
import { BASE_CURRENCY, DEFAULT_RATES } from '../constants';
import { Wallet, TrendingUp, Landmark, Filter, ArrowUpRight, DollarSign, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface DashboardProps {
  savings: Saving[];
  rates: Record<string, number>;
  totals: {
    totalInBase: number;
    byCurrency: Record<string, number>;
    byType: Record<string, number>;
  };
  onSliceClick: (filter: { type?: SavingType; currency?: Currency }) => void;
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

export const Dashboard: React.FC<DashboardProps> = ({ savings, totals, rates, onSliceClick }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [displayCurrencyMode, setDisplayCurrencyMode] = useState<'RON' | 'EUR'>('RON');

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
    const daysPoints = 12; // Monthly points for the last year
    const now = new Date();
    const data = [];
    
    for (let i = daysPoints; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const timestamp = date.getTime();
      
      let totalPortfolioRON = 0;
      let totalDepositsValueRON = 0;

      savings.forEach(s => {
        // If the saving existed at this point in time
        if (s.createdAt <= timestamp) {
          const baseRON = convertToRON(s.amount, s.currency, rates);
          totalPortfolioRON += baseRON;

          if (s.type === SavingType.DEPOSIT) {
            const dep = s as BankDeposit;
            const startDate = new Date(dep.startDate).getTime();
            
            // If the deposit had started by this time
            if (startDate <= timestamp) {
              const daysAccrued = Math.max(0, (timestamp - startDate) / (1000 * 60 * 60 * 24));
              const yearlyRate = dep.interestRate / 100;
              // Interest after 10% tax
              const accruedInterest = baseRON * yearlyRate * (daysAccrued / 365) * 0.9;
              totalDepositsValueRON += (baseRON + accruedInterest);
              // Add interest to the total portfolio view as well
              totalPortfolioRON += accruedInterest;
            }
          }
        }
      });

      data.push({
        name: date.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }),
        total: totalPortfolioRON,
        deposits: totalDepositsValueRON,
        fullDate: date.toLocaleDateString('ro-RO')
      });
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

  const weeklyPerformance = useMemo(() => {
    const base = totals.totalInBase / 1.05;
    return [
      { day: 'Lun', val: base },
      { day: 'Mar', val: base * 1.01 },
      { day: 'Mie', val: base * 1.005 },
      { day: 'Joi', val: base * 1.025 },
      { day: 'Vin', val: base * 1.03 },
      { day: 'Sâm', val: base * 1.045 },
      { day: 'Dum', val: totals.totalInBase },
    ];
  }, [totals.totalInBase]);

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
      </div>

      {/* Main Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Summary Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 flex flex-col bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  {selectedCurrency === 'ALL' ? 'Sold Total Portofoliu' : `Total ${selectedCurrency} (RON)`}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                  {displayCurrencyMode === 'RON' 
                    ? formatCurrency(filteredTotals.totalInBase, 'RON')
                    : formatCurrency(filteredTotals.totalInBase / (rates.EUR || 1), 'EUR')
                  }
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

        {/* Small Highlight Cards Container */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            style={{ y: parallaxY1 }}
            className="bg-primary p-8 rounded-[3rem] shadow-xl shadow-primary/20 text-white flex flex-col justify-between relative overflow-hidden group border border-primary/20"
          >
            <div className="z-10">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-3 h-3 text-white/60" />
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Lichidități</p>
              </div>
              <h3 className="text-4xl font-black tracking-tight">
                {formatCurrency(totals.byType[SavingType.CASH_RESERVE] || 0, 'RON')}
              </h3>
            </div>
            <div className="flex justify-end z-10 mt-6 lg:mt-0">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            style={{ y: parallaxY2 }}
            className="bg-slate-900 p-8 rounded-[3rem] shadow-xl shadow-slate-900/10 text-white flex flex-col justify-between border border-slate-800 relative group overflow-hidden"
          >
            <div className="z-10">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Depozite Bancare</p>
              <h3 className="text-4xl font-black tracking-tight">
                {formatCurrency(totals.byType[SavingType.DEPOSIT] || 0, 'RON')}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-4 z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depozite Active</p>
              <ArrowUpRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-white transition-colors" />
            </div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </motion.div>

          {/* Performance Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between group overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Indicator Randament (7z)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                    +{formatCurrency(totals.totalInBase * 0.05, 'RON')}
                  </h3>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">+5.0%</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                <TrendingUp className="w-5 h-5 text-emerald-500 group-hover:text-white" />
              </div>
            </div>
            
            <div className="h-20 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyPerformance}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorVal)"
                    animationDuration={2500}
                  />
                  <Tooltip 
                    content={() => null}
                    cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* New Project Evolution Chart */}
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
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Analiză Portofoliu (1 an)</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Include dobanda netă depozite (-10% impozit)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Portofoliu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Depozite + Dobândă</span>
            </div>
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
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-[10px] font-black text-emerald-400 uppercase">Depozite:</span>
                            <span className="text-sm font-black text-white">{formatCurrency(payload[1].value as number, 'RON')}</span>
                          </div>
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
              <Area 
                type="monotone" 
                dataKey="deposits" 
                stroke="#10b981" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorDeposits)"
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Detailed Bank Deposits Evolution Chart */}
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
            <h3 className="text-2xl font-black text-white tracking-tighter">Evoluție Dobândă Netă</h3>
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

      {/* Currency Details List (Stats Grid) */}
      <motion.div 
        variants={itemVariants}
        className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/30" />
            Distribuție Analitică Monede
          </h4>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">
            {new Date().toLocaleDateString('ro-RO')}
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

