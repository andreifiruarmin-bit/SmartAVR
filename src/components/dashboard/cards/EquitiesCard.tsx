import React from 'react';
import { motion } from 'motion/react';
import { Currency, Saving, SavingType } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Activity, EyeOff, Eye, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { itemVariants } from '../types';

interface EquitiesCardProps {
  value: number;
  currency: Currency | 'BASE';
  activeCurrencies: Currency[];
  displayCurrencyMode: 'RON' | 'EUR';
  savings: Saving[];
  rates: Record<string, number>;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onCurrencyChange: (c: Currency | 'BASE') => void;
  totals: {
    byType: Record<string, number>;
  };
}

export const EquitiesCard: React.FC<EquitiesCardProps> = ({
  value,
  currency,
  activeCurrencies,
  displayCurrencyMode,
  savings,
  rates,
  isVisible,
  onToggleVisibility,
  onCurrencyChange,
  totals
}) => {
  const displayCurrency = currency === 'BASE' ? displayCurrencyMode : currency;
  const stocksValue = (totals.byType[SavingType.STOCKS] || 0) + (totals.byType[SavingType.ETF] || 0);

  // Get unique symbols from stocks and ETFs
  const equitiesSavings = savings.filter(s => s.type === SavingType.STOCKS || s.type === SavingType.ETF);
  const symbols = [...new Set(equitiesSavings.map(s => (s as any).details?.symbol || s.name))];

  // Calculate performance for each symbol
  const symbolPerformance = symbols.map(symbol => {
    const symbolSavings = equitiesSavings.filter(s => (s as any).details?.symbol === symbol || s.name === symbol);
    const totalInvested = symbolSavings.reduce((sum, s) => sum + s.amount, 0);
    const currentValue = symbolSavings.reduce((sum, s) => {
      const currentPrice = (s as any).details?.currentPrice || 0;
      const quantity = (s as any).details?.quantity || 0;
      return sum + (currentPrice * quantity);
    }, 0);
    const avgAcquisitionPrice = symbolSavings.reduce((sum, s) => sum + ((s as any).details?.averageAcquisitionPrice || 0), 0) / symbolSavings.length;
    const performance = avgAcquisitionPrice > 0 ? ((currentValue / totalInvested) - 1) * 100 : 0;

    return {
      symbol,
      performance,
      currentValue,
      totalInvested
    };
  });

  if (!isVisible) {
    return (
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm flex items-center justify-between group transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 dark:bg-indigo-900 rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-gray-100">Acțiuni & ETF</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">Ascuns</p>
          </div>
        </div>
        <button 
          onClick={onToggleVisibility}
          className="p-2 text-slate-400 dark:text-gray-400 hover:text-indigo-500 transition-all rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        >
          <Eye className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col justify-between relative group transition-all duration-500 overflow-hidden"
    >
      <div className="flex justify-between items-start z-10">
        <div className="p-3 bg-indigo-500 dark:bg-indigo-900 rounded-2xl group-hover:ring-4 group-hover:ring-indigo-500/20 transition-all duration-500">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <div className="relative">
              <select 
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as any)}
                className="appearance-none bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-lg px-2 py-1 pr-6 text-[8px] font-black uppercase focus:outline-none"
              >
                <option value="BASE">Auto</option>
                {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-2 h-2 text-slate-400 dark:text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button 
              onClick={onToggleVisibility}
              className="p-1 text-slate-300 dark:text-gray-400 hover:text-red-500 transition-all"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-400 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Piața de Capital</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-gray-100 tracking-tight">
            {formatCurrency(stocksValue, displayCurrency)}
          </h3>
        </div>
      </div>
      
      {/* Symbols List */}
      <div className="mt-4 space-y-2 z-10">
        <p className="text-[9px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">Portofoliu</p>
        <div className="grid grid-cols-1 gap-2">
          {symbolPerformance.slice(0, 4).map(({ symbol, performance, currentValue }) => (
            <div key={symbol} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-gray-700 rounded-lg">
              <span className="text-xs font-black text-slate-900 dark:text-gray-100">{symbol}</span>
              <div className="flex items-center gap-1">
                {performance >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-black ${performance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {performance >= 0 ? '+' : ''}{performance.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
          {symbols.length > 4 && (
            <p className="text-[9px] text-slate-400 dark:text-gray-400 text-center">
              +{symbols.length - 4} mai multe...
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-6 z-10">
        <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-900" />
        <p className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest">Acțiuni & ETF-uri</p>
      </div>
    </motion.div>
  );
};
