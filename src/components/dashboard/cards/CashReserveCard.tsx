import React, { useMemo } from 'react';
import { Wallet, ChevronRight } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { formatCurrency, convertToRON, cn } from '../../../lib/utils';
import { motion } from 'motion/react';

interface CashReserveCardProps {
  savings: Saving[];
  rates: Record<string, number>;
  displayCurrency: Currency;
  onClick?: () => void;
}

export const CashReserveCard: React.FC<CashReserveCardProps> = ({ 
  savings, 
  rates, 
  displayCurrency, 
  onClick 
}) => {
  const totalValue = useMemo(() => {
    const cash = savings.filter(s => s.type === SavingType.CASH_RESERVE);
    const sumRON = cash.reduce((acc, s) => acc + convertToRON(s.amount, s.currency, rates), 0);
    return displayCurrency === 'RON' ? sumRON : sumRON / (rates[displayCurrency] || 1);
  }, [savings, rates, displayCurrency]);

  return (
    <motion.div 
      whileHover={typeof window !== 'undefined' && window.innerWidth > 768 ? { y: -5 } : undefined}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative group transition-all duration-300 cursor-pointer",
        "md:hover:border-primary md:hover:shadow-xl md:hover:shadow-primary/5"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl md:group-hover:bg-primary md:group-hover:text-white transition-all duration-500">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Rezervă Cash</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalValue, displayCurrency)}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Fond Disponibil</p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <span className="text-[10px] font-black uppercase">Detalii</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
};
