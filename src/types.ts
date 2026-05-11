export type Currency = 'RON' | 'EUR' | 'USD' | 'GBP' | 'CHF' | 'XAU';

export enum SavingType {
  DEPOSIT = 'Deposit Bancar',
  GOLD = 'Aur',
  STOCKS = 'Acțiuni',
  ETF = 'ETF',
  BONDS = 'Titluri de Stat',
  RENT = 'Chirii',
  CASH_RESERVE = 'Rezervă Cash',
  OTHER = 'Altele'
}

export interface BaseSaving {
  id: string;
  type: SavingType;
  amount: number;
  currency: Currency;
  name: string; // e.g., "Depozit BCR", "Acțiuni Apple"
  createdAt: number;
}

export interface BankDeposit extends BaseSaving {
  type: SavingType.DEPOSIT;
  interestRate: number; // yearly percentage
  startDate: string;
  maturityDate: string;
  isCapitalized: boolean; // if interest is added to the principal
  bankName?: string;
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
  [key: string]: number; // Price of 1 unit in base currency (RON)
}
