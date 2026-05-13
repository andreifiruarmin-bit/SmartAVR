import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../../lib/utils';
import { Currency } from '../../../types';

interface PieChartWithLegendProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  displayCurrency?: Currency;
  totalValue?: number;
  colors?: string[];
  showLegend?: boolean;
  height?: number;
  onSliceClick?: (data: any, index: number) => void;
  centerLabel?: string;
  centerDescription?: string;
}

const DEFAULT_COLORS = ['#f43e01', '#10b981', '#f59e0b', '#6366f1', '#1e293b', '#94a3b8', '#ec4899', '#8b5cf6'];

export const PieChartWithLegend: React.FC<PieChartWithLegendProps> = ({
  data,
  title,
  displayCurrency = 'RON',
  totalValue,
  colors = DEFAULT_COLORS,
  showLegend = true,
  height = 300,
  onSliceClick,
  centerLabel,
  centerDescription
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const handleClick = (data: any, index: number) => {
    if (onSliceClick) {
      onSliceClick(data, index);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
          <p className="text-xs font-bold text-slate-900">{data.name}</p>
          <p className="text-sm font-black text-slate-900">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-bold text-slate-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 text-center">
          {title}
        </h3>
      )}
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                if (window.innerWidth < 768) return null; // No labels on mobile
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={window.innerWidth < 768 ? 80 : 100}
              innerRadius={window.innerWidth < 768 ? 50 : 65}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              cursor="pointer"
              stroke="white"
              strokeWidth={3}
              style={{
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  style={{
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                    transition: 'opacity 0.2s',
                    filter: activeIndex === index ? 'brightness(1.1)' : 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={<CustomLegend />} />}
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center transform -translate-y-1">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{centerLabel}</p>
              {centerDescription && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{centerDescription}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
