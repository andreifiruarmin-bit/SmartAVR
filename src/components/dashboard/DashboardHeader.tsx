import React from 'react';
import { motion } from 'motion/react';
import { Saving } from '../../types';
import { Settings2 } from 'lucide-react';
import { DarkModeToggle } from '../DarkModeToggle';
import { itemVariants } from './types';

interface DashboardHeaderProps {
  savings: Saving[];
  onOpenConfig: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ savings, onOpenConfig }) => {
  return (
    <motion.div 
      variants={itemVariants}
      className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
    >
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Portofoliu Dashboard</h2>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Analiză financiară în timp real</p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <DarkModeToggle />
        <button
          onClick={onOpenConfig}
          className="p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:bg-slate-50 transition-all group"
          title="Configurare Dashboard"
        >
          <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:rotate-90 transition-all duration-500" />
        </button>
      </div>
    </motion.div>
  );
};
