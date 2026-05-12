import { useState } from 'react';
import { SavingType } from '../../../types';
import { DashboardProps } from '../types';

export const usePieInteraction = (onSliceClick: DashboardProps['onSliceClick'], typeData: Array<{name: string; value: number}>) => {
  const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);
  const [clickCount, setClickCount] = useState<{ index: number; count: number; timer: ReturnType<typeof setTimeout> | null }>({ index: -1, count: 0, timer: null });

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

  return { activeSliceIndex, setActiveSliceIndex, handlePieClick };
};
