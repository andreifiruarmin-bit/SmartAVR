import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, EyeOff, LayoutPanelTop } from 'lucide-react';
import { SavingType } from '../../types';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: Record<string, boolean>;
  setVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  availableTypes: string[];
}

export const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
  isOpen,
  onClose,
  visibility,
  setVisibility,
  availableTypes
}) => {
  const toggleVisibility = (id: string) => {
    setVisibility(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sections = [
    { id: 'analysis', name: 'Analiză Portofoliu', icon: LayoutPanelTop },
    { id: 'cash', name: 'Rezervă Cash', type: SavingType.CASH_RESERVE, icon: LayoutPanelTop },
    { id: 'deposits', name: 'Depozite Bancare', type: SavingType.DEPOSIT, icon: LayoutPanelTop },
    { id: 'equities', name: 'Bursă & Titluri', type: SavingType.STOCKS, icon: LayoutPanelTop },
    { id: 'gold', name: 'Aur Propiu', type: SavingType.GOLD, icon: LayoutPanelTop },
    { id: 'rent', name: 'Chirii / Rent', type: SavingType.RENT, icon: LayoutPanelTop },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Setări Dashboard</h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Configurează vizibilitatea cardurilor</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
              {sections.map(s => {
                const isAvailable = !s.type || availableTypes.includes(s.type as string) || availableTypes.includes(SavingType.STOCKS) || availableTypes.includes(SavingType.ETF) || availableTypes.includes(SavingType.BONDS);
                const isVisible = visibility[s.id] !== false;

                return (
                  <div 
                    key={s.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all",
                      isAvailable ? "border-slate-100 dark:border-slate-800" : "border-slate-50 dark:border-slate-900 opacity-40 grayscale"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isVisible ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      )}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{s.name}</p>
                        {!isAvailable && <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Inactiv (Fără active)</p>}
                      </div>
                    </div>

                    {isAvailable && (
                      <button
                        onClick={() => toggleVisibility(s.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2",
                          isVisible ? "bg-slate-900 dark:bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}
                      >
                        {isVisible ? <><Eye className="w-3 h-3" /> Afișat</> : <><EyeOff className="w-3 h-3" /> Ascuns</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Salvează Configurația
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
