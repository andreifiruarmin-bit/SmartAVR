import React from 'react';
import { formatCurrency } from '../../../lib/utils';

export const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{data.name}</p>
        <p className="text-base font-black tracking-tight">{formatCurrency(data.value, 'RON')}</p>
        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }
  return null;
};
