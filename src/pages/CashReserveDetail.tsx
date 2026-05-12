import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { Saving, SavingType } from '../types';
import { formatCurrency, convertToRON } from '../lib/utils';

interface CashReserveDetailProps {
  savings: Saving[];
  onBack: () => void;
}

export const CashReserveDetail: React.FC<CashReserveDetailProps> = ({ 
  savings, 
  onBack 
}) => {
  const cashReserves = useMemo(() => 
    savings.filter(s => s.type === SavingType.CASH_RESERVE), 
    [savings]
  );

  const totalsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    cashReserves.forEach(cash => {
      totals[cash.currency] = (totals[cash.currency] || 0) + cash.amount;
    });
    return totals;
  }, [cashReserves]);

  const totalRON = useMemo(() => {
    return cashReserves.reduce((sum, cash) => 
      sum + (cash.amount * (1)), // Assuming 1:1 for cash, adjust if needed
    0);
  }, [cashReserves]);

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
                  Rezervă Cash
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {cashReserves.length} rezerv{cashReserves.length !== 1 ? 'e' : ''} de lichidități
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Total per Currency */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
            Totaluri pe Monede
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(totalsByCurrency).map(([currency, amount]) => (
              <div key={currency} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      {currency}
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                      {formatCurrency(amount, currency as any)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Fund Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-black text-blue-900 uppercase tracking-wider mb-2">
                Recomandare Fond de Urgență
              </h3>
              <p className="text-blue-800 font-medium leading-relaxed">
                Specialiștii recomandă un fond de urgență echivalent cu 3–6 luni de cheltuieli lunare. 
                Acesta ar trebui să fie ușor accesibil și lichid, exact ca rezervele tale de cash.
              </p>
              <div className="mt-4 p-4 bg-white rounded-2xl">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Valoare curentă
                </p>
                <p className="text-xl font-black text-slate-900">
                  {formatCurrency(totalRON, 'RON')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Cash Entries */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
            Toate Rezervele de Cash
          </h2>
          <div className="space-y-4">
            {cashReserves.map(cash => (
              <div key={cash.id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{cash.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Adăugat: {new Date(cash.createdAt).toLocaleDateString('ro-RO')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">
                      {formatCurrency(cash.amount, cash.currency)}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {cash.currency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
