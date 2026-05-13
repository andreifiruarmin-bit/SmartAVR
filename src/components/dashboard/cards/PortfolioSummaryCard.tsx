import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Saving, Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { PieChart as PieChartIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { itemVariants } from '../types';
import { PieChartWithLegend } from './PieChartWithLegend';

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
  isRatesStale: boolean;
  onOpenPieChartConfig?: () => void;
  onDisplayCurrencyModeChange?: (mode: 'RON' | 'EUR') => void;
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
  isRatesStale,
  onOpenPieChartConfig,
  onDisplayCurrencyModeChange
}) => {
  // Derive user's actual currencies
  const userCurrencies = [...new Set(savings.map(s => s.currency))];
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(userCurrencies[0] as Currency || 'RON');
  
  // Pie chart selector state
  const [activePie, setActivePie] = useState(0);
  const pieChartTypes = [
    'Tipuri Instrumente',
    'Impartire Monede',
    'Lichiditate',
    'Profil Risc'
  ];
  
  // Swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };
  
  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next chart
        setActivePie((prev) => (prev + 1) % pieChartTypes.length);
      } else {
        // Swipe right - previous chart
        setActivePie((prev) => (prev - 1 + pieChartTypes.length) % pieChartTypes.length);
      }
    }
  };
  
  const getPortfolioValue = () => {
    const totalRON = totals.totalInBase;
    if (displayCurrencyMode === 'EUR') {
      return totalRON / (rates.EUR || 1);
    }
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
        if ('maturityDate' in s && (s as any).maturityDate) {
          const maturity = new Date((s as any).maturityDate);
          const daysUntilMaturity = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntilMaturity <= 90;
        }
      }
      return false;
    }).reduce((sum, s) => sum + (s.amount * (rates[s.currency] || 1)), 0);
    
    const blocked = savings.filter(s => {
      if (s.type === 'Aur') return true;
      if (s.type === 'Depozit Bancar' || s.type === 'Titluri de Stat') {
        if ('maturityDate' in s && (s as any).maturityDate) {
          const maturity = new Date((s as any).maturityDate);
          const daysUntilMaturity = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntilMaturity > 90;
        }
        return true;
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
  
  const getCurrencyDataWithGold = () => {
    const currencyMap: Record<string, number> = {};
    
    savings.forEach(s => {
      const ronValue = s.amount * (rates[s.currency] || 1);
      currencyMap[s.currency] = (currencyMap[s.currency] || 0) + ronValue;
    });
    
    // Add gold as a separate currency
    const goldSavings = savings.filter(s => s.type === 'Aur');
    if (goldSavings.length > 0) {
      const goldValue = goldSavings.reduce((sum, s) => {
        const grams = (s as any).weightInGrams || 0;
        return sum + (grams * (rates.XAU || 1));
      }, 0);
      currencyMap['AUR'] = goldValue;
    }
    
    return Object.entries(currencyMap)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };
  
  const getPieChartData = (index: number) => {
    const rawData = (() => {
      switch (index) {
        case 0: return typeData; // By Type
        case 1: return getCurrencyDataWithGold(); // By Currency (with gold)
        case 2: return getLiquidityData(); // Liquidity
        case 3: return getRiskProfileData(); // Risk Profile
        default: return typeData;
      }
    })();

    // Convert values based on displayCurrencyMode
    if (displayCurrencyMode === 'EUR') {
      const eurRate = rates.EUR || 1;
      return rawData.map(item => ({
        ...item,
        value: item.value / eurRate
      }));
    }

    return rawData;
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
          <span>Cursurile valutare ar putea fi neactualizate. Ultima actualizare: {rates.lastUpdated ? new Date(rates.lastUpdated as string | number).toLocaleDateString('ro-RO') : 'Necunoscut'}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 z-10">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-slate-400 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Sold Total Portofoliu
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter break-all sm:break-normal">
              {formatCurrency(getPortfolioValue(), displayCurrency)}
            </h3>
          </div>
          
          {/* Currency Switcher */}
          {userCurrencies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {userCurrencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => {
                    setDisplayCurrency(currency as Currency);
                    if (currency === 'EUR' && onDisplayCurrencyModeChange) {
                      onDisplayCurrencyModeChange('EUR');
                    } else if (currency === 'RON' && onDisplayCurrencyModeChange) {
                      onDisplayCurrencyModeChange('RON');
                    }
                  }}
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
      
      {/* Single PIE Chart with Navigation */}
      <div className="flex flex-col items-center mt-auto z-10" 
           onTouchStart={handleTouchStart}
           onTouchEnd={handleTouchEnd}>
        <PieChartWithLegend
          data={getPieChartData(activePie)}
          title={pieChartTypes[activePie]}
          displayCurrency={displayCurrencyMode === 'EUR' ? 'EUR' : displayCurrency}
          totalValue={displayCurrencyMode === 'EUR' ? totals.totalInBase / (rates.EUR || 1) : totals.totalInBase}
          height={300}
          centerLabel={getPieChartData(activePie).length.toString()}
          centerDescription={activePie === 0 ? 'tipuri' : activePie === 1 ? 'monede' : activePie === 2 ? 'categorii' : 'profiluri'}
        />
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setActivePie((prev) => (prev - 1 + pieChartTypes.length) % pieChartTypes.length)}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Previous chart"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Dot Indicators */}
          <div className="flex gap-2">
            {pieChartTypes.map((_, index) => (
              <button
                key={index}
                onClick={() => setActivePie(index)}
                className={`h-2 rounded-full transition-all ${
                  activePie === index ? 'bg-primary w-8' : 'bg-slate-300 w-2'
                }`}
                aria-label={`Show ${pieChartTypes[index]}`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setActivePie((prev) => (prev + 1) % pieChartTypes.length)}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Next chart"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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
