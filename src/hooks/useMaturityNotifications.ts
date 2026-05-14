import { useMemo } from 'react';
import { Saving, BankDeposit } from '../types';
import {
  getBankDeposits,
  isActionableMaturity,
  isExpiringSoon,
  calculateNetInterest,
  getDaysUntilMaturity,
} from '../lib/depositUtils';

export interface MaturityNotification {
  deposit: BankDeposit;
  type: 'matured' | 'expiring_soon';
  netInterest: number;
  daysUntilMaturity: number;
}

export function useMaturityNotifications(savings: Saving[]): MaturityNotification[] {
  return useMemo(() => {
    const deposits = getBankDeposits(savings);
    const notifications: MaturityNotification[] = [];

    for (const deposit of deposits) {
      if (isActionableMaturity(deposit)) {
        notifications.push({
          deposit,
          type: 'matured',
          netInterest: calculateNetInterest(deposit),
          daysUntilMaturity: getDaysUntilMaturity(deposit),
        });
      } else if (isExpiringSoon(deposit)) {
        notifications.push({
          deposit,
          type: 'expiring_soon',
          netInterest: calculateNetInterest(deposit),
          daysUntilMaturity: getDaysUntilMaturity(deposit),
        });
      }
    }

    // Show matured first, then expiring soon; within each group sort by maturityDate ascending
    return notifications.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'matured' ? -1 : 1;
      return a.daysUntilMaturity - b.daysUntilMaturity;
    });
  }, [savings]);
}
