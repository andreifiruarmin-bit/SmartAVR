import React from 'react';
import { motion } from 'motion/react';
import { Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { TrendingUp, Landmark, EyeOff, Eye, ChevronDown, ArrowUpRight } from 'lucide-react';
import { SavingType } from '../../../types';
import { itemVariants } from '../types';

interface BankDepositsCardProps {
  value: number;
  currency: Currency | 'BASE';
  activeCurrencies: Currency[];
  displayCurrencyMode: 'RON' | 'EUR';
  averageDepositYield: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onCurrencyChange: (c: Currency | 'BASE') => void;
  totals: {
    byType: Record<string, number>;
  };
}

export const BankDepositsCard: React.FC<BankDepositsCardProps> = ({
  value,
  currency,
  activeCurrencies,
  displayCurrencyMode,
  averageDepositYield,
  isVisible,
  onToggleVisibility,
  onCurrencyChange,
  totals
}) => {
  const displayCurrency = currency === 'BASE' ? displayCurrencyMode : currency;
  const depositsValue = totals.byType[SavingType.DEPOSIT] || 0;

  if (!isVisible) {
    return (
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-slate-900 dark:bg-gray-900 p-6 rounded-[3rem] shadow-xl shadow-slate-900/10 text-white flex items-center justify-between group transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Depozite Bancare</p>
            <p className="text-xs text-emerald-400">Ascuns</p>
          </div>
        </div>
        <button 
          onClick={onToggleVisibility}
          className="p-2 text-emerald-400 hover:text-white transition-all rounded-xl hover:bg-white/10"
        >
          <Eye className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-slate-900 dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-slate-900/10 text-white flex flex-col justify-between border border-slate-800 dark:border-gray-900 relative group overflow-hidden transition-all duration-500"
    >
      <div className="z-10">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
             <p className="text-slate-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Depozite Bancare</p>
             <button 
                onClick={onToggleVisibility}
                className="p-1 text-slate-500 dark:text-gray-400 hover:text-red-400 transition-all"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative transition-opacity">
              <select 
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as any)}
                className="appearance-none bg-white dark:bg-gray-800 border border-white dark:border-gray-900 rounded-lg px-2 py-1 pr-6 text-[8px] font-black uppercase text-white focus:outline-none"
              >
                <option value="BASE" className="bg-slate-900 dark:bg-gray-900">Auto</option>
                {activeCurrencies.map(c => <option key={c} value={c} className="bg-slate-900 dark:bg-gray-900">{c}</option>)}
              </select>
              <ChevronDown className="w-2 h-2 text-slate-500 dark:text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500 dark:bg-emerald-900/20 text-emerald-400 dark:text-emerald-500 rounded-lg">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-black">{averageDepositYield.toFixed(2)}%</span>
            </div>
          </div>
        </div>
        <h3 className="text-4xl font-black tracking-tight">
          {formatCurrency(depositsValue, displayCurrency)}
        </h3>
      </div>
      <div className="flex items-center gap-2 mt-4 z-10">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl group-hover:ring-4 group-hover:ring-white dark:group-hover:ring-gray-900/10 transition-all duration-500">
          <Landmark className="w-4 h-4 text-emerald-400 dark:text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest">Randament Mediu Portofoliu</p>
          <p className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-tight italic">Depozite active acum</p>
        </div>
        <ArrowUpRight className="w-3 h-3 text-slate-600 dark:text-gray-400 ml-auto group-hover:text-white dark:group-hover:text-gray-100 transition-colors" />
      </div>
    </motion.div>
  );
};
