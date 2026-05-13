import { useMemo } from 'react';
import { Saving, SavingType, Currency } from '../../../types';
import { convertToRON } from '../../../lib/utils';
import { DashboardProps, GoldData, CardSettings } from '../types';

export const useDashboardData = (
  savings: Saving[],
  rates: Record<string, number>,
  totals: DashboardProps['totals'],
  selectedCurrency: Currency | 'ALL',
  displayCurrencyMode: 'RON' | 'EUR',
  cardSettings: Record<string, CardSettings>
) => {
  // Gold-specific calculations
  const goldData = useMemo((): GoldData => {
    const goldSavings = savings.filter(s => s.currency === 'XAU');
    const totalGoldGrams = goldSavings.reduce((sum, s) => sum + (s as any).details?.weightInGrams || 0, 0);
    const goldAcquisitionValueRON = goldSavings.reduce((sum, s) => sum + s.amount, 0);
    const goldCurrentValueRON = totalGoldGrams * (rates['XAU'] || 0);
    const goldReturnPercent = goldAcquisitionValueRON > 0 ? ((goldCurrentValueRON - goldAcquisitionValueRON) / goldAcquisitionValueRON) * 100 : 0;

    return {
      totalGoldGrams,
      goldAcquisitionValueRON,
      goldCurrentValueRON,
      goldReturnPercent
    };
  }, [savings, rates]);

  const activeCurrencies = useMemo(() => {
    const used = new Set<Currency>(['RON', 'EUR']); // Always allow RON/EUR for display
    savings.forEach(s => used.add(s.currency));
    return Array.from(used);
  }, [savings]);

  const availableCurrencies = useMemo(() => {
    const used = new Set<string>();
    savings.forEach(s => used.add(s.currency));
    const list: (Currency | 'ALL')[] = ['ALL'];
    ['RON', 'EUR', 'USD', 'GBP', 'CHF', 'XAU'].forEach(c => {
      if (c !== 'ALL' && used.has(c)) list.push(c as Currency);
    });
    return list;
  }, [savings]);

  const filteredSavings = useMemo(() => {
    if (selectedCurrency === 'ALL') return savings;
    return savings.filter(s => s.currency === selectedCurrency);
  }, [savings, selectedCurrency]);

  const filteredTotals = useMemo(() => {
    let totalInBase = 0;
    const byType: Record<string, number> = {};

    filteredSavings.forEach(s => {
      const ronValue = convertToRON(s.amount, s.currency, rates);
      totalInBase += ronValue;
      byType[s.type] = (byType[s.type] || 0) + ronValue;
    });

    return { totalInBase, byType };
  }, [filteredSavings, rates]);

  const typeData = useMemo(() => {
    return Object.entries(filteredTotals.byType).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredTotals.byType]);

  const currencyData = useMemo(() => {
    return Object.entries(totals.byCurrency).map(([name, value]) => ({
      name,
      value
    }));
  }, [totals.byCurrency]);

  const portfolioHistory = useMemo(() => {
    if (savings.length === 0) return [];

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find earliest point
    const timestamps = savings.map(s => {
      const dep = s as any;
      return dep.startDate ? new Date(dep.startDate).getTime() : (s.createdAt || Date.now());
    });
    const minTimestamp = Math.min(...timestamps);
    const earliestAssetDate = new Date(minTimestamp);
    earliestAssetDate.setDate(1);
    earliestAssetDate.setHours(0, 0, 0, 0);

    // Cap lookback at 12 months
    const twelveMonthsAgo = new Date(startOfCurrentMonth);
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const chartStartDate = earliestAssetDate < twelveMonthsAgo ? twelveMonthsAgo : earliestAssetDate;

    const data = [];
    let current = new Date(chartStartDate);
    
    // Avoid infinite loop if somehow current > startOfCurrentMonth initially
    if (current > startOfCurrentMonth) {
      current = new Date(startOfCurrentMonth);
    }

    while (current <= startOfCurrentMonth) {
      const timestamp = current.getTime();
      
      let totalPortfolioRON = 0;
      let totalDepositsValueRON = 0;

      savings.forEach(s => {
        // Effective start date for this calculation
        const dep = s as any;
        const assetStartDate = dep.startDate ? new Date(dep.startDate).getTime() : (s.createdAt || timestamp);

        if (assetStartDate <= timestamp) {
          const baseRON = convertToRON(s.amount, s.currency, rates);
          totalPortfolioRON += baseRON;

          if (s.type === SavingType.DEPOSIT || s.type === SavingType.BONDS) {
            const daysAccrued = Math.max(0, (timestamp - assetStartDate) / (1000 * 60 * 60 * 24));
            const yearlyRate = (dep.interestRate || 0) / 100;
            const accruedInterest = baseRON * yearlyRate * (daysAccrued / 365) * 0.9;
            
            if (s.type === SavingType.DEPOSIT) {
              totalDepositsValueRON += (baseRON + accruedInterest);
            }
            
            totalPortfolioRON += accruedInterest;
          }
        }
      });

      data.push({
        name: current.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }),
        total: totalPortfolioRON,
        deposits: totalDepositsValueRON,
        fullDate: current.toLocaleDateString('ro-RO')
      });

      // Advance to next month
      current = new Date(current);
      current.setMonth(current.getMonth() + 1);
    }
    return data;
  }, [savings, rates]);

  const hasDeposits = (totals.byType[SavingType.DEPOSIT] || 0) > 0;
  const hasCash = (totals.byType[SavingType.CASH_RESERVE] || 0) > 0;
  const hasGold = (totals.byType[SavingType.GOLD] || 0) > 0;
  const hasInvestments = (totals.byType[SavingType.STOCKS] || 0) > 0 || (totals.byType[SavingType.ETF] || 0) > 0;

  const getCardValue = (id: string, type?: SavingType) => {
    const settings = cardSettings[id];
    const currency = settings.currency === 'BASE' ? displayCurrencyMode : settings.currency;

    let ronValue = 0;
    if (type) {
      ronValue = totals.byType[type] || 0;
      if (type === SavingType.STOCKS || type === SavingType.ETF) {
        ronValue = (totals.byType[SavingType.STOCKS] || 0) + (totals.byType[SavingType.ETF] || 0);
      }
    } else if (id === 'portfolio_summary') {
      ronValue = filteredTotals.totalInBase;
    }

    // Convert based on currency setting
    if (displayCurrencyMode === 'EUR' && currency === 'EUR') {
      return ronValue / (rates.EUR || 1);
    }
    if (currency === 'RON') return ronValue;
    return ronValue / (rates[currency] || 1);
  };

  return {
    goldData,
    activeCurrencies,
    availableCurrencies,
    filteredSavings,
    filteredTotals,
    typeData,
    currencyData,
    portfolioHistory,
    hasDeposits,
    hasCash,
    hasGold,
    hasInvestments,
    getCardValue
  };
};
