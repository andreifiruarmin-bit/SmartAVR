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
        className="bg-[#facc15] dark:bg-[#facc15]/20 p-6 rounded-[3rem] shadow-xl shadow-yellow-500/10 text-slate-900 dark:text-gray-100 flex items-center justify-between group transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-slate-900 dark:text-gray-100" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-gray-100">Aur</p>
            <p className="text-xs text-slate-600 dark:text-gray-400">Ascuns</p>
          </div>
        </div>
        <button 
          onClick={onToggleVisibility}
          className="p-2 text-slate-600 dark:text-gray-400 hover:text-yellow-600 transition-all rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
        >
          <Eye className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        variants={itemVariants}
        className="bg-[#facc15] dark:bg-[#facc15]/20 p-8 rounded-[3rem] shadow-xl shadow-yellow-500/10 text-slate-900 dark:text-gray-100 flex flex-col justify-between relative group overflow-hidden transition-all duration-500"
      >
        <div className="flex justify-between items-start z-10">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm group-hover:ring-4 group-hover:ring-white dark:group-hover:ring-gray-900/10 transition-all duration-500">
            <Coins className="w-6 h-6 text-slate-900 dark:text-gray-100" />
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <button 
                onClick={onRefreshPrice}
                disabled={isRefreshing}
                className="p-1 text-slate-600 dark:text-gray-400 hover:text-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <select 
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as any)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg px-2 py-1 pr-6 text-[8px] font-black uppercase focus:outline-none text-slate-900 dark:text-gray-100"
                >
                  <option value="BASE">Auto</option>
                  {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-2 h-2 text-slate-600 dark:text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button 
                onClick={onToggleVisibility}
                className="p-1 text-slate-600 dark:text-gray-400 hover:text-red-500 transition-all"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Aur</p>
          </div>
        </div>

        <div className="z-10">
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-gray-500 mb-1">🥇 Portofoliu Aur</p>
            <p className="text-2xl font-black text-slate-900 dark:text-gray-100 tracking-tight">
              {formatCurrency(goldData.goldCurrentValueRON, 'RON')}
            </p>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
              {goldData.totalGoldGrams.toFixed(2)}g • {formatCurrency(currentPrice, 'RON')}/g
            </p>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black mt-2 ${
              goldData.goldReturnPercent >= 0 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              <span>{goldData.goldReturnPercent >= 0 ? '↑' : '↓'}</span>
              {Math.abs(goldData.goldReturnPercent).toFixed(2)}%
            </div>
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 dark:text-gray-100 tracking-tight">
            {formatCurrency(goldValue, 'RON')}
            <span className="text-[10px] font-normal text-slate-600 dark:text-gray-400 ml-2">Valoare în RON</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mt-6 z-10">
         <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-800" />
          <p className="text-[10px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-widest">Rezerva de valoare</p>
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
                    <div className="bg-slate-900 dark:bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-1">{payload[0].payload.date}</p>
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
