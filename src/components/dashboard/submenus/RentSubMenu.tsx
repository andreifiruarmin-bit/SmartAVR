import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Home, Edit2, Trash2, Eye } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { convertToRON } from '../../../lib/utils';
import { PieChartWithLegend } from '../cards/PieChartWithLegend';

interface RentSubMenuProps {
  savings: Saving[];
  rates: Record<string, number>;
  onBack: () => void;
  displayCurrency: Currency;
  onEdit: (saving: Saving) => void;
  onDelete: (id: string) => void;
  onViewDetails: (saving: Saving) => void;
}

const COLORS = ['#10b981', '#059669', '#047857', '#064e3b'];

export const RentSubMenu: React.FC<RentSubMenuProps> = ({ 
  savings, 
  rates, 
  onBack, 
  displayCurrency,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const [filterName, setFilterName] = React.useState<string | null>(null);
  const [activeSlice, setActiveSlice] = React.useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isMounted = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (filterName && listRef.current) {
        listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      isMounted.current = true;
    }
  }, [filterName]);

  const rentSavings = useMemo(() => 
    savings.filter(s => s.type === SavingType.RENT),
  [savings]);

  const filteredRent = useMemo(() => {
    if (!filterName) return rentSavings;
    return rentSavings.filter(s => s.name === filterName);
  }, [rentSavings, filterName]);

  const rentData = useMemo(() => {
    const byName: Record<string, number> = {};
    rentSavings.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      byName[s.name] = (byName[s.name] || 0) + ronValue;
    });
    return Object.entries(byName).map(([name, value]) => ({ name, value }));
  }, [rentSavings, rates]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Ești sigur că vrei să ștergi imobilul "${name}"?`)) {
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Venituri Chirie / Imobiliare</h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Detaliere active imobiliare și chirii</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
        {rentData.length > 0 ? (
          <PieChartWithLegend 
            data={rentData}
            colors={COLORS}
            title={filterName ? `Filtru: ${filterName}` : "Distribuție Imobiliare"}
            centerLabel={filterName ? filterName : `${rentSavings.length} Imobile`}
            centerSubLabel="Imobile"
            onSliceClick={(data) => setActiveSlice(data?.name || null)}
            selectedSlice={activeSlice}
            onDoubleClick={(data) => setFilterName(prev => prev === data.name ? null : data.name)}
          />
        ) : (
          <div className="py-12 text-slate-400 font-bold uppercase tracking-widest text-xs font-black">Niciun imobil</div>
        )}
      </div>

      {(filterName || activeSlice) && (
        <div className="flex justify-center">
          <button 
            onClick={() => { setFilterName(null); setActiveSlice(null); }}
            className="px-6 py-2 bg-slate-900 dark:bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all"
          >
            Resetează Toate Filtrele
          </button>
        </div>
      )}

      <div ref={listRef} className="space-y-4 pt-4">
        {filteredRent.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex justify-between items-center group/item md:hover:border-emerald-500 transition-all relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl md:group-hover/item:bg-emerald-500 md:group-hover/item:text-white transition-all">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white">{s.name}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Imobil • Venit Chirie
                </p>
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
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg md:hover:bg-slate-900 dark:md:hover:bg-primary md:hover:text-white transition-all shadow-sm active:bg-slate-900 dark:active:bg-primary active:text-white"
                  aria-label="Editează"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(s.id, s.name)}
                  className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg md:hover:bg-red-500 md:hover:text-white transition-all shadow-sm active:bg-red-500 active:text-white"
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
