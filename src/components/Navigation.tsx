import React from 'react';
import { PieChart as PieChartIcon, List, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface NavigationProps {
  activeTab: 'dashboard' | 'list';
  setActiveTab: (tab: 'dashboard' | 'list') => void;
  onAddClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, onAddClick }) => {
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex fixed left-1/2 -translate-x-1/2 bottom-8 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-2 shadow-2xl gap-2 ring-1 ring-slate-900/5 dark:ring-white/5">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "relative px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all z-10",
            activeTab === 'dashboard' ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          aria-label="Dashboard"
        >
          {activeTab === 'dashboard' && (
            <motion.div
              layoutId="desktop-active-pill"
              className="absolute inset-0 bg-slate-900 dark:bg-primary rounded-2xl -z-10 shadow-lg shadow-slate-900/20 dark:shadow-primary/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Dashboard
          </div>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "relative px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all z-10",
            activeTab === 'list' ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          aria-label="Savings List"
        >
          {activeTab === 'list' && (
            <motion.div
              layoutId="desktop-active-pill"
              className="absolute inset-0 bg-slate-900 dark:bg-primary rounded-2xl -z-10 shadow-lg shadow-slate-900/20 dark:shadow-primary/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Active
          </div>
        </button>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden flex items-center justify-between h-24 px-8 pb-4"
        aria-label="Mobile navigation"
      >
        <div className="flex-1 flex justify-around items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all outline-none group",
              activeTab === 'dashboard' ? "text-primary" : "text-slate-400 dark:text-slate-500"
            )}
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          >
            <motion.div 
              whileTap={{ scale: 0.9, y: 2 }}
              className={cn(
                "p-2 rounded-2xl transition-all relative",
                activeTab === 'dashboard' ? "bg-primary/10" : "group-active:bg-slate-50 dark:group-active:bg-slate-800 md:group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
              )}
            >
              <PieChartIcon className="w-6 h-6" />
              {activeTab === 'dashboard' && (
                <motion.div
                  layoutId="mobile-active-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/40"
                  transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
                />
              )}
            </motion.div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter transition-all",
              activeTab === 'dashboard' ? "opacity-100" : "opacity-60"
            )}>Dashboard</span>
          </button>

          {/* Special Floating Action Button in Tab Bar for Mobile */}
          <div className="relative -mt-12 px-4">
            <motion.button
              whileHover={typeof window !== 'undefined' && window.innerWidth > 768 ? { scale: 1.05, y: -2 } : undefined}
              whileTap={{ scale: 0.9, y: 2 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={onAddClick}
              className="w-16 h-16 bg-slate-900 dark:bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-900/30 dark:shadow-primary/30 border-4 border-white dark:border-slate-800"
              aria-label="Add new saving"
            >
              <Plus className="w-8 h-8" />
            </motion.button>
          </div>

          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all outline-none group",
              activeTab === 'list' ? "text-primary" : "text-slate-400 dark:text-slate-500"
            )}
            aria-current={activeTab === 'list' ? 'page' : undefined}
          >
            <motion.div 
              whileTap={{ scale: 0.9, y: 2 }}
              className={cn(
                "p-2 rounded-2xl transition-all relative",
                activeTab === 'list' ? "bg-primary/10" : "group-active:bg-slate-50 dark:group-active:bg-slate-800 md:group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
              )}
            >
              <List className="w-6 h-6" />
              {activeTab === 'list' && (
                <motion.div
                  layoutId="mobile-active-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/40"
                  transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
                />
              )}
            </motion.div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter transition-all",
              activeTab === 'list' ? "opacity-100" : "opacity-60"
            )}>Active</span>
          </button>
        </div>
      </nav>
    </>
  );
};
