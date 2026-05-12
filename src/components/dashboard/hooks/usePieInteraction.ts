import { useState, useEffect, useRef } from 'react';
import { SavingType } from '../../../types';
import { DashboardProps } from '../types';

export const usePieInteraction = (onSliceClick: DashboardProps['onSliceClick'], typeData: Array<{name: string; value: number}>) => {
  const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);
  const [clickCount, setClickCount] = useState<{ index: number; count: number; timer: ReturnType<typeof setTimeout> | null }>({ index: -1, count: 0, timer: null });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close details
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveSliceIndex(null);
        setClickCount({ index: -1, count: 0, timer: null });
      }
    };

    if (activeSliceIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeSliceIndex]);

  const handlePieClick = (data: unknown, index: number) => {
    const clickedData = data as { name?: string; value?: number };
    
    if (clickCount.timer) {
      clearTimeout(clickCount.timer);
    }

    if (clickCount.index === index && clickCount.count === 1) {
      // Double click - navigate/filter
      if (clickedData.name) {
        onSliceClick({ type: clickedData.name as SavingType });
      }
      setClickCount({ index: -1, count: 0, timer: null });
      setActiveSliceIndex(null);
    } else {
      // First click - show details
      setClickCount({ index, count: 1, timer: setTimeout(() => {
        setClickCount({ index: -1, count: 0, timer: null });
      }, 300) });
      setActiveSliceIndex(index);
    }
  };

  return { activeSliceIndex, setActiveSliceIndex, handlePieClick, containerRef };
};
