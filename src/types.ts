export type Currency = 'RON' | 'EUR' | 'USD' | 'GBP' | 'CHF' | 'XAU';

export enum SavingType {
  DEPOSIT = 'Depozit Bancar',
  GOLD = 'Aur',
  STOCKS = 'Acțiuni',
  ETF = 'ETF',
  BONDS = 'Titluri de Stat',
  RENT = 'Chirii',
  CASH_RESERVE = 'Rezervă Cash'
}

// Pentru acțiuni
export interface StockDetails {
  symbol: string;
  numberOfShares: number;
  averageAcquisitionPrice: number; // Costul mediu per acțiune la achiziție
  currentPricePerShare?: number;   // Prețul curent per acțiune (actualizat din API)
  lastPriceUpdate?: string;        // ISO timestamp ultima actualizare preț
  market?: 'BVB' | 'NYSE' | 'NASDAQ' | 'OTHER';
}

// Pentru aur
export interface GoldDetails {
  weightGrams: number;             // Gramajul total (ex: 31.1 pentru 1 oz)
  acquisitionPricePerGram: number; // Prețul de achiziție per gram (RON)
  currentPricePerGram?: number;    // Prețul curent per gram (actualizat din API)
  lastPriceUpdate?: string;        // ISO timestamp ultima actualizare preț
}

export interface BaseSaving {
  id: string;
  type: SavingType;
  amount: number;
  currency: Currency;
  name: string;
  createdAt: number;
  startDate?: string;
  bank?: string;
  details?: Record<string, any>;
}

export interface BankDeposit extends BaseSaving {
  type: SavingType.DEPOSIT;
  interestRate: number;
  maturityDate: string;
  isCapitalized: boolean;
}

export interface CashReserve extends BaseSaving {
  type: SavingType.CASH_RESERVE;
}

export interface GoldSaving extends BaseSaving {
  type: SavingType.GOLD;
  weightInGrams: number;
}

export interface StockSaving extends BaseSaving {
  type: SavingType.STOCKS;
  symbol: string;
  shares: number;
}

export type Saving = BankDeposit | CashReserve | GoldSaving | StockSaving | BaseSaving;

export interface ExchangeRates {
  XAU?: number; // Prețul aurului per gram în RON
  lastUpdated?: string; // ISO timestamp
  [key: string]: number | string | undefined;
}
