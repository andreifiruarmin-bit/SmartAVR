import * as React from 'react';
import { Saving, SavingType, Currency } from '../../types';
import { formatCurrency } from '../../lib/utils';

export interface CardSettings {
  visible: boolean;
  currency: Currency | 'BASE';
}

export type CardId =
  | 'portfolio_summary'
  | 'cash_reserve'
  | 'bank_deposits'
  | 'gold_assets'
  | 'equities_assets'
  | 'portfolio_evolution'
  | 'deposits_evolution'
  | 'currency_stats';

export interface GoldData {
  totalGoldGrams: number;
  goldAcquisitionValueRON: number;
  goldCurrentValueRON: number;
  goldReturnPercent: number;
}

export interface DashboardProps {
  savings: Saving[];
  rates: Record<string, number>;
  totals: {
    totalInBase: number;
    byCurrency: Record<string, number>;
    byType: Record<string, number>;
    averageYield: number;
    averageDepositYield: number;
    totalDepositsBase: number;
  };
  onSliceClick: (filter: { type?: SavingType; currency?: Currency }) => void;
  loading?: boolean;
  onRatesUpdate?: (rates: Record<string, number>) => void;
  onNavigate?: (page: string) => void;
}

export const COLORS = ['#f43e01', '#10b981', '#f59e0b', '#6366f1', '#1e293b', '#94a3b8'];

export const CURRENCIES: (Currency | 'ALL')[] = ['ALL', 'RON', 'EUR', 'USD', 'GBP', 'CHF', 'XAU'];

export const CURRENCY_INFO: Record<string, { icon: string, name: string }> = {
  'RON': { icon: 'L', name: 'Leu Românesc' },
  'EUR': { icon: '€', name: 'Euro' },
  'USD': { icon: '$', name: 'Dolar American' },
  'GBP': { icon: '£', name: 'Liră Sterlină' },
  'CHF': { icon: '₣', name: 'Franc Elvețian' },
  'XAU': { icon: 'Au', name: 'Gram Aur' },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.3 }
  }
};

// CustomTooltip component moved to separate file to avoid JSX in .ts file
