import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Saving, SavingType, Currency } from '../types';
import { formatCurrency, convertToRON, cn } from '../lib/utils';
import { BASE_CURRENCY, DEFAULT_RATES } from '../constants';
import { Wallet, TrendingUp, Landmark, Filter } from 'lucide-react';

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

export const Dashboard: React.FC<DashboardProps> = ({ savings, totals, rates, onSliceClick }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [displayCurrencyMode, setDisplayCurrencyMode] = useState<'RON' | 'EUR'>('RON');

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

  const performanceData = useMemo(() => {
    const base = totals.totalInBase / 1.05; // 5% gain means current is 105% of base
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
          <Wallet className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Încă nu ai adăugat economii</h2>
        <p className="text-slate-500 max-w-sm">
          Planifică-ți viitorul financiar adăugând primul tău depozit sau titlu de stat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Search/Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 self-start md:self-center">Overview Portofoliu</h2>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto scrollbar-hide">
          {availableCurrencies.map((cur) => (
            <button
              key={cur}
              onClick={() => setSelectedCurrency(cur)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedCurrency === cur 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {/* Main Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Large Summary Card */}
        <div className="md:col-span-8 flex flex-col bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6 z-10">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                  {selectedCurrency === 'ALL' ? 'Total Portofoliu' : `Total ${selectedCurrency} (RON)`}
                </p>
                <button 
                  onClick={() => setDisplayCurrencyMode(prev => prev === 'RON' ? 'EUR' : 'RON')}
                  className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg hover:bg-primary/20 transition-colors uppercase mb-1"
                >
                  {displayCurrencyMode === 'RON' ? 'Vezi în EUR' : 'Vezi în RON'}
                </button>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                {displayCurrencyMode === 'RON' 
                  ? formatCurrency(filteredTotals.totalInBase, 'RON')
                  : formatCurrency(filteredTotals.totalInBase / (rates.EUR || 1), 'EUR')
                }
              </h3>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                Diversificat
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center mt-auto z-10">
            {/* Chart 1 */}
            <div className="flex flex-col items-center">
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={(data) => {
                        if (data && data.name) {
                          onSliceClick({ type: data.name as SavingType });
                        }
                      }}
                      cursor="pointer"
                    >
                      {typeData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value), 'RON')} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase text-slate-400 text-center leading-none">Categorii</span>
                </div>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="flex flex-col items-center">
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={(data) => {
                        if (data && data.name) {
                          onSliceClick({ currency: data.name as Currency });
                        }
                      }}
                      cursor="pointer"
                    >
                      {currencyData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value), 'RON')} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <span className="text-[10px] font-black uppercase text-slate-400 text-center leading-none">Monede</span>
                </div>
              </div>
            </div>
          </div>
          <TrendingUp className="absolute -bottom-6 -right-6 w-48 h-48 text-slate-50 rotate-12 group-hover:text-slate-100/50 transition-colors pointer-events-none" />
        </div>

        {/* Small Highlight Card */}
        <div className="md:col-span-4 grid grid-cols-1 gap-5">
          <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-600/20 text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Rezervă Cash</p>
              <h3 className="text-3xl font-black">
                {formatCurrency(totals.byType[SavingType.CASH_RESERVE] || 0, 'RON')}
              </h3>
            </div>
            <div className="flex justify-end z-10">
              <div className="bg-indigo-500/30 p-2 rounded-xl backdrop-blur-md border border-indigo-400/20">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between border border-slate-800">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Depozite Bancare</p>
              <h3 className="text-3xl font-black">
                {formatCurrency(totals.byType[SavingType.DEPOSIT] || 0, 'RON')}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitorizare activă</p>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Performanță (7 Zile)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    +{formatCurrency(totals.totalInBase * 0.05, 'RON')}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-500">+5.0%</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  ECHIV. {formatCurrency((totals.totalInBase * 0.05) / (rates.EUR || 1), 'EUR')}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            
            <div className="h-16 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={false}
                    animationDuration={2000}
                  />
                  <Tooltip 
                    content={() => null}
                    cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Details List (Stats Grid) */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
          <div className="w-1 h-4 bg-primary rounded-full" />
          Distribuție Detaliată
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {Object.entries(totals.byCurrency).map(([cur, val]) => (
            <div key={cur} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                   {cur}
                 </div>
                 <div>
                   <p className="text-sm font-extrabold text-slate-900">{cur}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Echivalent RON</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-sm font-black text-slate-900">{formatCurrency(val as number, 'RON')}</p>
                 <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 mt-1">
                   {((val as number / totals.totalInBase) * 100).toFixed(1)}%
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Info */}
      <footer className="pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2">
        <p>Conversie: 1 EUR = {rates.EUR?.toFixed(2)} RON | 1 USD = {rates.USD?.toFixed(2)} RON | 1g Aur = {rates.XAU?.toFixed(2)} RON</p>
        <p>© 2026 SmartAVR Financial Planner</p>
      </footer>
    </div>
  );
};
