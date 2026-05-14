import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Currency, UserPreferences } from '../types';

const DEFAULT_VISIBILITY = {
  summary: true, evolution: true, cash: true,
  deposits: true, equities: true, gold: true,
  rent: true, analysis: true
};

const DEFAULT_PREFS: UserPreferences = {
  cardVisibility: DEFAULT_VISIBILITY,
  displayCurrency: 'RON' as Currency
};

export function useUserProfile(userId: string | undefined) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Fallback la localStorage pentru primul render (fără flash)
    try {
      const vis = localStorage.getItem('dashboard_visibility');
      const cur = localStorage.getItem('smartavr_display_currency');
      return {
        cardVisibility: vis ? JSON.parse(vis) : DEFAULT_VISIBILITY,
        displayCurrency: (cur as Currency) || 'RON'
      };
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch preferințe din Supabase la login
  useEffect(() => {
    if (!userId) {
      // La logout, resetăm la default
      setPreferences(DEFAULT_PREFS);
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('default_currency')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPreferences(prev => ({
            ...prev,
            displayCurrency: (data.default_currency as Currency) || 'RON'
          }));
        }
      } catch (err) {
        console.warn('useUserProfile: could not load profile, using localStorage fallback', err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Actualizează cardVisibility — local + localStorage (preferințele de UI rămân local)
  const updateCardVisibility = useCallback((
    updater: React.SetStateAction<Record<string, boolean>>
  ) => {
    setPreferences(prev => {
      const newVis = typeof updater === 'function' 
        ? updater(prev.cardVisibility) 
        : updater;
      localStorage.setItem('dashboard_visibility', JSON.stringify(newVis));
      return { ...prev, cardVisibility: newVis };
    });
  }, []);

  // Actualizează displayCurrency — local + Supabase
  const updateDisplayCurrency = useCallback(async (currency: Currency) => {
    setPreferences(prev => ({ ...prev, displayCurrency: currency }));
    localStorage.setItem('smartavr_display_currency', currency);

    if (!userId) return;
    try {
      await supabase
        .from('user_profiles')
        .update({ default_currency: currency })
        .eq('id', userId);
    } catch (err) {
      console.warn('useUserProfile: could not save currency preference', err);
    }
  }, [userId]);

  return {
    preferences,
    profileLoading,
    updateCardVisibility,
    updateDisplayCurrency
  };
}
