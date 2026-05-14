import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Layers, FileText, Edit2, Trash2, Eye } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { convertToRON } from '../../../lib/utils';
import { PieChartWithLegend } from '../cards/PieChartWithLegend';

interface EquitiesSubMenuProps {
  savings: Saving[];
  rates: Record<string, number>;
  onBack: () => void;
  displayCurrency: Currency;
  onEdit: (saving: Saving) => void;
  onDelete: (id: string) => void;
  onViewDetails: (saving: Saving) => void;
}

const COLORS = ['#f43e01', '#6366f1', '#f59e0b', '#10b981', '#1e293b', '#94a3b8'];

export const EquitiesSubMenu: React.FC<EquitiesSubMenuProps> = ({ 
  savings, 
  rates, 
  onBack, 
  displayCurrency,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const [filterType, setFilterType] = React.useState<string | null>(null);
  const [activeSlice, setActiveSlice] = React.useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isMounted = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (filterType && listRef.current) {
        listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      isMounted.current = true;
    }
  }, [filterType]);

  const equityAssets = useMemo(() => 
    savings.filter(s => 
      s.type === SavingType.STOCKS || 
      s.type === SavingType.ETF || 
      s.type === SavingType.BONDS
    ),
  [savings]);

  const filteredAssets = useMemo(() => {
    if (!filterType) return equityAssets;
    return equityAssets.filter(s => s.type === filterType);
  }, [equityAssets, filterType]);

  const typeData = useMemo(() => {
    const byType: Record<string, number> = {};
    equityAssets.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      byType[s.type] = (byType[s.type] || 0) + ronValue;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [equityAssets, rates]);

  const instrumentIcons: Record<string, any> = {
    [SavingType.STOCKS]: TrendingUp,
    [SavingType.ETF]: Layers,
    [SavingType.BONDS]: FileText,
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Ești sigur că vrei să ștergi activul "${name}"?`)) {
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Investiții Bursiere & Titluri</h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Distribuție Acțiuni, ETF și Titluri de Stat</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
        {typeData.length > 0 ? (
          <PieChartWithLegend 
            data={typeData}
            colors={COLORS}
            title={filterType ? `Filtru: ${filterType}` : "Distribuție Instrumente"}
            centerLabel={filterType ? filterType : `${typeData.length} Tipuri`}
            centerSubLabel="Instrumente"
            onSliceClick={(data) => setActiveSlice(data?.name || null)}
            selectedSlice={activeSlice}
            onDoubleClick={(data) => setFilterType(prev => prev === data.name ? null : data.name)}
          />
        ) : (
          <div className="py-12 text-slate-400 font-bold uppercase tracking-widest text-xs font-black">Niciun activ</div>
        )}
      </div>

      {(filterType || activeSlice) && (
        <div className="flex justify-center">
          <button 
            onClick={() => { setFilterType(null); setActiveSlice(null); }}
            className="px-6 py-2 bg-slate-900 dark:bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all"
          >
            Resetează Toate Filtrele
          </button>
        </div>
      )}

      <div ref={listRef} className="space-y-4 pt-4">
        {filteredAssets.map(s => {
          const Icon = instrumentIcons[s.type] || TrendingUp;
          return (
            <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex justify-between items-center group/item hover:border-indigo-500 transition-all relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.type}</p>
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
          );
        })}
      </div>
    </div>
  );
};
