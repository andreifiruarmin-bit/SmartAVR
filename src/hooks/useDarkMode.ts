import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('smartavr-theme');
    if (stored !== null) {
      return stored === 'dark';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save preference to localStorage
    localStorage.setItem('smartavr-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(prev => !prev);
  };

  return { isDark, toggleDark };
};
