import { useState } from 'react';
import { Currency } from '../../../types';
import { CardId, CardSettings } from '../types';

const DEFAULT_CARD_SETTINGS: Record<CardId, CardSettings> = {
  'portfolio_summary': { visible: true, currency: 'BASE' },
  'cash_reserve': { visible: true, currency: 'BASE' },
  'bank_deposits': { visible: true, currency: 'BASE' },
  'gold_assets': { visible: true, currency: 'BASE' },
  'equities_assets': { visible: true, currency: 'BASE' },
  'portfolio_evolution': { visible: true, currency: 'BASE' },
  'deposits_evolution': { visible: true, currency: 'BASE' },
  'currency_stats': { visible: true, currency: 'BASE' },
};

export const useDashboardConfig = () => {
  const [cardSettings, setCardSettings] = useState<Record<string, CardSettings>>(() => {
    const saved = localStorage.getItem('dashboard_config');
    if (saved) return { ...DEFAULT_CARD_SETTINGS, ...JSON.parse(saved) };
    return DEFAULT_CARD_SETTINGS;
  });
  const [showConfig, setShowConfig] = useState(false);
  const [confirmHideId, setConfirmHideId] = useState<string | null>(null);

  const updateCardSettings = (id: string, updates: Partial<CardSettings>) => {
    setCardSettings(prev => {
      const next = { ...prev, [id]: { ...prev[id], ...updates } };
      localStorage.setItem('dashboard_config', JSON.stringify(next));
      return next;
    });
  };

  return { cardSettings, updateCardSettings, showConfig, setShowConfig, confirmHideId, setConfirmHideId };
};
