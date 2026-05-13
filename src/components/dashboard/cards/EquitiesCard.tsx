import React, { useMemo } from 'react';
import { TrendingUp, Layers, FileText, ChevronRight } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { formatCurrency, convertToRON, cn } from '../../../lib/utils';
import { motion } from 'motion/react';

interface EquitiesCardProps {
  savings: Saving[];
  rates: Record<string, number>;
  displayCurrency: Currency;
  onClick?: () => void;
}

export const EquitiesCard: React.FC<EquitiesCardProps> = ({ 
  savings, 
  rates, 
  displayCurrency, 
  onClick 
}) => {
  const totalValue = useMemo(() => {
    const assets = savings.filter(s => 
      s.type === SavingType.STOCKS || 
      s.type === SavingType.ETF || 
      s.type === SavingType.BONDS
    );
    const sumRON = assets.reduce((acc, s) => acc + convertToRON(s.amount, s.currency, rates), 0);
    return displayCurrency === 'RON' ? sumRON : sumRON / (rates[displayCurrency] || 1);
  }, [savings, rates, displayCurrency]);

  return (
    <motion.div 
      whileHover={typeof window !== 'undefined' && window.innerWidth > 768 ? { y: -5 } : undefined}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative group transition-all duration-300 cursor-pointer",
        "md:hover:border-indigo-500 md:hover:shadow-xl md:hover:shadow-indigo-500/5"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl md:group-hover:bg-indigo-500 md:group-hover:text-white transition-all duration-500">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Piață de capital</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalValue, displayCurrency)}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900">
              <TrendingUp className="w-2.5 h-2.5 text-indigo-500" />
            </div>
            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900">
              <Layers className="w-2.5 h-2.5 text-indigo-500" />
            </div>
            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900">
              <FileText className="w-2.5 h-2.5 text-indigo-500" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Mixt</p>
        </div>
        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
          <span className="text-[10px] font-black uppercase">Piață</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
};
