import React from 'react';
import { motion } from 'motion/react';
import { Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { TrendingUp, Landmark, EyeOff } from 'lucide-react';
import { itemVariants } from '../types';

interface BankDepositsCardProps {
  value: number;
  displayCurrency: Currency;
  averageDepositYield: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const BankDepositsCard: React.FC<BankDepositsCardProps> = ({
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
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-slate-900 dark:bg-gray-900 px-4 py-3 md:px-6 md:py-4 lg:p-8 rounded-[3rem] shadow-xl shadow-slate-900/10 text-white flex flex-col justify-between border border-slate-800 dark:border-gray-900 relative group overflow-hidden transition-all duration-500"
    >
      <div className="z-10">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
             <p className="text-slate-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Depozite Bancare</p>
             <button 
                data-dropdown-option="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility();
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80 transition-all duration-200 text-white/60 hover:text-red-100"
                aria-label="Ascunde card"
              >
                <EyeOff size={18} />
              </button>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white rounded-full border border-green-400/30">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[10px] font-black">{averageDepositYield.toFixed(2)}%</span>
          </div>
        </div>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">
          {formatCurrency(value, displayCurrency)}
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
      </div>
    </motion.div>
  );
};
