import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Wallet, Edit2, Trash2, Eye } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { convertToRON } from '../../../lib/utils';
import { PieChartWithLegend } from '../cards/PieChartWithLegend';

interface CashSubMenuProps {
  savings: Saving[];
  rates: Record<string, number>;
  onBack: () => void;
  displayCurrency: Currency;
  onEdit: (saving: Saving) => void;
  onDelete: (id: string) => void;
  onViewDetails: (saving: Saving) => void;
}

const COLORS = ['#f43e01', '#10b981', '#f59e0b', '#6366f1', '#1e293b', '#94a3b8'];

export const CashSubMenu: React.FC<CashSubMenuProps> = ({ 
  savings, 
  rates, 
  onBack, 
  displayCurrency,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const [filterCurrency, setFilterCurrency] = React.useState<string | null>(null);
  const [activeSlice, setActiveSlice] = React.useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isMounted = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (filterCurrency && listRef.current) {
        listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      isMounted.current = true;
    }
  }, [filterCurrency]);

  const cashSavings = useMemo(() => 
    savings.filter(s => s.type === SavingType.CASH_RESERVE),
  [savings]);

  const filteredSavings = useMemo(() => {
    if (!filterCurrency) return cashSavings;
    return cashSavings.filter(s => s.currency === filterCurrency);
  }, [cashSavings, filterCurrency]);

  const currencyData = useMemo(() => {
    const byCurrency: Record<string, number> = {};
    cashSavings.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      byCurrency[s.currency] = (byCurrency[s.currency] || 0) + ronValue;
    });
    return Object.entries(byCurrency).map(([name, value]) => ({ name, value }));
  }, [cashSavings, rates]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Ești sigur că vrei să ștergi "${name}"? Această acțiune este ireversibilă.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-all"
          aria-label="Înapoi"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Rezervă Cash</h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Detaliere pe monede</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
        {currencyData.length > 0 ? (
          <PieChartWithLegend 
            data={currencyData}
            colors={COLORS}
            title={filterCurrency ? `Filtru: ${filterCurrency}` : "Distribuție Valutară Cash"}
            centerLabel={filterCurrency ? filterCurrency : `${currencyData.length} Monede`}
            centerSubLabel="Cash"
            onSliceClick={(data) => setActiveSlice(data?.name || null)}
            selectedSlice={activeSlice}
            onDoubleClick={(data) => setFilterCurrency(prev => prev === data.name ? null : data.name)}
          />
        ) : (
          <div className="py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">Niciun activ adăugat</div>
        )}
      </div>

      {(filterCurrency || activeSlice) && (
        <div className="flex justify-center">
          <button 
            onClick={() => { setFilterCurrency(null); setActiveSlice(null); }}
            className="px-6 py-2 bg-slate-900 dark:bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all"
          >
            Resetează Toate Filtrele
          </button>
        </div>
      )}

      {/* List of cash assets */}
      <div ref={listRef} className="space-y-4 pt-4">
        {filteredSavings.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex justify-between items-center group/item hover:border-primary transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white">{s.name}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{s.currency}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-black text-slate-900 dark:text-white">
                  {s.amount.toLocaleString()} {s.currency}
                </p>
                {s.currency !== displayCurrency && (
                  <p className="text-[10px] font-black text-primary uppercase">
                    ≈ {(convertToRON(s.amount, s.currency, rates) / (displayCurrency === 'RON' ? 1 : rates[displayCurrency])).toLocaleString()} {displayCurrency}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 transition-all">
                <button 
                  onClick={() => onViewDetails(s)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                  aria-label="Vezi detalii"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => onEdit(s)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-900 dark:hover:bg-primary hover:text-white transition-all shadow-sm"
                  aria-label="Editează"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(s.id, s.name)}
                  className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  aria-label="Șterge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
