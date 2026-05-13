import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { cn } from '../../../lib/utils';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartWithLegendProps {
  data: PieChartData[];
  colors: string[];
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  onSliceClick?: (data: PieChartData | null) => void;
  onDoubleClick?: (data: PieChartData) => void;
  title: string;
  selectedSlice?: string | null;
}

export const PieChartWithLegend: React.FC<PieChartWithLegendProps> = ({
  data,
  colors,
  innerRadius = 70,
  outerRadius = 110,
  centerLabel,
  centerSubLabel,
  onSliceClick,
  onDoubleClick,
  title,
  selectedSlice: externalSelectedSlice
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [internalActiveSlice, setInternalActiveSlice] = React.useState<string | null>(null);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(!window.matchMedia('(hover: hover)').matches || window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeSlice = externalSelectedSlice !== undefined ? externalSelectedSlice : internalActiveSlice;

  const handleClick = (entry: any) => {
    if (!entry || !entry.name) return;
    
    const name = entry.name;
    
    if (activeSlice === name) {
      // Second click on the same slice: trigger drill-down/filtering action
      onDoubleClick?.(entry);
    } else {
      // First click: select and highlight (not filtering yet)
      setInternalActiveSlice(name);
      onSliceClick?.(entry);
    }
  };

  // Listen for clicks outside to reset
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current || activeSlice === null) return;
      
      if (!containerRef.current.contains(e.target as Node)) {
        setInternalActiveSlice(null);
        onSliceClick?.(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeSlice, onSliceClick]);

  const totalValue = useMemo(() => data.reduce((a, b) => a + b.value, 0), [data]);
  const memoizedData = useMemo(() => data, [data]);

  const renderLegendItem = (entry: PieChartData, index: number) => (
    <div 
      key={`legend-${entry.name}-${index}`} 
      className={cn(
        "flex items-center gap-3 md:gap-4 group cursor-pointer px-3 md:px-4 py-2.5 md:py-3 rounded-2xl transition-all border border-transparent min-w-0 w-full",
        activeSlice === entry.name ? "bg-white dark:bg-slate-800 shadow-xl border-slate-100 dark:border-slate-700 scale-105" : "opacity-70 md:hover:opacity-100",
        activeSlice !== null && activeSlice !== entry.name && "opacity-20 scale-95"
      )}
      onClick={() => handleClick(entry)}
    >
      <div 
        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-lg flex-shrink-0 shadow-sm transition-transform duration-300 md:group-hover:scale-110" 
        style={{ backgroundColor: colors[index % colors.length] }}
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className={cn(
          "text-[9px] md:text-[11px] font-black uppercase tracking-tight leading-tight transition-colors whitespace-pre-wrap break-keep",
          activeSlice === entry.name ? "text-primary" : "text-slate-900 dark:text-slate-200"
        )}>
          {entry.name}
        </span>
        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5 opacity-80">
          {((entry.value / totalValue) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="flex flex-col w-full items-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full px-4">
        <div className="h-80 w-80 md:h-[400px] md:w-[400px] relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={memoizedData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={600}
                animationBegin={0}
                animationEasing="ease-out"
                stroke="none"
              >
                {memoizedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${entry.name}-${index}`} 
                    fill={colors[index % colors.length]}
                    onClick={(e) => {
                      if (e && e.stopPropagation) e.stopPropagation();
                      handleClick(entry);
                    }}
                    style={{ 
                      opacity: activeSlice === null || activeSlice === entry.name ? 1 : 0.2,
                      filter: activeSlice === entry.name ? 'drop-shadow(0px 8px 32px rgba(0,0,0,0.3))' : 'none',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      outline: 'none',
                      transform: activeSlice === entry.name ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              {!isMobile && (
                <Tooltip 
                  content={<CustomTooltip />} 
                  wrapperStyle={{ pointerEvents: 'none' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {centerSubLabel && <span className="text-[10px] md:text-[12px] font-black uppercase text-slate-400 tracking-[0.2em] leading-tight mb-2 block">{centerSubLabel}</span>}
            {centerLabel && <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white drop-shadow-md break-words">{centerLabel}</span>}
          </div>
        </div>

        {/* Legend */}
        <div className={cn(
          "grid gap-3 w-full md:gap-4 md:mt-0",
          data.length > 1 ? "grid-cols-2 md:w-auto md:min-w-[400px]" : "grid-cols-1 md:min-w-[220px]"
        )}>
          {(() => {
            if (data.length <= 1) {
              return data.map((entry, index) => renderLegendItem(entry, index));
            }
            const leftCount = Math.ceil(data.length / 2);
            const leftCol = data.slice(0, leftCount);
            const rightCol = data.slice(leftCount);
            
            return (
              <>
                <div className="flex flex-col gap-3">
                  {leftCol.map((entry, index) => renderLegendItem(entry, index))}
                </div>
                <div className="flex flex-col gap-3">
                  {rightCol.map((entry, index) => renderLegendItem(entry, index + leftCount))}
                </div>
              </>
            );
          })()}
        </div>
      </div>
      <p className="text-[10px] md:text-[12px] font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-6 md:px-8 py-2 md:py-2.5 rounded-full uppercase tracking-[0.2em] mt-8 md:mt-12 shadow-xl">{title}</p>
    </div>
  );
};
