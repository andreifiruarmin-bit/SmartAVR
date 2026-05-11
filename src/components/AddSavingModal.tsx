import React from 'react';
import { Saving } from '../types';
import { SavingForm } from './SavingForm';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (saving: Saving) => void;
}

export const AddSavingModal: React.FC<AddSavingModalProps> = ({ isOpen, onClose, onAdd }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 bottom-8 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-slate-900 rounded-[32px] p-6 z-[60] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight text-white uppercase tracking-widest text-xs">Adaugă Active / Economii</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                aria-label="Închide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SavingForm onAdd={onAdd} onCancel={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
