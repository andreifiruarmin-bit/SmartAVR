import React, { useState } from 'react';
import { Saving, SavingType, Currency, BankDeposit, GoldSaving, StockSaving } from '../types';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';
import { SAVING_OPTIONS, CURRENCIES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface SavingFormProps {
  onAdd: (saving: Saving) => void;
  onCancel: () => void;
  initialData?: Saving | null;
}

export const SavingForm: React.FC<SavingFormProps> = ({ onAdd, onCancel, initialData }) => {
  const [type, setType] = useState<SavingType | null>(initialData?.type || null);
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'RON');
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '');
  const [name, setName] = useState<string>(initialData?.name || '');
  const [details, setDetails] = useState<Record<string, any>>(initialData?.details || {});
  
  // Bank Deposit specific fields
  const [interestRate, setInterestRate] = useState<string>((initialData as any)?.interestRate?.toString() || '');
  const [maturityDate, setMaturityDate] = useState<string>((initialData as any)?.maturityDate || '');
  const [startDate, setStartDate] = useState<string>((initialData as any)?.startDate || new Date().toISOString().split('T')[0]);
  const [isCapitalized, setIsCapitalized] = useState<boolean>((initialData as any)?.isCapitalized || false);
  const [bankName, setBankName] = useState<string>((initialData as any)?.bank || '');

  // Gold specific
  const [weight, setWeight] = useState<string>(initialData?.details?.weightInGrams?.toString() || '');

  // Stock specific
  const [symbol, setSymbol] = useState<string>(initialData?.details?.symbol || '');
  const [shares, setShares] = useState<string>(initialData?.details?.shares?.toString() || '');
  const [avgAcquisitionPrice, setAvgAcquisitionPrice] = useState<string>((initialData as any)?.details?.averageAcquisitionPrice?.toString() || '');
  const [market, setMarket] = useState<'BVB' | 'NYSE' | 'NASDAQ' | 'OTHER'>((initialData as any)?.details?.market || 'BVB');

  // Titluri de Stat shares extra fields with Deposit
  const isSecurity = type === SavingType.BONDS || type === SavingType.DEPOSIT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !amount || !name) return;

    const baseData: any = {
      id: initialData?.id || crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      currency,
      name,
      createdAt: initialData?.createdAt || Date.now(),
      startDate: startDate,
      details: initialData?.details || {}
    };

    if (type === SavingType.DEPOSIT || type === SavingType.BONDS) {
      baseData.interestRate = parseFloat(interestRate) || 0;
      baseData.maturityDate = maturityDate;
      if (type === SavingType.DEPOSIT) {
        baseData.isCapitalized = isCapitalized;
        baseData.bank = bankName;
      }
    } else if (type === SavingType.GOLD) {
      baseData.details.weightInGrams = parseFloat(weight) || 0;
      baseData.details.acquisitionPricePerGram = details.acquisitionPricePerGram || 0;
    } else if (type === SavingType.STOCKS || type === SavingType.ETF) {
      baseData.details.symbol = symbol.toUpperCase();
      baseData.details.shares = parseFloat(shares) || 0;
      baseData.details.averageAcquisitionPrice = parseFloat(avgAcquisitionPrice) || 0;
      baseData.details.market = market;
      baseData.bank = bankName; // Broker
    }

    onAdd(baseData);
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
                  <label className="text-[10px] font-bold uppercase text-slate-500">Preț achiziție per gram (RON)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={(weight && parseFloat(weight)) ? (parseFloat(weight) * parseFloat(weight) / parseFloat(weight)).toString() : ''}
                    onChange={(e) => {
                      const newWeight = e.target.value;
                      setWeight(newWeight);
                      // Update details with acquisition price per gram
                      const acquisitionPrice = parseFloat(newWeight) ? (parseFloat(weight) * parseFloat(newWeight) / parseFloat(weight)).toString() : '';
                      setDetails(prevDetails => ({
                        ...prevDetails,
                        weightInGrams: parseFloat(newWeight) || 0,
                        acquisitionPricePerGram: parseFloat(acquisitionPrice) || 0
                      }));
                    }}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white placeholder:text-slate-600"
                  />
                  <div className="mt-2 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
                    <p className="text-sm text-slate-300">
                      Valoare la achiziție: <span className="font-bold text-white">
                        {weight && parseFloat(weight) ? (parseFloat(weight) * parseFloat(weight)).toFixed(2) : '0.00'} RON
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 italic">
                      ⚠️ Aceasta este valoarea la achiziție. Valoarea curentă a portofoliului de aur se actualizează zilnic din datele de piață.
                    </p>
                  </div>
                </div>
              )}

              {/* Deposit & Bonds Specific Fields */}
              {(type === SavingType.DEPOSIT || type === SavingType.BONDS) && (
                <div className="space-y-4 pt-4 mt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Data Constituării</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-slate-300 font-bold"
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

                  <div className="flex gap-2 pb-2">
                    {[1, 3, 6, 12, 24, 36].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          const base = startDate ? new Date(startDate) : new Date();
                          base.setMonth(base.getMonth() + m);
                          setMaturityDate(base.toISOString().split('T')[0]);
                        }}
                        className="text-[9px] font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-slate-400 transition-colors"
                      >
                        {m} LUNI
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">
                        {type === SavingType.DEPOSIT ? 'Dobândă (% an)' : 'Cupon / Dobândă (% an)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {type === SavingType.DEPOSIT && (
                    <>
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
                    </>
                  )}
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Preț mediu achiziție (RON/acțiune)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={avgAcquisitionPrice}
                        onChange={(e) => {
                          const newPrice = e.target.value;
                          setAvgAcquisitionPrice(newPrice);
                          // Update details with average acquisition price
                          setDetails(prev => ({
                            ...prev,
                            averageAcquisitionPrice: parseFloat(newPrice) || 0
                          }));
                        }}
                        placeholder="0.00"
                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Piață</label>
                      <select
                        value={market}
                        onChange={(e) => setMarket(e.target.value as 'BVB' | 'NYSE' | 'NASDAQ' | 'OTHER')}
                        className="w-full bg-slate-800 border-none rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-black text-white cursor-pointer"
                      >
                        <option value="BVB">BVB</option>
                        <option value="NYSE">NYSE</option>
                        <option value="NASDAQ">NASDAQ</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Broker (opțional)</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Tradeville, Interactive Brokers, Revolut"
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white placeholder:text-slate-600"
                    />
                  </div>
                  <div className="mt-2 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
                    <p className="text-sm text-slate-300">
                      Valoare totală la achiziție: <span className="font-bold text-white">
                        {avgAcquisitionPrice && shares ? (parseFloat(avgAcquisitionPrice) * parseFloat(shares)).toFixed(2) : '0.00'} RON
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 italic">
                      ⚠️ Aceasta este valoarea la achiziție. Valoarea curentă a portofoliului de acțiuni se actualizează zilnic din datele de piață.
                    </p>
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
