import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PieChartIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Saving, SavingType, Currency } from '../../../types';
import { formatCurrency, convertToRON, cn } from '../../../lib/utils';
import { getAssetAttributes } from '../../../lib/assetUtils';
import { PieChartWithLegend } from './PieChartWithLegend';

interface PortfolioSummaryCardProps {
  savings: Saving[];
  totals: {
    totalInBase: number;
    byCurrency: Record<string, number>;
    byType: Record<string, number>;
  };
  rates: Record<string, number>;
  displayCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  actualCurrencies: Currency[];
  onSliceDoubleClick?: (filter: { category: string; value: string } | string) => void;
  onSliceClick?: (filter: { category: string; value: string } | null) => void;
  currentFilter?: { category: string; value: string } | null;
}

const COLORS = [
  '#f43e01', // Primary
  '#10b981', // Emerald
  '#f59e0b', // Amber/Gold
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#1e293b'  // Slate
];

export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  savings,
  totals,
  rates,
  displayCurrency,
  onCurrencyChange,
  actualCurrencies,
  onSliceDoubleClick,
  onSliceClick,
  currentFilter
}) => {
  const [activePie, setActivePie] = React.useState(0);
  const [selectedSlice, setSelectedSlice] = React.useState<string | null>(null);

  // Sync internal selected slice with the globally active filter
  React.useEffect(() => {
    if (!currentFilter) {
      setSelectedSlice(null);
    } else {
      // If there is a filter but it belongs to another category, clear highlight on this pie
      // unless we are in that category and the value matches.
      const currentActiveId = [
        { id: 'type' },
        { id: 'currency' },
        { id: 'liquidity' },
        { id: 'risk' },
        { id: 'horizon' }
      ][activePie].id;

      if (currentFilter.category === currentActiveId) {
        setSelectedSlice(currentFilter.value);
      } else {
        setSelectedSlice(null);
      }
    }
  }, [currentFilter, activePie]);

  const displayTotal = useMemo(() => {
    if (displayCurrency === 'RON') return totals.totalInBase;
    return totals.totalInBase / (rates[displayCurrency] || 1);
  }, [totals.totalInBase, rates, displayCurrency]);

  const handleCurrencySwitch = (cur: Currency) => {
    onCurrencyChange(cur);
  };

  const typeData = useMemo(() => 
    Object.entries(totals.byType).map(([name, value]) => ({ name, value })),
  [totals.byType]);

  const currencyData = useMemo(() => 
    Object.entries(totals.byCurrency).map(([name, value]) => ({ 
      name: name === 'XAU' ? 'AUR' : name, 
      value 
    })),
  [totals.byCurrency]);

  // Compute stats from real data
  const { liquidityData, riskData, horizonData } = useMemo(() => {
    const liq: Record<string, number> = { 'Lichid': 0, 'Semi-lichid': 0, 'Blocat': 0 };
    const risk: Record<string, number> = { 'Scăzut': 0, 'Mediu': 0, 'Ridicat': 0 };
    const hor: Record<string, number> = { 'Sub 1 an': 0, '1-3 ani': 0, 'Peste 3 ani': 0 };

    savings.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      const attrs = getAssetAttributes(s.type);
      liq[attrs.liquidity] += ronValue;
      risk[attrs.risk] += ronValue;
      hor[attrs.horizon] += ronValue;
    });

    return {
      liquidityData: Object.entries(liq).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })),
      riskData: Object.entries(risk).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })),
      horizonData: Object.entries(hor).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }))
    };
  }, [savings, rates]);

  const allCharts = [
    { id: 'type', title: 'Categorii Active', data: typeData, label: 'Categorii', isType: true },
    { id: 'currency', title: 'Expunere Valutară', data: currencyData, label: 'Valute' },
    { id: 'liquidity', title: 'Profil Lichiditate', data: liquidityData, label: 'Lichiditate' },
    { id: 'risk', title: 'Profil Risc', data: riskData, label: 'Risc' },
    { id: 'horizon', title: 'Orizont Timp', data: horizonData, label: 'Orizont' }
  ];

  const handlePieChange = (index: number) => {
    setActivePie(index);
    setSelectedSlice(null);
    onSliceClick?.(null);
  };

  const nextPie = () => handlePieChange((activePie + 1) % allCharts.length);
  const prevPie = () => handlePieChange((activePie - 1 + allCharts.length) % allCharts.length);

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden transition-colors dark:bg-slate-900 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Sold Total Portofoliu</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(displayTotal, displayCurrency)}
          </h2>
          
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleCurrencySwitch('RON')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm",
                displayCurrency === 'RON' ? "bg-slate-900 text-white dark:bg-primary" : "bg-slate-50 text-slate-400 md:hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-500"
              )}
            >
              RON
            </button>
            {actualCurrencies.filter(c => c !== 'RON' && c !== 'AUR').map(cur => (
              <button
                key={cur}
                onClick={() => handleCurrencySwitch(cur)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm",
                  displayCurrency === cur ? "bg-slate-900 text-white dark:bg-primary" : "bg-slate-50 text-slate-400 md:hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-500"
                )}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative bg-slate-50 dark:bg-slate-800/50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group transition-colors">
        <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20">
          <button 
            onClick={prevPie}
            className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 text-slate-400 md:hover:text-primary transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full flex items-center justify-center overflow-hidden">
          <motion.div
            key={activePie}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <PieChartWithLegend 
              data={allCharts[activePie].data}
              colors={COLORS}
              centerLabel={`${allCharts[activePie].data.length} Poziții`}
              centerSubLabel={allCharts[activePie].label}
              title={allCharts[activePie].title}
              selectedSlice={selectedSlice}
              onSliceClick={(data) => {
                const nextSlice = data ? data.name : null;
                setSelectedSlice(nextSlice);
                // First click only updates internal highlight state.
                // We don't call props.onSliceClick here to prevent premature filtering.
              }}
              onDoubleClick={(data) => {
                // Second click confirms selection and triggers filtering/navigation
                const filter = { category: allCharts[activePie].id, value: data.name };
                onSliceClick?.(filter);
                onSliceDoubleClick?.(filter);
              }}
            />
          </motion.div>
        </div>

        <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20">
          <button 
            onClick={nextPie}
            className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 text-slate-400 md:hover:text-primary transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Indicator dots */}
        <div className="flex gap-1.5 justify-center mt-6">
          {allCharts.map((_, i) => (
            <button 
              key={i} 
              onClick={() => handlePieChange(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                activePie === i ? "bg-primary w-6" : "bg-slate-200 dark:bg-slate-700 md:hover:bg-slate-300"
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
