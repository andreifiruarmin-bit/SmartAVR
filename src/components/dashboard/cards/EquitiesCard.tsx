import React from 'react';
import { motion } from 'motion/react';
import { Currency, Saving, SavingType } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Activity, EyeOff, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { itemVariants } from '../types';

interface EquitiesCardProps {
  value: number;
  displayCurrency: Currency;
  savings: Saving[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const EquitiesCard: React.FC<EquitiesCardProps> = ({
  value,
  displayCurrency,
  savings,
  isVisible,
  onToggleVisibility
}) => {

  // Get unique symbols from stocks and ETFs
  const equitiesSavings = savings.filter(s => s.type === SavingType.STOCKS || s.type === SavingType.ETF || s.type === SavingType.BONDS);
  const symbols = [...new Set(equitiesSavings.map(s => (s as any).details?.symbol || s.name))];
  const totalValue = equitiesSavings.reduce((sum, s) => sum + s.amount, 0);

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
          data-dropdown-option="true"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-red-500 transition-all duration-200 text-slate-600 hover:text-red-100"
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
      className="bg-white dark:bg-gray-800 px-4 py-3 md:px-6 md:py-4 lg:p-8 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col justify-between relative group transition-all duration-500 overflow-hidden"
    >
      <div className="flex justify-between items-start z-10">
        <div className="p-3 bg-indigo-500 dark:bg-indigo-900 rounded-2xl group-hover:ring-4 group-hover:ring-indigo-500/20 transition-all duration-500">
          <Activity className="w-6 h-6 text-white" />
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
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Acțiuni & ETF & Titluri de Stat</p>
        </div>
      </div>

      <div className="z-10">
        <div className="mb-4">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600 mb-1">📈 Acțiuni & ETF & Titluri de Stat</p>
          <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalValue, 'RON')}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {equitiesSavings.length} active{equitiesSavings.length !== 1 ? ' de investiții' : ' de investiție'}
          </p>
        </div>

        <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(value, displayCurrency)}
          <span className="text-[10px] font-normal text-slate-600 ml-2">Valoare în {displayCurrency}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 mt-6 z-10">
        <div className="w-2 h-2 rounded-full bg-white" />
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Creștere pe termen lung</p>
      </div>
    </motion.div>
  );
};
