import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string) {
  // Map our internal currency codes to standard ones if needed
  const displayCurrency = currency === 'XAU' ? 'XAU' : currency;

  try {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: displayCurrency === 'XAU' ? 'USD' : displayCurrency, // format XAU as USD for now if not supported
      maximumFractionDigits: 2,
    }).format(amount) + (displayCurrency === 'XAU' ? ' (Gold)' : '');
  } catch (e) {
    return `${amount} ${currency}`;
  }
}

export function convertToRON(amount: number, currency: string, rates: Record<string, number>) {
  const rate = rates[currency] || 1;
  return amount * rate;
}

export async function fetchLiveRates() {
  try {
    const response = await fetch('/.netlify/functions/exchange-rates');
    if (!response.ok) throw new Error('Failed to fetch from function');
    const data = await response.json();
    return data.rates as Record<string, number>;
  } catch (error) {
    console.warn('Netlify function failed, using client-side fallback:', error);
    const sources = [
      'https://open.er-api.com/v6/latest/RON',
      'https://api.frankfurter.app/latest?from=RON'
    ];

    for (const url of sources) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const data = await response.json();
        const rates: Record<string, number> = { RON: 1 };
        
        if (data.rates) {
          Object.entries(data.rates).forEach(([cur, val]) => {
            if (cur !== 'RON') {
              rates[cur] = 1 / (val as number);
            }
          });

          if (!rates['XAU']) {
            rates['XAU'] = 280;
          }

          return rates;
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${url}:`, err);
      }
    }
  }

  console.error('All exchange rate sources failed.');
  return null;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
