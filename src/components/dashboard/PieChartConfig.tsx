import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PieChart as PieChartIcon, Plus, Check } from 'lucide-react';
import { CardSettings } from './types';

interface PieChartConfigProps {
  isOpen: boolean;
  onClose: () => void;
  cardSettings: Record<string, CardSettings>;
  onUpdateCard: (id: string, updates: Partial<CardSettings>) => void;
}

export const PieChartConfig: React.FC<PieChartConfigProps> = ({
  isOpen,
  onClose,
  cardSettings,
  onUpdateCard
}) => {
  const pieChartCards = [
    { id: 'currency_stats', title: 'Statistici Monede', description: 'Distribuția valutară a portofoliului' },
    { id: 'portfolio_evolution', title: 'Evoluție Portofoliu', description: 'Grafic evoluție în timp' },
    { id: 'deposits_evolution', title: 'Evoluție Depozite', description: 'Grafic evoluție depozite' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="bg-white dark:bg-gray-800 w-full md:max-w-2xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                  <PieChartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Grafice Pie</h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest mt-1">Configurează vizualizările</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {pieChartCards.map(card => {
                const isVisible = cardSettings[card.id]?.visible ?? false;
                
                return (
                  <div 
                    key={card.id}
                    className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${
                      isVisible 
                        ? "bg-white dark:bg-gray-800 border-primary shadow-sm" 
                        : "bg-slate-50 dark:bg-gray-700 border-slate-200 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        isVisible ? "bg-primary/10 text-primary" : "bg-slate-200 dark:bg-gray-600 text-slate-400"
                      }`}>
                        {isVisible ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{card.title}</p>
                        <p className="text-[8px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest">{card.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onUpdateCard(card.id, { visible: !isVisible })}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                        isVisible 
                          ? "bg-slate-900 dark:bg-gray-900 text-white shadow-lg shadow-slate-900/10" 
                          : "bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {isVisible ? 'Activ' : 'Adaugă'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-900 dark:bg-gray-900 text-white text-[10px] font-black rounded-3xl mt-8 hover:bg-primary transition-all uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20"
            >
              Salvează Configurația
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
