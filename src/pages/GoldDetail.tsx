import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, TrendingUp, Info } from 'lucide-react';
import { Saving, SavingType } from '../types';
import { formatCurrency, convertToRON } from '../lib/utils';

interface GoldDetailProps {
  savings: Saving[];
  rates: Record<string, number>;
  onBack: () => void;
}

export const GoldDetail: React.FC<GoldDetailProps> = ({ 
  savings, 
  rates, 
  onBack 
}) => {
  const goldAssets = useMemo(() => 
    savings.filter(s => s.type === SavingType.GOLD), 
    [savings]
  );

  const summary = useMemo(() => {
    const totalGrams = goldAssets.reduce((sum, gold) => 
      sum + ((gold as any).weightInGrams || 0), 0
    );
    
    const totalRON = goldAssets.reduce((sum, gold) => {
      const grams = (gold as any).weightInGrams || 0;
      const pricePerGram = rates.XAU || 1;
      return sum + (grams * pricePerGram);
    }, 0);
    
    return {
      totalGrams,
      totalRON,
      pricePerGram: rates.XAU || 0
    };
  }, [goldAssets, rates]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Înapoi</span>
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Aur
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {goldAssets.length} active{goldAssets.length !== 1 ? ' de aur' : ' de aur'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Gramaje</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {summary.totalGrams.toFixed(2)} g
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valoare Totală</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-primary">
              {formatCurrency(summary.totalRON, 'RON')}
            </p>
          </div>
        </div>

        {/* Price Information */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-black text-amber-900 uppercase tracking-wider mb-2">
                Informații Preț
              </h3>
              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preț curent per gram
                </p>
                <p className="text-xl font-black text-slate-900">
                  {formatCurrency(summary.pricePerGram, 'RON')}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Sursa: API-ul de prețuri al metalelor prețioase
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Gold Assets */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
            Toate Activele de Aur
          </h2>
          <div className="space-y-4">
            {goldAssets.map(gold => {
              const grams = (gold as any).weightInGrams || 0;
              const valueRON = grams * summary.pricePerGram;
              
              return (
                <div key={gold.id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">{gold.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Gramaje: {grams.toFixed(2)} g</span>
                        <span>Adăugat: {new Date(gold.createdAt).toLocaleDateString('ro-RO')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">
                        {formatCurrency(valueRON, 'RON')}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {grams.toFixed(2)} g × {formatCurrency(summary.pricePerGram, 'RON')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
