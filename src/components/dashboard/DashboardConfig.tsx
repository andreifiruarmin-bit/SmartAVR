import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, X } from 'lucide-react';
import { CardSettings } from './types';

interface DashboardConfigProps {
  cardSettings: Record<string, CardSettings>;
  onUpdateCard: (id: string, updates: Partial<CardSettings>) => void;
  onClose: () => void;
  isOpen: boolean;
  hasCash: boolean;
  hasDeposits: boolean;
  hasGold: boolean;
  hasInvestments: boolean;
}

export const DashboardConfig: React.FC<DashboardConfigProps> = ({
  cardSettings,
  onUpdateCard,
  onClose,
  isOpen,
  hasCash,
  hasDeposits,
  hasGold,
  hasInvestments
}) => {
  const cardTitles: Record<string, string> = {
    'cash_reserve': 'Rezervă Cash',
    'bank_deposits': 'Depozite Bancare',
    'gold_assets': 'Aur',
    'equities_assets': 'Acțiuni & ETF',
    'portfolio_evolution': 'Evoluție Portofoliu',
    'deposits_evolution': 'Evoluție Depozite',
    'currency_stats': 'Statistici Monede'
  };

  const getCardAvailability = (id: string) => {
    switch (id) {
      case 'cash_reserve': return hasCash;
      case 'bank_deposits': return hasDeposits;
      case 'gold_assets': return hasGold;
      case 'equities_assets': return hasInvestments;
      case 'deposits_evolution': return hasDeposits;
      default: return true;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="bg-white w-full md:max-w-2xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Configurare Dashboard</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Alege cardurile pe care vrei să le vezi</p>
              </div>
              <button 
                onClick={onClose}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(cardSettings).filter(id => id !== 'portfolio_summary').map(id => {
                const settings = cardSettings[id];
                const isAvailable = getCardAvailability(id);
                const title = cardTitles[id] || id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                return (
                  <div 
                    key={id}
                    className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${
                      settings.visible 
                        ? "bg-white dark:bg-gray-800 border-primary shadow-sm" 
                        : "bg-slate-50 dark:bg-gray-700 border-slate-100",
                      !isAvailable && "opacity-50 grayscale cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        settings.visible ? "bg-primary/10 text-primary" : "bg-slate-200 dark:bg-gray-600 text-slate-400"
                      }`}>
                        {settings.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight">{title}</p>
                        <p className="text-[8px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest">
                          {isAvailable ? 'Instrument activ' : 'Fără active'}
                        </p>
                      </div>
                    </div>
                    
                    {isAvailable && (
                      <button
                        onClick={() => onUpdateCard(id, { visible: !settings.visible })}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                          settings.visible 
                            ? "bg-slate-900 dark:bg-gray-900 text-white shadow-lg shadow-slate-900/10" 
                            : "bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        {settings.visible ? 'Afișat' : 'Ascuns'}
                      </button>
                    )}
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
