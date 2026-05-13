import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatCurrency } from '../../../lib/utils';
import { EyeOff } from 'lucide-react';

interface PortfolioEvolutionCardProps {
  data: any[];
  hasDeposits: boolean;
  onHide?: () => void;
}

export const PortfolioEvolutionCard: React.FC<PortfolioEvolutionCardProps> = ({ data, hasDeposits, onHide }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
    >
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/30" />
            Evoluție Istorică & Proiectată
          </h4>
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Analiză Portofoliu</h3>
            <button 
              onClick={onHide}
              className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Include dobândă netă depozite (-10% impozit)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Portofoliu</span>
          </div>
          {hasDeposits && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Depozite + Dobândă</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
                    <div className="bg-slate-900 p-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{payload[0].payload.fullDate}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-[10px] font-black text-primary uppercase">Total:</span>
                          <span className="text-sm font-black text-white">{formatCurrency(payload[0].value as number, 'RON')}</span>
                        </div>
                        {hasDeposits && payload[1] && (
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-[10px] font-black text-emerald-400 uppercase">Depozite:</span>
                            <span className="text-sm font-black text-white">{formatCurrency(payload[1].value as number, 'RON')}</span>
                          </div>
                        )}
                      </div>
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
