import { BankDeposit, Saving, SavingType } from '../types';

/**
 * Returns the number of whole months between startDate and maturityDate.
 * Falls back to 0 if dates are missing or invalid.
 */
export function getDepositPeriodMonths(deposit: BankDeposit): number {
  if (!deposit.startDate || !deposit.maturityDate) return 0;
  const start = new Date(deposit.startDate);
  const end = new Date(deposit.maturityDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

/**
 * Calculates net interest earned on a deposit after Romanian 10% withholding tax.
 * Formula: amount × (annualRate / 100) × (months / 12) × 0.90
 */
export function calculateNetInterest(deposit: BankDeposit): number {
  const months = getDepositPeriodMonths(deposit);
  if (months === 0 || !deposit.interestRate) return 0;
  const gross = deposit.amount * (deposit.interestRate / 100) * (months / 12);
  return Math.round(gross * 0.90 * 100) / 100;
}

/**
 * Returns the number of days until the deposit matures.
 * Negative value means it has already matured.
 */
export function getDaysUntilMaturity(deposit: BankDeposit): number {
  if (!deposit.maturityDate) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maturity = new Date(deposit.maturityDate);
  maturity.setHours(0, 0, 0, 0);
  return Math.round((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * A deposit is considered "matured" when today >= maturityDate
 * AND it is not set to auto-renew AND it is not capitalized.
 * These are the deposits that need a user notification.
 */
export function isActionableMaturity(deposit: BankDeposit): boolean {
  return (
    getDaysUntilMaturity(deposit) <= 0 &&
    !deposit.autoRenewal &&
    !deposit.isCapitalized
  );
}

/**
 * A deposit is "expiring soon" when it matures within the next 7 days
 * and is not set to auto-renew.
 */
export function isExpiringSoon(deposit: BankDeposit): boolean {
  const days = getDaysUntilMaturity(deposit);
  return days > 0 && days <= 7 && !deposit.autoRenewal;
}

/**
 * Filters all savings and returns only BankDeposit items.
 */
export function getBankDeposits(savings: Saving[]): BankDeposit[] {
  return savings.filter((s): s is BankDeposit => s.type === SavingType.DEPOSIT);
}
