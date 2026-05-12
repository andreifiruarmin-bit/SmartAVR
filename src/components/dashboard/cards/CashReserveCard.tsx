import React from 'react';
import { motion } from 'motion/react';
import { Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Wallet, EyeOff, Eye, ChevronDown } from 'lucide-react';
import { SavingType } from '../../../types';
import { itemVariants } from '../types';

interface CashReserveCardProps {
  value: number;
  currency: Currency | 'BASE';
  activeCurrencies: Currency[];
  displayCurrencyMode: 'RON' | 'EUR';
  isVisible: boolean;
  onToggleVisibility: () => void;
  onCurrencyChange: (c: Currency | 'BASE') => void;
  totals: {
    byType: Record<string, number>;
  };
}

export const CashReserveCard: React.FC<CashReserveCardProps> = ({
  value,
  currency,
  activeCurrencies,
  displayCurrencyMode,
  isVisible,
  onToggleVisibility,
  onCurrencyChange,
  totals
}) => {
  const displayCurrency = currency === 'BASE' ? displayCurrencyMode : currency;
  const cashValue = totals.byType[SavingType.CASH_RESERVE] || 0;

  if (!isVisible) {
    return (
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm flex items-center justify-between group transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-gray-100">Rezervă Cash</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">Ascuns</p>
          </div>
        </div>
        <button 
          onClick={onToggleVisibility}
          className="p-2 text-slate-400 dark:text-gray-400 hover:text-primary transition-all rounded-xl hover:bg-primary/10"
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
      className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col justify-between relative group transition-all duration-500"
    >
      <div className="flex justify-between items-start z-10">
        <div className="p-3 bg-primary rounded-2xl group-hover:ring-4 group-hover:ring-primary/20 transition-all duration-500">
          <Wallet className="w-6 h-6 text-white" />
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
          <p className="text-slate-400 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Rezervă Cash</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-gray-100 tracking-tight">
            {formatCurrency(cashValue, displayCurrency)}
          </h3>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-6 z-10">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <p className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest">Fond de urgență</p>
      </div>
    </motion.div>
  );
};
