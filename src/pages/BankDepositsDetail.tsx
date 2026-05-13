import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, AlertTriangle, Calendar, TrendingUp, Building2, Edit, Trash2 } from 'lucide-react';
import { Saving, SavingType, Currency } from '../types';
import { formatCurrency, convertToRON } from '../lib/utils';
import { differenceInDays, addMonths } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChartWithLegend } from '../components/dashboard/cards/PieChartWithLegend';

interface BankDepositsDetailProps {
  savings: Saving[];
  rates: Record<string, number>;
  displayCurrency: Currency;
  onBack: () => void;
  onEdit: (saving: Saving) => void;
  onDelete: (id: string) => void;
}

export const BankDepositsDetail: React.FC<BankDepositsDetailProps> = ({
  savings,
  rates,
  displayCurrency,
  onBack,
  onEdit,
  onDelete
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const deposits = useMemo(() => 
    savings.filter(s => s.type === SavingType.DEPOSIT), 
    [savings]
  );

  const summary = useMemo(() => {
    const totalRON = deposits.reduce((sum, d) => 
      sum + (d.amount * (rates[d.currency] || 1)), 0
    );
    
    const weightedYieldSum = deposits.reduce((sum, d) => {
      const ronValue = d.amount * (rates[d.currency] || 1);
      const yieldRate = (d as any).interestRate || 0;
      return sum + (ronValue * (yieldRate / 100));
    }, 0);
    
    const averageYield = totalRON > 0 ? (weightedYieldSum / totalRON) * 100 : 0;
    const projectedAnnual = totalRON * (averageYield / 100);
    
    return {
      totalRON,
      averageYield,
      projectedAnnual
    };
  }, [deposits, rates]);

  // Currency breakdown
  const currencyData = useMemo(() => {
    const currencyMap: Record<string, number> = {};
    deposits.forEach(deposit => {
      const ronValue = deposit.amount * (rates[deposit.currency] || 1);
      currencyMap[deposit.currency] = (currencyMap[deposit.currency] || 0) + ronValue;
    });
    
    return Object.entries(currencyMap)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [deposits, rates]);

  // Bank breakdown (case-insensitive)
  const bankData = useMemo(() => {
    const bankMap: Record<string, number> = {};
    deposits.forEach(deposit => {
      const bankName = ((deposit as any).bank || 'Altă bancă').toLowerCase().trim();
      const ronValue = deposit.amount * (rates[deposit.currency] || 1);
      // Capitalize first letter for display
      const displayName = bankName.charAt(0).toUpperCase() + bankName.slice(1);
      bankMap[displayName] = (bankMap[displayName] || 0) + ronValue;
    });
    
    return Object.entries(bankMap)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [deposits, rates]);

  const maturingSoon = useMemo(() => {
    const now = new Date();
    return deposits.filter(d => {
      if (!(d as any).maturityDate || (d as any).capitalized) return false;
      const maturityDate = new Date((d as any).maturityDate);
      const daysUntil = differenceInDays(maturityDate, now);
      return daysUntil <= 60 && daysUntil > 0;
    });
  }, [deposits]);

  const projectionData = useMemo(() => {
    const data = [];
    const now = new Date();
    let runningTotal = summary.totalRON;
    
    for (let i = 0; i <= 24; i++) {
      const currentDate = addMonths(now, i);
      const monthLabel = currentDate.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' });
      
      // Add matured deposits with interest
      deposits.forEach(deposit => {
        if ((deposit as any).maturityDate && !(deposit as any).capitalized) {
          const maturityDate = new Date((deposit as any).maturityDate);
          if (maturityDate <= currentDate && maturityDate > addMonths(currentDate, -1)) {
            const ronValue = deposit.amount * (rates[deposit.currency] || 1);
            const interestRate = (deposit as any).interestRate || 0;
            const daysHeld = differenceInDays(maturityDate, new Date(deposit.createdAt));
            const interest = ronValue * (interestRate / 100) * (daysHeld / 365);
            runningTotal += ronValue + interest;
          }
        }
      });
      
      data.push({
        month: monthLabel,
        value: Math.round(runningTotal)
      });
    }
    
    return data;
  }, [deposits, rates, summary.totalRON]);

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
                  Depozite Bancare
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {deposits.length} depozit{deposits.length !== 1 ? 'e' : ''} activ{deposits.length !== 1 ? 'e' : ''}
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
              totalValue={displayCurrency === 'EUR' ? summary.totalRON / (rates.EUR || 1) : summary.totalRON}
              height={300}
              centerLabel={currencyData.length.toString()}
              centerDescription="monede"
            />
          </div>
        )}

        {/* Bank Breakdown PIE Chart */}
        {bankData.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
              Impartire pe Bănci
            </h2>
            <PieChartWithLegend
              data={bankData.map(item => ({
                ...item,
                value: displayCurrency === 'EUR' ? item.value / (rates.EUR || 1) : item.value
              }))}
              displayCurrency={displayCurrency}
              totalValue={displayCurrency === 'EUR' ? summary.totalRON / (rates.EUR || 1) : summary.totalRON}
              height={300}
              centerLabel={bankData.length.toString()}
              centerDescription="bănci"
            />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Depus</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {formatCurrency(summary.totalRON, displayCurrency)}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dobândă Medie</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-primary">
              {summary.averageYield.toFixed(2)}%
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proiectat Anual</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-green-600">
              {formatCurrency(summary.projectedAnnual, displayCurrency)}
            </p>
          </div>
        </div>

        {/* Maturing Soon Warning */}
        {maturingSoon.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-black text-amber-900 uppercase tracking-wider mb-3">
                  Depozite care se lichidează curând
                </h3>
                <div className="space-y-2">
                  {maturingSoon.map(deposit => {
                    const daysUntil = differenceInDays(
                      new Date((deposit as any).maturityDate),
                      new Date()
                    );
                    return (
                      <div key={deposit.id} className="flex items-center justify-between bg-white rounded-2xl p-3">
                        <div>
                          <p className="font-semibold text-slate-900">{deposit.name}</p>
                          <p className="text-sm text-slate-500">{(deposit as any).bank}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">{daysUntil} zile</p>
                          <p className="text-xs text-slate-500">până la scadență</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Deposits List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
            Toate Depozitele
          </h2>
          <div className="space-y-4">
            {deposits.map(deposit => {
              const ronValue = deposit.amount * (rates[deposit.currency] || 1);
              const maturityDate = (deposit as any).maturityDate 
                ? new Date((deposit as any).maturityDate)
                : null;
              const daysRemaining = maturityDate 
                ? differenceInDays(maturityDate, new Date())
                : null;
              
              return (
                <div key={deposit.id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">{(deposit as any).bank || 'Banca'}</h3>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                          {((deposit as any).interestRate || 0).toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium mb-1">{deposit.name}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {maturityDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{maturityDate.toLocaleDateString('ro-RO')}</span>
                            {daysRemaining !== null && (
                              <span className="text-xs font-medium">
                                ({daysRemaining > 0 ? `${daysRemaining} zile` : 'Expirat'})
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            (deposit as any).capitalized
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {(deposit as any).capitalized ? 'Capitalizat' : 'Necapitalizat'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">
                        {formatCurrency(deposit.amount, deposit.currency)}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        ≈ {formatCurrency(ronValue, displayCurrency)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onEdit(deposit)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
                          title="Editează"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: deposit.id, name: deposit.name })}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 24-Month Projection Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
            Proiecție 24 Luni
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value, displayCurrency), 'Valoare']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f43e01" 
                  fill="#f43e01" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
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
