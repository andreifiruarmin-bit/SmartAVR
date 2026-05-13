import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { SavingType, Currency } from '../../types';
import { DashboardProps } from './types';
import { useDashboardConfig } from './hooks/useDashboardConfig';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardHeader } from './DashboardHeader';
import { DashboardConfig } from './DashboardConfig';
import { PieChartConfig } from './PieChartConfig';
import { PortfolioSummaryCard } from './cards/PortfolioSummaryCard';
import { CashReserveCard } from './cards/CashReserveCard';
import { BankDepositsCard } from './cards/BankDepositsCard';
import { GoldAssetsCard } from './cards/GoldAssetsCard';
import { EquitiesCard } from './cards/EquitiesCard';
import { PortfolioEvolutionCard } from './cards/PortfolioEvolutionCard';
import { containerVariants } from './types';

export const Dashboard: React.FC<DashboardProps> = ({
  savings,
  totals,
  rates,
  onSliceClick,
  loading,
  onRatesUpdate,
  onNavigate,
  displayCurrency = 'RON',
  onDisplayCurrencyChange
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [displayCurrencyMode, setDisplayCurrencyMode] = useState<'RON' | 'EUR'>('RON');
  const [isRefreshingGold, setIsRefreshingGold] = useState(false);

  const handleDisplayCurrencyModeChange = (mode: 'RON' | 'EUR') => {
    setDisplayCurrencyMode(mode);
  };

  const { cardSettings, updateCardSettings, showConfig, setShowConfig, confirmHideId, setConfirmHideId } = useDashboardConfig();
  const [showPieChartConfig, setShowPieChartConfig] = useState(false);

  const data = useDashboardData(savings, rates, totals, selectedCurrency, displayCurrencyMode, cardSettings);

  const isRatesStale = rates.lastUpdated
    ? (Date.now() - new Date(String(rates.lastUpdated)).getTime()) / 36e5 > 24
    : false;

  const refreshGoldPrice = async () => {
    setIsRefreshingGold(true);
    try {
      const res = await fetch('/.netlify/functions/gold-price');
      const goldRates = await res.json();
      onRatesUpdate?.({ ...rates, XAU: goldRates.pricePerGram, lastUpdated: goldRates.timestamp });
    } finally {
      setIsRefreshingGold(false);
    }
  };
  

  if (loading) return <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-24 md:pb-8">
      <DashboardHeader onOpenConfig={() => setShowConfig(true)} savings={savings} />
      
      <DashboardConfig
        isOpen={showConfig}
        cardSettings={cardSettings}
        onUpdateCard={updateCardSettings}
        onClose={() => setShowConfig(false)}
        hasCash={data.hasCash}
        hasDeposits={data.hasDeposits}
        hasGold={data.hasGold}
        hasInvestments={data.hasInvestments}
      />

      <PieChartConfig
        isOpen={showPieChartConfig}
        onClose={() => setShowPieChartConfig(false)}
        cardSettings={cardSettings}
        onUpdateCard={updateCardSettings}
      />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="md:col-span-2">
          <PortfolioSummaryCard
            savings={savings}
            totals={totals}
            rates={rates}
            filteredTotals={data.filteredTotals}
            typeData={data.typeData}
            currencyData={data.currencyData}
            selectedCurrency={selectedCurrency}
            availableCurrencies={data.availableCurrencies}
            displayCurrencyMode={displayCurrencyMode}
            isRatesStale={isRatesStale}
            onOpenPieChartConfig={() => setShowPieChartConfig(true)}
            onDisplayCurrencyModeChange={handleDisplayCurrencyModeChange}
          />
        </div>

        {/* Instrument Cards - Conditional Rendering with Click Navigation */}
        {savings.some(s => s.type === 'Rezervă Cash') && (
          <div 
            className="relative group cursor-pointer"
            onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-dropdown-option]')) onNavigate?.('detail-cash'); }}
          >
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 
                 transition-opacity duration-200">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <CashReserveCard
              value={data.getCardValue('cash_reserve', SavingType.CASH_RESERVE)}
              displayCurrency={displayCurrencyMode}
              averageDepositYield={totals.averageDepositYield}
              isVisible={cardSettings['cash_reserve'].visible}
              onToggleVisibility={() => updateCardSettings('cash_reserve', { visible: !cardSettings['cash_reserve'].visible })}
            />
          </div>
        )}
        {savings.some(s => s.type === 'Depozit Bancar') && (
          <div 
            className="relative group cursor-pointer"
            onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-dropdown-option]')) onNavigate?.('detail-deposits'); }}
          >
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 
                 transition-opacity duration-200">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <BankDepositsCard
              value={data.getCardValue('bank_deposits', SavingType.DEPOSIT)}
              displayCurrency={displayCurrencyMode}
              averageDepositYield={totals.averageDepositYield}
              isVisible={cardSettings['bank_deposits'].visible}
              onToggleVisibility={() => updateCardSettings('bank_deposits', { visible: !cardSettings['bank_deposits'].visible })}
            />
          </div>
        )}
        {savings.some(s => s.type === 'Aur') && (
          <div 
            className="relative group cursor-pointer"
            onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-dropdown-option]')) onNavigate?.('detail-gold'); }}
          >
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 
                 transition-opacity duration-200">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <GoldAssetsCard
              value={data.getCardValue('gold_assets', SavingType.GOLD)}
              displayCurrency={displayCurrencyMode}
              goldData={data.goldData}
              rates={rates}
              isVisible={cardSettings['gold_assets'].visible}
              isRefreshing={isRefreshingGold}
              onToggleVisibility={() => updateCardSettings('gold_assets', { visible: !cardSettings['gold_assets'].visible })}
              onRefreshPrice={refreshGoldPrice}
            />
          </div>
        )}
        {(savings.some(s => s.type === 'Acțiuni') || savings.some(s => s.type === 'ETF')) && (
          <div 
            className="relative group cursor-pointer"
            onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-dropdown-option]')) onNavigate?.('detail-equities'); }}
          >
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 
                 transition-opacity duration-200">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <EquitiesCard
              value={data.getCardValue('equities_assets', SavingType.STOCKS)}
              displayCurrency={displayCurrencyMode}
              savings={savings}
              isVisible={cardSettings['equities_assets'].visible}
              onToggleVisibility={() => updateCardSettings('equities_assets', { visible: !cardSettings['equities_assets'].visible })}
            />
          </div>
        )}
      </div>

      {savings.length > 0 && cardSettings['portfolio_evolution'].visible && (
        <PortfolioEvolutionCard
          portfolioHistory={data.portfolioHistory}
          hasDeposits={data.hasDeposits}
          isVisible={cardSettings['portfolio_evolution'].visible}
          onToggleVisibility={() => updateCardSettings('portfolio_evolution', { visible: !cardSettings['portfolio_evolution'].visible })}
        />
      )}
    </motion.div>
  );
};
