import { Currency, ExchangeRates, SavingType } from './types';
import { Landmark, Coins, TrendingUp, Gem, Layers, FileText, Home, Wallet, PlusCircle } from 'lucide-react';

export const BASE_CURRENCY: Currency = 'RON';

export const CURRENCIES: Currency[] = ['RON', 'EUR', 'USD', 'GBP', 'CHF', 'XAU'];

export const DEFAULT_RATES: ExchangeRates = {
  RON: 1,
  EUR: 4.97,
  USD: 4.62,
  GBP: 5.85,
  CHF: 5.12,
  XAU: 280,
};

export const SAVING_OPTIONS = [
  { type: SavingType.DEPOSIT, icon: Landmark, label: 'Depozit' },
  { type: SavingType.CASH_RESERVE, icon: Wallet, label: 'Cash' },
  { type: SavingType.STOCKS, icon: TrendingUp, label: 'Acțiuni' },
  { type: SavingType.ETF, icon: Layers, label: 'ETF' },
  { type: SavingType.GOLD, icon: Gem, label: 'Aur' },
  { type: SavingType.BONDS, icon: FileText, label: 'Titluri Stat' },
  { type: SavingType.RENT, icon: Home, label: 'Chirii' },
  { type: SavingType.OTHER, icon: PlusCircle, label: 'Altele' },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RON: 'lei',
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'Fr',
  XAU: 'g',
};
