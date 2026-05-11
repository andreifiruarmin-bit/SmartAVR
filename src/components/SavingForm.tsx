import React, { useState } from 'react';
import { Saving, SavingType, Currency, BankDeposit, GoldSaving, StockSaving } from '../types';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';
import { SAVING_OPTIONS, CURRENCIES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface SavingFormProps {
  onAdd: (saving: Saving) => void;
  onCancel: () => void;
}

export const SavingForm: React.FC<SavingFormProps> = ({ onAdd, onCancel }) => {
  const [type, setType] = useState<SavingType | null>(null);
  const [currency, setCurrency] = useState<Currency>('RON');
  const [amount, setAmount] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  // Bank Deposit specific fields
  const [interestRate, setInterestRate] = useState<string>('');
  const [maturityDate, setMaturityDate] = useState<string>('');
  const [isCapitalized, setIsCapitalized] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>('');

  // Gold specific
  const [weight, setWeight] = useState<string>('');

  // Stock specific
  const [symbol, setSymbol] = useState<string>('');
  const [shares, setShares] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !amount || !name) return;

    const baseData = {
      id: crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      currency,
      name,
      createdAt: Date.now(),
    };

    if (type === SavingType.DEPOSIT) {
      const deposit: BankDeposit = {
        ...baseData,
        type: SavingType.DEPOSIT,
        interestRate: parseFloat(interestRate) || 0,
        startDate: new Date().toISOString(),
        maturityDate: maturityDate || new Date().toISOString(),
        isCapitalized,
        bankName,
      };
      onAdd(deposit);
    } else if (type === SavingType.GOLD) {
      const gold: GoldSaving = {
        ...baseData,
        type: SavingType.GOLD,
        weightInGrams: parseFloat(weight) || 0,
      };
      onAdd(gold);
    } else if (type === SavingType.STOCKS || type === SavingType.ETF) {
      const stock: StockSaving = {
        ...baseData,
        type: type === SavingType.STOCKS ? SavingType.STOCKS : SavingType.ETF as any,
        symbol: symbol.toUpperCase(),
        shares: parseFloat(shares) || 0,
      };
      onAdd(stock);
    } else {
      onAdd(baseData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-white">
      {/* Type Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Tip de economisire</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pb-2">
          {SAVING_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setType(opt.type)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 w-full p-4 rounded-2xl border transition-all text-[10px] font-bold uppercase tracking-tight",
                type === opt.type 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105" 
                  : "bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-400"
              )}
            >
              <opt.icon className="w-5 h-5 shrink-0" />
              <span className="text-center hyphens-auto">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {type && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              {/* Common Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Sumă</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-black text-white placeholder:text-slate-600"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Monedă</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-800 border-none rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white cursor-pointer"
                  >
                    {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500">Titlu / Descriere</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === SavingType.DEPOSIT ? "ex: Depozit Junior BCR" : type === SavingType.STOCKS ? "ex: Portofoliu BVB" : "ex: Cash Plic"}
                  className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Gold Specific */}
              {type === SavingType.GOLD && (
                <div className="space-y-1.5 pt-4 mt-2 border-t border-slate-800">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Greutate (grame)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white placeholder:text-slate-600"
                  />
                </div>
              )}

              {/* Stock/ETF Specific */}
              {(type === SavingType.STOCKS || type === SavingType.ETF) && (
                <div className="space-y-4 pt-4 mt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Simbol / Ticker</label>
                      <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="ex: AAPL, SNP, TVCP"
                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Nr. Acțiuni / Unități</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit Specific Fields */}
              {type === SavingType.DEPOSIT && (
                <div className="space-y-4 pt-4 mt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Dobândă (% an)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Data Scadență</label>
                      <input
                        type="date"
                        value={maturityDate}
                        onChange={(e) => setMaturityDate(e.target.value)}
                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-slate-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Bancă (opțional)</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="BT, BCR, ING, Revolut"
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="capitalized"
                      checked={isCapitalized}
                      onChange={(e) => setIsCapitalized(e.target.checked)}
                      className="w-5 h-5 accent-primary rounded-md cursor-pointer"
                    />
                    <label htmlFor="capitalized" className="text-xs font-bold text-slate-400 uppercase tracking-wide cursor-pointer select-none">
                      Se capitalizează dobânda
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-700 text-sm font-black uppercase text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl bg-primary text-white text-sm font-black uppercase hover:opacity-90 transition-all shadow-xl shadow-primary/40 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Salvează Active
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};
