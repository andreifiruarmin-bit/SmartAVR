import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Filter, TrendingUp } from 'lucide-react';
import { Saving, Currency } from '../../types';
import { convertToRON } from '../../lib/utils';
import { getAssetAttributes } from '../../lib/assetUtils';

interface SavingsResultsViewProps {
  summaryFilter: { category: string; value: string } | null;
  filteredSavings: Saving[];
  onBack: () => void;
  onEdit: (saving: Saving) => void;
  displayCurrency: Currency;
  rates: Record<string, number>;
}

export const SavingsResultsView: React.FC<SavingsResultsViewProps> = ({
  summaryFilter,
  filteredSavings,
  onBack,
  onEdit,
  displayCurrency,
  rates
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest px-1">Înapoi la Dashboard</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-primary/20 p-8 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Active: <span className="text-primary">{summaryFilter?.value}</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Filtrat după {summaryFilter?.category === 'type' ? 'Categorie' : 
                           summaryFilter?.category === 'currency' ? 'Valută' : 
                           summaryFilter?.category === 'liquidity' ? 'Lichiditate' :
                           summaryFilter?.category === 'risk' ? 'Risc' : 'Orizont'}
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"
          >
            <Filter className="w-6 h-6" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSavings.length > 0 ? (
            filteredSavings.map(s => (
              <div 
                key={s.id} 
                className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary transition-all cursor-pointer"
                onClick={() => onEdit(s)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-base">{s.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 dark:text-white text-base">
                    {s.amount.toLocaleString()} {s.currency}
                  </p>
                  <p className="text-[10px] font-black text-primary uppercase">
                    ≈ {(convertToRON(s.amount, s.currency, rates) / (displayCurrency === 'RON' ? 1 : rates[displayCurrency])).toLocaleString()} {displayCurrency}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest">
              Nu am găsit active pentru selecția făcută.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
