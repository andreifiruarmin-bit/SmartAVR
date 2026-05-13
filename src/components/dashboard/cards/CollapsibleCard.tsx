import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  totalValue: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  totalValue,
  isExpanded,
  onToggle,
  children,
  className,
  headerClassName
}) => {
  return (
    <div className={cn("bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group transition-all duration-500", className)}>
      <button
        onClick={onToggle}
        className={cn("w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors", headerClassName)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
            {icon}
          </div>
          <div className="text-left">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{totalValue}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500", isExpanded && "rotate-180")}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-8 pb-8 border-t border-slate-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
