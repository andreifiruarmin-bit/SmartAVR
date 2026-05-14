import React, { useEffect } from 'react';
import { Saving, SavingType, BankDeposit, GoldSaving, StockSaving } from '../types';
import { X, Landmark, Coins, TrendingUp, Wallet, Layers, FileText, Home } from 'lucide-react';

interface SavingDetailModalProps {
  saving: Saving | null;
  onClose: () => void;
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

export const SavingDetailModal: React.FC<SavingDetailModalProps> = ({ saving, onClose }) => {
  useEffect(() => {
    if (saving) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [saving]);

  if (!saving) return null;

  const Icon = TYPE_ICONS[saving.type] || Wallet;

  return (
    <div 
      className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 max-w-lg w-full mx-4 my-auto relative"
        /* onClick={(e) => e.stopPropagation()} previne închiderea când dai click PE card */
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 dark:bg-primary text-white rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {saving.name}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {saving.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Câmpuri Detalii */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sumă
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {saving.amount.toLocaleString()} {saving.currency}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tip
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {saving.type}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Data adăugării
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {new Date(saving.createdAt).toLocaleDateString('ro-RO')}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Bancă / Locație
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {saving.bank || '—'}
            </span>
          </div>

          {/* Câmpuri condiționale */}
          {saving.type === SavingType.DEPOSIT && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Rată dobândă
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  {(saving as BankDeposit).interestRate}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Scadență
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  {(saving as BankDeposit).maturityDate ? new Date((saving as BankDeposit).maturityDate).toLocaleDateString('ro-RO') : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Capitalizare
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  {(saving as BankDeposit).isCapitalized ? 'Da' : 'Nu'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Reînnoire automată
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  {(saving as BankDeposit).autoRenewal ? 'Da' : 'Nu'}
                </span>
              </div>
            </>
          )}

          {saving.type === SavingType.GOLD && (
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Greutate
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {(saving as GoldSaving).weightInGrams} g
              </span>
            </div>
          )}

          {(saving.type === SavingType.STOCKS || saving.type === SavingType.ETF) && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Simbol
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  {(saving as StockSaving).symbol}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Număr acțiuni
                </span>
                <span className="font-black text-slate-900 dark:text-white">
                  {(saving as StockSaving).shares}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Buton Închidere */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-900 dark:bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
        >
          ÎNCHIDE
        </button>
      </div>
    </div>
  );
};