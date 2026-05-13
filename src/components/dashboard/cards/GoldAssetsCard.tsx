import React from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Currency } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { Coins, EyeOff, Eye, RefreshCw } from 'lucide-react';
import { GoldData, itemVariants } from '../types';

interface GoldAssetsCardProps {
  value: number;
  displayCurrency: Currency;
  goldData: GoldData;
  rates: Record<string, number>;
  isVisible: boolean;
  isRefreshing: boolean;
  onToggleVisibility: () => void;
  onRefreshPrice: () => void;
}

export const GoldAssetsCard: React.FC<GoldAssetsCardProps> = ({
  value,
  displayCurrency,
  goldData,
  rates,
  isVisible,
  isRefreshing,
  onToggleVisibility,
  onRefreshPrice
}) => {
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
          data-dropdown-option="true"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80 transition-all duration-200 text-white/60 hover:text-red-100"
          aria-label={isVisible ? 'Ascunde card' : 'Afișează card'}
        >
          <Eye size={18} />
        </button>
      </motion.div>
    );
  }

  return (
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
                data-dropdown-option="true"
                onClick={(e) => { e.stopPropagation(); onRefreshPrice(); }}
                disabled={isRefreshing}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reîmprospătează prețul aurului"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                data-dropdown-option="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility();
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80 transition-all duration-200 text-white/60 hover:text-red-100"
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
          </div>
          
          <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(value, displayCurrency)}
            <span className="text-[10px] font-normal text-slate-600 ml-2">Valoare în {displayCurrency}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-6 z-10">
         <div className="w-2 h-2 rounded-full bg-white" />
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Rezerva de valoare</p>
        </div>
      </motion.div>
  );
};
      