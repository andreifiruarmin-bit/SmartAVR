import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface CollapsibleCardProps {
  cardId: string;
  title: string;
  icon: string;
  totalValue: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  cardId,
  title,
  icon,
  totalValue,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <motion.div 
      className="bg-white rounded-[3rem] border border-slate-200 shadow-sm relative group transition-all duration-500 w-full h-full"
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Collapsed Summary */}
      <motion.div
        className="p-6 cursor-pointer"
        onClick={onToggle}
        layoutId={`card-${cardId}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-slate-900">
              {formatCurrency(totalValue, 'RON')}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-full bg-slate-100"
            >
              <ChevronDown className="w-5 h-5 text-slate-600" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <div className="border-t border-slate-200 pt-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
