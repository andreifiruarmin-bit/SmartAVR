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
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400"
          aria-label={isVisible ? 'Ascunde card' : 'Afișează card'}
        >
          <Eye size={18} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-slate-900 dark:bg-gray-900 px-4 py-3 md:px-6 md:py-4 lg:p-8 rounded-[3rem] shadow-xl shadow-slate-900/10 text-white flex flex-col justify-between border border-slate-800 dark:border-gray-900 relative group overflow-hidden transition-all duration-500"
    >
      <div className="z-10">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
             <p className="text-slate-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Depozite Bancare</p>
             <button 
                onClick={onToggleVisibility}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400"
                aria-label="Ascunde card"
              >
                <EyeOff size={18} />
              </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative transition-opacity">
              <select 
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as any)}
                className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-xs font-black uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="BASE">AUTO</option>
                {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500 dark:bg-emerald-900/20 text-emerald-400 dark:text-emerald-500 rounded-lg">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-black">{averageDepositYield.toFixed(2)}%</span>
            </div>
          </div>
        </div>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">
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
