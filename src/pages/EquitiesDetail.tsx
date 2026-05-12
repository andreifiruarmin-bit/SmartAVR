import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { Saving, SavingType } from '../types';
import { formatCurrency, convertToRON } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface EquitiesDetailProps {
  savings: Saving[];
  rates: Record<string, number>;
  onBack: () => void;
}

export const EquitiesDetail: React.FC<EquitiesDetailProps> = ({ 
  savings, 
  rates, 
  onBack 
}) => {
  const equities = useMemo(() => 
    savings.filter(s => s.type === SavingType.STOCKS || s.type === SavingType.ETF), 
    [savings]
  );

  const summary = useMemo(() => {
    const stocks = equities.filter(s => s.type === SavingType.STOCKS);
    const etfs = equities.filter(s => s.type === SavingType.ETF);
    
    const stocksValue = stocks.reduce((sum, stock) => {
      const shares = (stock as any).shares || 0;
      const estimatedPrice = rates[stock.currency] || 1;
      return sum + (shares * estimatedPrice);
    }, 0);
    
    const etfValue = etfs.reduce((sum, etf) => {
      const shares = (etf as any).shares || 0;
      const estimatedPrice = rates[etf.currency] || 1;
      return sum + (shares * estimatedPrice);
    }, 0);
    
    return {
      totalValue: stocksValue + etfValue,
      stocksValue,
      etfValue,
      stocksCount: stocks.length,
      etfCount: etfs.length
    };
  }, [equities, rates]);

  const symbolData = useMemo(() => {
    const symbolMap: Record<string, { value: number; count: number }> = {};
    
    equities.forEach(equity => {
      const symbol = (equity as any).symbol || 'Unknown';
      const shares = (equity as any).shares || 0;
      const estimatedPrice = rates[equity.currency] || 1;
      const value = shares * estimatedPrice;
      
      if (!symbolMap[symbol]) {
        symbolMap[symbol] = { value: 0, count: 0 };
      }
      symbolMap[symbol].value += value;
      symbolMap[symbol].count += 1;
    });
    
    return Object.entries(symbolMap).map(([symbol, data]) => ({
      symbol,
      value: data.value,
      count: data.count
    }));
  }, [equities, rates]);

  const COLORS = ['#f43e01', '#10b981', '#f59e0b', '#6366f1', '#1e293b', '#94a3b8'];

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
                  Acțiuni & ETF
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {equities.length} active{equities.length !== 1 ? ' de investiții' : ' de investiție'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valoare Totală</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {formatCurrency(summary.totalValue, 'RON')}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acțiuni</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-primary">
              {formatCurrency(summary.stocksValue, 'RON')}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {summary.stocksCount} acțiun{summary.stocksCount !== 1 ? 'i' : 'e'}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ETF-uri</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-green-600">
              {formatCurrency(summary.etfValue, 'RON')}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {summary.etfCount} ETF{summary.etfCount !== 1 ? '-uri' : ''}
            </p>
          </div>
        </div>

        {/* Pie Chart by Symbol */}
        {symbolData.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                Alocare per Simbol
              </h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={symbolData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ symbol, percent }) => `${symbol} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {symbolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value, 'RON'), 'Valoare']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Per-Symbol List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
            Detalii per Simbol
          </h2>
          <div className="space-y-4">
            {symbolData.map((item, index) => (
              <div key={item.symbol} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <h3 className="font-bold text-slate-900">{item.symbol}</h3>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                        {item.count} poziț{item.count !== 1 ? 'ii' : 'ie'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">
                      {formatCurrency(item.value, 'RON')}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {((item.value / summary.totalValue) * 100).toFixed(1)}% din total
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Equities List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6">
            Toate Investițiile
          </h2>
          <div className="space-y-4">
            {equities.map(equity => {
              const shares = (equity as any).shares || 0;
              const symbol = (equity as any).symbol || 'Unknown';
              const estimatedPrice = rates[equity.currency] || 1;
              const estimatedValue = shares * estimatedPrice;
              
              return (
                <div key={equity.id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">{equity.name}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          equity.type === SavingType.STOCKS 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {equity.type === SavingType.STOCKS ? 'Acțiune' : 'ETF'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Simbol: {symbol}</span>
                        <span>Acțiuni: {shares}</span>
                        <span>Adăugat: {new Date(equity.createdAt).toLocaleDateString('ro-RO')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">
                        {formatCurrency(estimatedValue, 'RON')}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {shares} × {formatCurrency(estimatedPrice, 'RON')}
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
