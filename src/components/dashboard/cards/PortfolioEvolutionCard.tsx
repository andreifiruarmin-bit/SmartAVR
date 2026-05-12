import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../../lib/utils';
import { EyeOff, TrendingUp } from 'lucide-react';
import { itemVariants } from '../types';

interface PortfolioEvolutionCardProps {
  portfolioHistory: Array<{ date: string; total: number; deposits?: number; fullDate?: string }>;
  hasDeposits: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const PortfolioEvolutionCard: React.FC<PortfolioEvolutionCardProps> = ({
  portfolioHistory,
  hasDeposits,
  isVisible,
  onToggleVisibility
}) => {
  if (!isVisible) {
    return (
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm flex items-center justify-between group transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-gray-100">Evoluție Istorică</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">Ascuns</p>
          </div>
        </div>
        <button 
          onClick={onToggleVisibility}
          className="p-2 text-slate-400 dark:text-gray-400 hover:text-primary transition-all rounded-xl hover:bg-primary/10"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[3rem] border border-slate-200 dark:border-gray-700 shadow-sm relative group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
    >
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-400 flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-primary dark:bg-gray-900 rounded-full shadow-lg shadow-primary/30 dark:shadow-gray-900/30" />
            Evoluție Istorică & Proiectată
          </h4>
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-gray-100 tracking-tighter">Analiză Portofoliu</h3>
            <button 
              onClick={onToggleVisibility}
              className="p-1 text-slate-300 dark:text-gray-400 hover:text-red-500 transition-all p-2 bg-slate-50 dark:bg-gray-800 text-slate-400 dark:text-gray-400 hover:text-red-500 rounded-xl transition-all"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest mt-1 italic">Include dobanda netă depozite (-10% impozit)</p>
        </div>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Total Portofoliu</span>
        </div>
        {hasDeposits && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Depozite + Dobândă</span>
          </div>
        )}
      </div>
    </div>

    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={portfolioHistory}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43e01" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f43e01" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 dark:bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-400 mb-1">{payload[0].payload.fullDate || payload[0].payload.date}</p>
                    <p className="text-sm font-black tracking-tight">{formatCurrency(Number(payload[0].value), 'RON')}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#f43e01" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorTotal)"
            animationDuration={2000}
          />
          {hasDeposits && (
            <Area 
              type="monotone" 
              dataKey="deposits" 
              stroke="#10b981" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorDeposits)"
              animationDuration={2500}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
  );
};
