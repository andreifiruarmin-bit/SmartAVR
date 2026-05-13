import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Wallet, Calendar, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Saving, SavingType, Currency } from '../types';
import { formatCurrency } from '../lib/utils';
import { PieChartWithLegend } from '../components/dashboard/cards/PieChartWithLegend';

interface CashReserveDetailProps {
  savings: Saving[];
  rates: Record<string, number>;
  displayCurrency: Currency;
  onBack: () => void;
  onEdit: (saving: Saving) => void;
  onDelete: (id: string) => void;
}

export const CashReserveDetail: React.FC<CashReserveDetailProps> = ({
  savings,
  rates,
  displayCurrency,
  onBack,
  onEdit,
  onDelete
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const cashReserves = useMemo(() => 
    savings.filter(s => s.type === SavingType.CASH_RESERVE), 
    [savings]
  );

  const totalsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    cashReserves.forEach(cash => {
      const ronValue = cash.amount * (rates[cash.currency] || 1);
      totals[cash.currency] = (totals[cash.currency] || 0) + ronValue;
    });
    return totals;
  }, [cashReserves, rates]);

  const currencyData = useMemo(() => {
    return Object.entries(totalsByCurrency)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [totalsByCurrency]);

  const totalRON = useMemo(() => {
    return cashReserves.reduce((sum, cash) => 
      sum + (cash.amount * (rates[cash.currency] || 1)), 
    0);
  }, [cashReserves, rates]);

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
        {/* Currency Breakdown PIE Chart */}
        {currencyData.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
              Impartire pe Monede
            </h2>
            <PieChartWithLegend
              data={currencyData.map(item => ({
                ...item,
                value: displayCurrency === 'EUR' ? item.value / (rates.EUR || 1) : item.value
              }))}
              displayCurrency={displayCurrency}
              totalValue={displayCurrency === 'EUR' ? totalRON / (rates.EUR || 1) : totalRON}
              height={300}
              centerLabel={currencyData.length.toString()}
              centerDescription="monede"
            />
          </div>
        )}

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
                      {formatCurrency(amount, displayCurrency)}
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
                  {formatCurrency(totalRON, displayCurrency)}
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
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onEdit(cash)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
                        title="Editează"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: cash.id, name: cash.name })}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
                        title="Șterge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">
              Confirmare Ștergere
            </h3>
            <p className="text-slate-700 font-medium mb-6">
              Sunteți sigur că ștergeți "{deleteConfirm.name}"? Această acțiune este ireversibilă.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
