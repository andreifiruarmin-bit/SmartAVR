import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Saving, Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Filter, PieChart as PieChartIcon, X, AlertTriangle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  onOpenPieChartConfig?: () => void;
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
  isRatesStale,
  onOpenPieChartConfig
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Derive user's actual currencies
  const userCurrencies = [...new Set(savings.map(s => s.currency))];
  const [displayCurrency, setDisplayCurrency] = useState(userCurrencies[0] || 'RON');
  
  // Pie chart selector state
  const [activePie, setActivePie] = useState(0);
  const pieChartTypes = ['By Type', 'By Currency', 'Liquidity', 'Risk Profile', 'Time Horizon'];
  
  const getPortfolioValue = () => {
    if (selectedCurrency === 'ALL') {
      const totalRON = filteredTotals.totalInBase;
      if (displayCurrency === 'RON') return totalRON;
      return totalRON / (rates[displayCurrency] || 1);
    }
    const selectedSavings = savings.filter(s => s.currency === selectedCurrency);
    const totalRON = selectedSavings.reduce((sum, s) => {
      const ronValue = s.amount * (rates[s.currency] || 1);
      return sum + ronValue;
    }, 0);
    if (displayCurrency === 'RON') return totalRON;
    return totalRON / (rates[displayCurrency] || 1);
  };
  
  // Data processing functions for different pie chart types
  const getLiquidityData = () => {
    const liquid = savings.filter(s => 
      s.type === 'Rezervă Cash' || s.type === 'Acțiuni' || s.type === 'ETF'
    ).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    const semiLiquid = savings.filter(s => {
      if (s.type === 'Depozit Bancar' || s.type === 'Titluri de Stat') {
        if ('maturityDate' in s && s.maturityDate) {
          const maturity = new Date(s.maturityDate);
          const daysUntilMaturity = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntilMaturity <= 90;
        }
      }
      return false;
    }).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    const blocked = savings.filter(s => {
      if (s.type === 'Aur') return true;
      if (s.type === 'Depozit Bancar' || s.type === 'Titluri de Stat') {
        if ('maturityDate' in s && s.maturityDate) {
          const maturity = new Date(s.maturityDate);
          const daysUntilMaturity = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntilMaturity > 90;
        }
        return true; // No maturity date means blocked
      }
      return false;
    }).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    return [
      { name: 'Lichid', value: liquid },
      { name: 'Semi-lichid', value: semiLiquid },
      { name: 'Blocat', value: blocked }
    ].filter(item => item.value > 0);
  };
  
  const getRiskProfileData = () => {
    const lowRisk = savings.filter(s => 
      s.type === 'Depozit Bancar' || s.type === 'Rezervă Cash' || s.type === 'Titluri de Stat'
    ).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    const mediumRisk = savings.filter(s => 
      s.type === 'ETF' || s.type === 'Aur'
    ).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    const highRisk = savings.filter(s => 
      s.type === 'Acțiuni'
    ).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    return [
      { name: 'Risc Scăzut', value: lowRisk },
      { name: 'Risc Mediu', value: mediumRisk },
      { name: 'Risc Ridicat', value: highRisk }
    ].filter(item => item.value > 0);
  };
  
  const getTimeHorizonData = () => {
    const under1Year = savings.filter(s => {
      if (s.type === 'Rezervă Cash') return true;
      if ('maturityDate' in s && s.maturityDate) {
        const maturity = new Date(s.maturityDate);
        const monthsUntilMaturity = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        return monthsUntilMaturity <= 12;
      }
      return false;
    }).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    const oneToThreeYears = savings.filter(s => {
      if ('maturityDate' in s && s.maturityDate) {
        const maturity = new Date(s.maturityDate);
        const monthsUntilMaturity = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        return monthsUntilMaturity > 12 && monthsUntilMaturity <= 36;
      }
      return false;
    }).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    const over3Years = savings.filter(s => {
      if ('maturityDate' in s && s.maturityDate) {
        const maturity = new Date(s.maturityDate);
        const monthsUntilMaturity = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        return monthsUntilMaturity > 36;
      }
      return false;
    }).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    return [
      { name: 'Sub 1 an', value: under1Year },
      { name: '1–3 ani', value: oneToThreeYears },
      { name: 'Peste 3 ani', value: over3Years }
    ].filter(item => item.value > 0);
  };
  
  const getPieChartData = (index: number) => {
    switch (index) {
      case 0: return typeData; // By Type
      case 1: return currencyData; // By Currency
      case 2: return getLiquidityData(); // Liquidity
      case 3: return getRiskProfileData(); // Risk Profile
      case 4: return getTimeHorizonData(); // Time Horizon
      default: return typeData;
    }
  };
  
  const getPieChartLabel = (index: number) => {
    return pieChartTypes[index];
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col bg-white px-4 py-3 md:px-6 md:py-4 lg:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative group transition-all duration-500"
    >
      {/* Stale Rates Banner */}
      {isRatesStale && (
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
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
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter break-all sm:break-normal">
              {formatCurrency(getPortfolioValue(), displayCurrency as Currency)}
            </h3>
          </div>
          
          {/* Currency Switcher */}
          {userCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {userCurrencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => setDisplayCurrency(currency)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                    displayCurrency === currency
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={onOpenPieChartConfig}
            className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 hover:bg-primary hover:text-white transition-all cursor-pointer group"
            title="Configurează grafice pie"
          >
            <PieChartIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-auto z-10">
        {/* Chart 1 - Dynamic */}
        <div className="flex flex-col items-center" ref={containerRef}>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPieChartData(activePie)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={onPieClick}
                  cursor="pointer"
                >
                  {getPieChartData(activePie).map((_entry, index) => (
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
              <span className="text-[8px] font-black text-slate-400 tracking-widest text-center leading-none mb-1">
                {getPieChartLabel(activePie)}
              </span>
              <span className="text-[10px] font-black text-slate-900">
                {getPieChartData(activePie).length} Tipuri
              </span>
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setActivePie((prev) => (prev - 1 + 4) % 4)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Dot Indicators */}
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setActivePie(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activePie === index ? 'bg-primary w-6' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setActivePie((prev) => (prev + 1) % 4)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Mobile-friendly details display */}
          {activeSliceIndex !== null && activeSliceIndex < getPieChartData(activePie).length && (
            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {getPieChartData(activePie)[activeSliceIndex]?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {((getPieChartData(activePie)[activeSliceIndex]?.value || 0) / 
                      (activePie === 1 ? totals.totalInBase : filteredTotals.totalInBase) * 100).toFixed(1)}% din total
                  </p>
                </div>
                <button 
                  onClick={onSliceIndexClose}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-black text-slate-900">
                {formatCurrency(getPieChartData(activePie)[activeSliceIndex]?.value || 0, 'RON')}
              </p>
            </div>
          )}
        </div>

        {/* Chart 2 - Currencies (Fixed) */}
        <div className="flex flex-col items-center" ref={containerRef}>
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
              <span className="text-[8px] font-black text-slate-400 tracking-widest text-center leading-none mb-1">Monede</span>
              <span className="text-[10px] font-black text-slate-900">{currencyData.length} Total</span>
            </div>
          </div>
          
          {/* Mobile-friendly details display for currency chart */}
          {activeSliceIndex !== null && activeSliceIndex >= getPieChartData(activePie).length && (
            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {currencyData[activeSliceIndex - getPieChartData(activePie).length]?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {((currencyData[activeSliceIndex - getPieChartData(activePie).length]?.value || 0) / totals.totalInBase * 100).toFixed(1)}% din total
                  </p>
                </div>
                <button 
                  onClick={onSliceIndexClose}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-black text-slate-900">
                {formatCurrency(currencyData[activeSliceIndex - getPieChartData(activePie).length]?.value || 0, 'RON')}
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
