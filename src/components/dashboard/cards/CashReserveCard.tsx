import React from 'react';
import { motion } from 'motion/react';
import { Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Wallet, EyeOff, Eye } from 'lucide-react';
import { itemVariants } from '../types';

interface CashReserveCardProps {
  value: number;
  displayCurrency: Currency;
  averageDepositYield: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const CashReserveCard: React.FC<CashReserveCardProps> = ({
  value,
  displayCurrency,
  averageDepositYield,
  isVisible,
  onToggleVisibility
}) => {

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
          data-dropdown-option="true"
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80 transition-all duration-200 text-white/60 hover:text-red-100"
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
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-gray-800 px-4 py-3 md:px-6 md:py-4 lg:p-8 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col justify-between relative group transition-all duration-500"
    >
      <div className="flex justify-between items-start z-10">
        <div className="p-3 bg-primary rounded-2xl group-hover:ring-4 group-hover:ring-primary/20 transition-all duration-500">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <button 
              data-dropdown-option="true"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-red-500 transition-all duration-200 text-slate-600 hover:text-red-100"
              aria-label="Ascunde card"
            >
              <EyeOff size={18} />
            </button>
          </div>
          <p className="text-slate-400 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Rezervă Cash</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-gray-100 tracking-tight">
            {formatCurrency(value, displayCurrency)}
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
