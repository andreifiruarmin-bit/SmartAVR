import React from 'react';
import { Saving, SavingType } from '../types';
import { formatCurrency } from '../lib/utils';
import { CURRENCY_SYMBOLS } from '../constants';
import { Trash2, Landmark, Coins, TrendingUp, Wallet, ArrowRight, Layers, FileText, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SavingsListProps {
  savings: Saving[];
  onDelete: (id: string) => void;
}

const TYPE_ICONS: Record<string, any> = {
  [SavingType.DEPOSIT]: Landmark,
  [SavingType.GOLD]: Coins,
  [SavingType.STOCKS]: TrendingUp,
  [SavingType.ETF]: Layers,
  [SavingType.BONDS]: FileText,
  [SavingType.RENT]: Home,
  [SavingType.CASH_RESERVE]: Wallet,
};

export const SavingsList: React.FC<SavingsListProps> = ({ savings, onDelete }) => {
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  if (savings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Lista este goală</h2>
        <p className="text-slate-500">Adaugă prima ta economie pentru a o vedea aici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-primary rounded-full" />
          Economii Active
        </h2>
        <span className="text-[10px] bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-400 font-black uppercase tracking-widest shadow-sm">
          {savings.length} Active
        </span>
      </div>
      
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[600px]">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="pb-4 pr-4">Produs / Asset</th>
                <th className="pb-4 px-4">Instituție</th>
                <th className="pb-4 px-4">Suma Deținută</th>
                <th className="pb-4 px-4">Performanță</th>
                <th className="pb-4 pl-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {savings.map((s) => {
                const Icon = TYPE_ICONS[s.type] || Wallet;
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{s.name}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mt-0.5">{s.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {(s as any).bankName || (s.type === SavingType.GOLD ? 'SAFE' : 'PERSOANĂ')}
                      </p>
                    </td>
                    <td className="py-5 px-4 font-black text-sm text-slate-900">
                      {formatCurrency(s.amount, s.currency)}
                    </td>
                    <td className="py-5 px-4">
                      {s.type === SavingType.DEPOSIT && (s as any).interestRate ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                           +{(s as any).interestRate}% <span className="italic opacity-60">AN</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 italic uppercase">Variabil</span>
                      )}
                    </td>
                    <td className="py-5 pl-4 text-right">
                      <AnimatePresence mode="wait">
                        {confirmDeleteId === s.id ? (
                          <motion.div 
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center justify-end gap-2"
                          >
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 px-2 py-1"
                            >
                              Nu
                            </button>
                            <button
                              onClick={() => {
                                onDelete(s.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-[10px] font-black uppercase bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/20"
                            >
                              Da, Șterge
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="delete-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setConfirmDeleteId(s.id)}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
