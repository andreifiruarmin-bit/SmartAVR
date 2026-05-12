import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SavingType, Currency } from '../../types';
import { DashboardProps } from './types';
import { useDashboardConfig } from './hooks/useDashboardConfig';
import { useDashboardData } from './hooks/useDashboardData';
import { usePieInteraction } from './hooks/usePieInteraction';
import { DashboardHeader } from './DashboardHeader';
import { DashboardConfig } from './DashboardConfig';
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
  onRatesUpdate 
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [displayCurrencyMode, setDisplayCurrencyMode] = useState<'RON' | 'EUR'>('RON');
  const [isRefreshingGold, setIsRefreshingGold] = useState(false);

  const { cardSettings, updateCardSettings, showConfig, setShowConfig, confirmHideId, setConfirmHideId } = useDashboardConfig();

  const data = useDashboardData(savings, rates, totals, selectedCurrency, displayCurrencyMode, cardSettings);

  const { activeSliceIndex, setActiveSliceIndex, handlePieClick } = usePieInteraction(onSliceClick, data.typeData);

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

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
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
            activeSliceIndex={activeSliceIndex}
            onPieClick={handlePieClick}
            onSliceIndexClose={() => setActiveSliceIndex(null)}
            onCurrencyChange={setSelectedCurrency}
            onDisplayModeToggle={() => setDisplayCurrencyMode(prev => prev === 'RON' ? 'EUR' : 'RON')}
            isRatesStale={isRatesStale}
          />
        </div>

        {(data.hasCash || data.hasDeposits || data.hasGold || data.hasInvestments) && (
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            {data.hasCash && (
              <CashReserveCard
                value={data.getCardValue('cash_reserve', SavingType.CASH_RESERVE)}
                currency={cardSettings['cash_reserve'].currency}
                activeCurrencies={data.activeCurrencies}
                displayCurrencyMode={displayCurrencyMode}
                isVisible={cardSettings['cash_reserve'].visible}
                onToggleVisibility={() => updateCardSettings('cash_reserve', { visible: !cardSettings['cash_reserve'].visible })}
                onCurrencyChange={(c) => updateCardSettings('cash_reserve', { currency: c })}
                totals={totals}
              />
            )}
            {data.hasDeposits && (
              <BankDepositsCard
                value={data.getCardValue('bank_deposits', SavingType.DEPOSIT)}
                currency={cardSettings['bank_deposits'].currency}
                activeCurrencies={data.activeCurrencies}
                displayCurrencyMode={displayCurrencyMode}
                averageDepositYield={totals.averageDepositYield}
                isVisible={cardSettings['bank_deposits'].visible}
                onToggleVisibility={() => updateCardSettings('bank_deposits', { visible: !cardSettings['bank_deposits'].visible })}
                onCurrencyChange={(c) => updateCardSettings('bank_deposits', { currency: c })}
                totals={totals}
              />
            )}
            {data.hasGold && (
              <GoldAssetsCard
                value={data.getCardValue('gold_assets', SavingType.GOLD)}
                currency={cardSettings['gold_assets'].currency}
                activeCurrencies={data.activeCurrencies}
                displayCurrencyMode={displayCurrencyMode}
                goldData={data.goldData}
                rates={rates}
                isVisible={cardSettings['gold_assets'].visible}
                isRefreshing={isRefreshingGold}
                onToggleVisibility={() => updateCardSettings('gold_assets', { visible: !cardSettings['gold_assets'].visible })}
                onCurrencyChange={(c) => updateCardSettings('gold_assets', { currency: c })}
                onRefreshPrice={refreshGoldPrice}
                totals={totals}
              />
            )}
            {data.hasInvestments && (
              <EquitiesCard
                value={data.getCardValue('equities_assets', SavingType.STOCKS)}
                currency={cardSettings['equities_assets'].currency}
                activeCurrencies={data.activeCurrencies}
                displayCurrencyMode={displayCurrencyMode}
                savings={savings}
                rates={rates}
                isVisible={cardSettings['equities_assets'].visible}
                onToggleVisibility={() => updateCardSettings('equities_assets', { visible: !cardSettings['equities_assets'].visible })}
                onCurrencyChange={(c) => updateCardSettings('equities_assets', { currency: c })}
                totals={totals}
              />
            )}
          </div>
        )}
      </div>

      {cardSettings['portfolio_evolution'].visible && (
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
