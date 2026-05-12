import React from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Currency, Saving } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Coins, EyeOff, Eye, ChevronDown, RefreshCw } from 'lucide-react';
import { SavingType } from '../../../types';
import { GoldData, itemVariants } from '../types';

interface GoldAssetsCardProps {
  value: number;
  currency: Currency | 'BASE';
  activeCurrencies: Currency[];
  displayCurrencyMode: 'RON' | 'EUR';
  goldData: GoldData;
  rates: Record<string, number>;
  isVisible: boolean;
  isRefreshing: boolean;
  onToggleVisibility: () => void;
  onCurrencyChange: (c: Currency | 'BASE') => void;
  onRefreshPrice: () => void;
  totals: {
    byType: Record<string, number>;
  };
}

export const GoldAssetsCard: React.FC<GoldAssetsCardProps> = ({
  value,
  currency,
  activeCurrencies,
  displayCurrencyMode,
  goldData,
  rates,
  isVisible,
  isRefreshing,
  onToggleVisibility,
  onCurrencyChange,
  onRefreshPrice,
  totals
}) => {
  const goldValue = totals.byType[SavingType.GOLD] || 0;
  const currentPrice = rates['XAU'] || 0;

  if (!isVisible) {
    return (
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-[#facc15] p-6 rounded-[3rem] shadow-xl shadow-yellow-500/10 text-slate-900 flex items-center justify-between group transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Aur</p>
            <p className="text-xs text-slate-600">Ascuns</p>
          </div>
        </div>
        <button 
          onClick={onToggleVisibility}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
          aria-label={isVisible ? 'Ascunde card' : 'Afișează card'}
        >
          <Eye size={18} />
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        variants={itemVariants}
        className="bg-[#facc15] px-4 py-3 md:px-6 md:py-4 lg:p-8 rounded-[3rem] shadow-xl shadow-yellow-500/10 text-slate-900 flex flex-col justify-between relative group overflow-hidden transition-all duration-500"
      >
        <div className="flex justify-between items-start z-10">
          <div className="p-3 bg-white rounded-2xl backdrop-blur-sm group-hover:ring-4 group-hover:ring-white transition-all duration-500">
            <Coins className="w-6 h-6 text-slate-900" />
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <button 
                onClick={onRefreshPrice}
                disabled={isRefreshing}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reîmprospătează prețul aurului"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <select 
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as any)}
                  className="appearance-none bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-xs font-black uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="BASE">AUTO</option>
                  {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button 
                onClick={onToggleVisibility}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                aria-label="Ascunde card"
              >
                <EyeOff size={18} />
              </button>
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Aur</p>
          </div>
        </div>

        <div className="z-10">
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600 mb-1">🥇 Portofoliu Aur</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(goldData.goldCurrentValueRON, 'RON')}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {goldData.totalGoldGrams.toFixed(2)}g • {formatCurrency(currentPrice, 'RON')}/g
            </p>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black mt-2 ${
              goldData.goldReturnPercent >= 0 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <span>{goldData.goldReturnPercent >= 0 ? '↑' : '↓'}</span>
              {Math.abs(goldData.goldReturnPercent).toFixed(2)}%
            </div>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(goldValue, 'RON')}
            <span className="text-[10px] font-normal text-slate-600 ml-2">Valoare în RON</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mt-6 z-10">
         <div className="w-2 h-2 rounded-full bg-white" />
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Rezerva de valoare</p>
        </div>
      </motion.div>

      {/* Gold Volatility Chart */}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={[
            { date: '3 luni in urma', priceRON: currentPrice * 0.97 },
            { date: '2 luni in urma', priceRON: currentPrice * 0.98 },
            { date: '1 luna in urma', priceRON: currentPrice * 0.99 },
            { date: 'Acum', priceRON: currentPrice }
          ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <Line 
              type="monotone" 
              dataKey="priceRON" 
              stroke={goldData.goldReturnPercent > 0 ? '#10b981' : '#ef4444'} 
              strokeWidth={2} 
              dot={false}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">{payload[0].payload.date}</p>
                      <p className="text-sm font-black tracking-tight">{formatCurrency(Number(payload[0].value), 'RON')}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};
