import React, { useMemo } from 'react';
import { Landmark, TrendingUp, ChevronRight } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { formatCurrency, convertToRON, cn } from '../../../lib/utils';
import { motion } from 'motion/react';

interface BankDepositsCardProps {
  savings: Saving[];
  rates: Record<string, number>;
  displayCurrency: Currency;
  averageYield: number;
  onClick?: () => void;
}

export const BankDepositsCard: React.FC<BankDepositsCardProps> = ({ 
  savings, 
  rates, 
  displayCurrency,
  averageYield,
  onClick 
}) => {
  const totalValue = useMemo(() => {
    const deps = savings.filter(s => s.type === SavingType.DEPOSIT);
    const sumRON = deps.reduce((acc, s) => acc + convertToRON(s.amount, s.currency, rates), 0);
    return displayCurrency === 'RON' ? sumRON : sumRON / (rates[displayCurrency] || 1);
  }, [savings, rates, displayCurrency]);

  return (
    <motion.div 
      whileHover={typeof window !== 'undefined' && window.innerWidth > 768 ? { y: -5 } : undefined}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative group transition-all duration-300 cursor-pointer",
        "md:hover:border-slate-900 dark:md:hover:border-primary md:hover:shadow-xl md:hover:shadow-slate-900/5 dark:md:hover:shadow-primary/5"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl md:group-hover:bg-slate-800 dark:md:group-hover:bg-primary transition-all duration-500">
          <Landmark className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Depozite Bancare</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalValue, displayCurrency)}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-100 dark:border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            {averageYield.toFixed(2)}%
          </span>
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">DOBÂNDĂ MEDIE</p>
        </div>
        <div className="flex items-center gap-1 text-slate-900 dark:text-white">
          <span className="text-[10px] font-black uppercase">Analiză</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
};
