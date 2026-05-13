import React, { useMemo } from 'react';
import { Coins, ChevronRight } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { formatCurrency, convertToRON, cn } from '../../../lib/utils';
import { motion } from 'motion/react';

interface GoldAssetsCardProps {
  savings: Saving[];
  rates: Record<string, number>;
  displayCurrency: Currency;
  onClick?: () => void;
}

export const GoldAssetsCard: React.FC<GoldAssetsCardProps> = ({ 
  savings, 
  rates, 
  displayCurrency, 
  onClick 
}) => {
  const totalValue = useMemo(() => {
    const gold = savings.filter(s => s.type === SavingType.GOLD);
    const sumRON = gold.reduce((acc, s) => acc + convertToRON(s.amount, s.currency, rates), 0);
    return displayCurrency === 'RON' ? sumRON : sumRON / (rates[displayCurrency] || 1);
  }, [savings, rates, displayCurrency]);

  const totalGrams = useMemo(() => {
    const gold = savings.filter(s => s.type === SavingType.GOLD);
    return gold.reduce((acc, s) => acc + ((s as any).weightInGrams || 0), 0);
  }, [savings]);

  return (
    <motion.div 
      whileHover={typeof window !== 'undefined' && window.innerWidth > 768 ? { y: -5 } : undefined}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative group transition-all duration-300 cursor-pointer",
        "md:hover:border-amber-500 md:hover:shadow-xl md:hover:shadow-amber-500/5"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl md:group-hover:bg-amber-500 md:group-hover:text-white transition-all duration-500">
          <Coins className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Active în Aur</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalValue, displayCurrency)}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{totalGrams}g Total</p>
        </div>
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <span className="text-[10px] font-black uppercase">Inventar</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
};
