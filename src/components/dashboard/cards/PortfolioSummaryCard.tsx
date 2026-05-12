import React from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Saving, Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Filter, PieChart as PieChartIcon, X, AlertTriangle } from 'lucide-react';
import { COLORS, CURRENCIES, itemVariants } from '../types';
import { CustomTooltip } from './CustomTooltip';

interface PortfolioSummaryCardProps {
  savings: Saving[];
  totals: {
    totalInBase: number;
    byCurrency: Record<string, number>;
    byType: Record<string, number>;
    averageYield: number;
    averageDepositYield: number;
    totalDepositsBase: number;
  };
  rates: Record<string, number>;
  filteredTotals: { totalInBase: number; byType: Record<string, number> };
  typeData: Array<{ name: string; value: number }>;
  currencyData: Array<{ name: string; value: number }>;
  selectedCurrency: Currency | 'ALL';
  availableCurrencies: (Currency | 'ALL')[];
  displayCurrencyMode: 'RON' | 'EUR';
  activeSliceIndex: number | null;
  onPieClick: (_data: unknown, index: number) => void;
  onSliceIndexClose: () => void;
  onCurrencyChange: (c: Currency | 'ALL') => void;
  onDisplayModeToggle: () => void;
  isRatesStale: boolean;
}

export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  savings,
  totals,
  rates,
  filteredTotals,
  typeData,
  currencyData,
  selectedCurrency,
  availableCurrencies,
  displayCurrencyMode,
  activeSliceIndex,
  onPieClick,
  onSliceIndexClose,
  onCurrencyChange,
  onDisplayModeToggle,
  isRatesStale
}) => {
  const getPortfolioValue = () => {
    if (selectedCurrency === 'ALL') return filteredTotals.totalInBase;
    const selectedSavings = savings.filter(s => s.currency === selectedCurrency);
    return selectedSavings.reduce((sum, s) => {
      const ronValue = s.amount * (rates[s.currency] || 1);
      return sum + (displayCurrencyMode === 'EUR' ? ronValue / (rates.EUR || 1) : ronValue);
    }, 0);
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm relative group transition-all duration-500"
    >
      {/* Stale Rates Banner */}
      {isRatesStale && (
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm">
          <AlertTriangle size={16} />
          <span>Cursurile valutare ar putea fi neactualizate. Ultima actualizare: {new Date(rates.lastUpdated).toLocaleDateString('ro-RO')}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 z-10">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-slate-400 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                {selectedCurrency === 'ALL' ? 'Sold Total Portofoliu' : `Total ${selectedCurrency} (RON)`}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-gray-100 tracking-tighter break-all sm:break-normal">
              {formatCurrency(getPortfolioValue(), displayCurrencyMode as Currency)}
            </h3>
            <button 
              onClick={onDisplayModeToggle}
              className="px-4 py-2 bg-slate-900 dark:bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-primary transition-all uppercase tracking-widest flex items-center gap-2 self-start md:mb-1.5 shadow-lg active:scale-95"
            >
              <Filter className="w-3 h-3" />
              Sist. {displayCurrencyMode}
            </button>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <div className="w-12 h-12 bg-slate-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-gray-600 group-hover:bg-primary group-hover:text-white transition-all cursor-help">
            <PieChartIcon className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-auto z-10">
        {/* Chart 1 - Categories */}
        <div className="flex flex-col items-center">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={onPieClick}
                  cursor="pointer"
                >
                  {typeData.map((_entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] font-black text-slate-400 dark:text-gray-400 tracking-widest text-center leading-none mb-1">Categorii</span>
              <span className="text-[10px] font-black text-slate-900 dark:text-gray-100">{typeData.length} Tipuri</span>
            </div>
          </div>
          
          {/* Mobile-friendly details display */}
          {activeSliceIndex !== null && activeSliceIndex < typeData.length && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-100">
                    {typeData[activeSliceIndex]?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {((typeData[activeSliceIndex]?.value || 0) / filteredTotals.totalInBase * 100).toFixed(1)}% din total
                  </p>
                </div>
                <button 
                  onClick={onSliceIndexClose}
                  className="p-1 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-gray-100">
                {formatCurrency(typeData[activeSliceIndex]?.value || 0, 'RON')}
              </p>
            </div>
          )}
        </div>

        {/* Chart 2 - Currencies */}
        <div className="flex flex-col items-center">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={onPieClick}
                  cursor="pointer"
                >
                  {currencyData.map((_entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[(index + 3) % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[8px] font-black text-slate-400 dark:text-gray-400 tracking-widest text-center leading-none mb-1">Monede</span>
               <span className="text-[10px] font-black text-slate-900 dark:text-gray-100">{currencyData.length} Total</span>
            </div>
          </div>
          
          {/* Mobile-friendly details display for currency chart */}
          {activeSliceIndex !== null && activeSliceIndex >= typeData.length && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-gray-100">
                    {currencyData[activeSliceIndex - typeData.length]?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {((currencyData[activeSliceIndex - typeData.length]?.value || 0) / totals.totalInBase * 100).toFixed(1)}% din total
                  </p>
                </div>
                <button 
                  onClick={onSliceIndexClose}
                  className="p-1 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-gray-100">
                {formatCurrency(currencyData[activeSliceIndex - typeData.length]?.value || 0, 'RON')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.03, scale: 1 }}
        className="absolute -bottom-20 -right-20 pointer-events-none"
      >
        <PieChartIcon className="w-[30rem] h-[30rem] text-slate-900" />
      </motion.div>
    </motion.div>
  );
};
