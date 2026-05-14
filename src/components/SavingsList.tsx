import React, { useMemo, useState, useCallback } from 'react';
import { Saving, SavingType, Currency, BankDeposit } from '../types';
import { formatCurrency } from '../lib/utils';
import { getDaysUntilMaturity } from '../lib/depositUtils';
import {
  Trash2,
  Landmark,
  Coins,
  TrendingUp,
  Wallet,
  Layers,
  FileText,
  Home,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
  Pencil,
  ArrowUpDown,
  Eye
} from 'lucide-react';

import { AnimatePresence } from 'motion/react';
import { Virtuoso } from 'react-virtuoso';

interface SavingsListProps {
  savings: Saving[];
  onDelete: (id: string) => void;
  onEdit: (saving: Saving) => void;
  filter: { type?: SavingType; currency?: Currency } | null;
  onClearFilter: () => void;
  onViewDetails: (saving: Saving) => void;
}

type SortField = 'amount' | 'type' | 'date' | 'name' | 'interestRate' | 'maturityDate';
type SortDirection = 'asc' | 'desc';

const TYPE_ICONS: Record<string, any> = {
  [SavingType.DEPOSIT]: Landmark,
  [SavingType.GOLD]: Coins,
  [SavingType.STOCKS]: TrendingUp,
  [SavingType.ETF]: Layers,
  [SavingType.BONDS]: FileText,
  [SavingType.RENT]: Home,
  [SavingType.CASH_RESERVE]: Wallet,
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface RowProps {
  saving: Saving;
  index: number;
  style?: React.CSSProperties;
  colors?: string[];
  confirmDeleteId: string | null;
  setConfirmDeleteId: React.Dispatch<React.SetStateAction<string | null>>;
  onDelete: (id: string) => void;
  onEdit: (saving: Saving) => void;
  onViewDetails: (saving: Saving) => void;
}

const DesktopRow = React.memo(({
  saving: s,
  index,
  style,
  confirmDeleteId,
  setConfirmDeleteId,
  onDelete,
  onEdit,
  onViewDetails
}: RowProps) => {
  const Icon = TYPE_ICONS[s.type] || Wallet;

  return (
    <div style={style} className="border-b border-slate-50 dark:border-slate-800/50">
      <div className="flex items-center group md:hover:bg-slate-50/50 dark:md:hover:bg-slate-800/50 transition-colors h-full px-4">
        <div className="flex-[2] flex items-center gap-5 min-w-0 pr-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 md:group-hover:bg-primary md:group-hover:text-white transition-all">
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-white md:group-hover:text-primary transition-colors truncate">
              {s.name}
            </p>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                {s.type}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-[1.5] flex items-center gap-2 px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 md:group-hover:bg-primary transition-colors" />

          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 truncate">
            {s.bank || (s.type === SavingType.GOLD ? 'SEIF PERSONAL' : 'CUSTODIE PROPRIE')}
          </p>
        </div>

        <div className="flex-[1.5] flex flex-col px-4">
          <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(s.amount, s.currency)}
          </span>

          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Valoare
          </span>
        </div>

        <div className="flex-[1.2] px-4">
          {(s.type === SavingType.DEPOSIT || s.type === SavingType.BONDS) &&
          (s as any).interestRate ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-lg text-[9px] font-black border border-emerald-100 dark:border-emerald-500/20">
                +{(s as any).interestRate}%
              </div>
              {s.type === SavingType.DEPOSIT && (() => {
                const days = getDaysUntilMaturity(s as BankDeposit);
                if (days <= 0) return (
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[8px] font-black border border-amber-500/20">
                    SCADENT
                  </div>
                );
                if (days <= 7) return (
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[8px] font-black border border-blue-500/20">
                    {days}Z
                  </div>
                );
                return null;
              })()}
            </>
          ) : (
            <span className="text-[9px] font-black text-slate-400 uppercase italic">
              Variabil
            </span>
          )}
        </div>

        <div className="flex-1 flex items-center justify-end gap-2 pl-4">
          <button
            onClick={() => onViewDetails(s)}
            className="p-2 text-slate-300 md:hover:text-blue-400 transition-colors active:text-blue-400"
            aria-label="Vezi detalii"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(s)}
            className="p-2 text-slate-300 md:hover:text-primary transition-colors active:text-primary"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            {confirmDeleteId === s.id ? (
              <div className="flex gap-1">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="p-1 text-[8px] font-black bg-slate-100 rounded text-slate-500"
                >
                  X
                </button>

                <button
                  onClick={() => {
                    onDelete(s.id);
                    setConfirmDeleteId(null);
                  }}
                  className="p-1 px-2 text-[8px] font-black bg-red-600 text-white rounded"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(s.id)}
                className="p-2 text-slate-300 md:hover:text-red-500 transition-colors active:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

const MobileRow = React.memo(({
  saving: s,
  index,
  style,
  confirmDeleteId,
  setConfirmDeleteId,
  onDelete,
  onEdit,
  onViewDetails
}: RowProps) => {
  const Icon = TYPE_ICONS[s.type] || Wallet;

  return (
    <div style={{ ...style, padding: '8px 0' }}>
      <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-3xl p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-primary">
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">
                {s.name}
              </p>

              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                {s.type}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(s)}
              className="p-2 text-slate-400"
              aria-label="Vezi detalii"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => onEdit(s)} className="p-2 text-slate-400">
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={() => setConfirmDeleteId(s.id)}
              className="p-2 text-slate-300 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-slate-200/50 pt-3 mt-1">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">
              Valoare
            </p>

            <p className="font-black text-sm text-slate-900 dark:text-white">
              {formatCurrency(s.amount, s.currency)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">
              Instituție
            </p>

            <p className="text-[9px] font-black uppercase text-slate-500 truncate max-w-[100px]">
              {s.bank || 'PROPRIE'}
            </p>

            {s.type === SavingType.DEPOSIT && (() => {
              const days = getDaysUntilMaturity(s as BankDeposit);
              if (days <= 0) return (
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[8px] font-black border border-amber-500/20">
                  SCADENT
                </div>
              );
              if (days <= 7) return (
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[8px] font-black border border-blue-500/20">
                  {days}Z
                </div>
              );
              return null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
});

export const SavingsList: React.FC<SavingsListProps> = ({
  savings,
  onDelete,
  onEdit,
  filter,
  onClearFilter,
  onViewDetails
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('date');

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('desc');

  const [searchTerm, setSearchTerm] = useState('');

  const [dateRange, setDateRange] =
    useState<'all' | '30days' | 'thisYear'>('all');

  const [typeFilter, setTypeFilter] = useState<SavingType | 'all'>('all');

  const filteredAndSortedSavings = useMemo(() => {
    let result = [...savings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          (s.bank || (s as any).bankName)?.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(s => s.type === typeFilter);
    }

    if (dateRange !== 'all') {
      const now = Date.now();

      const thirtyDaysAgo =
        now - 30 * 24 * 60 * 60 * 1000;

      const beginningOfYear = new Date(
        new Date().getFullYear(),
        0,
        1
      ).getTime();

      if (dateRange === '30days') {
        result = result.filter(
          s => (s.createdAt || 0) >= thirtyDaysAgo
        );
      } else if (dateRange === 'thisYear') {
        result = result.filter(
          s => (s.createdAt || 0) >= beginningOfYear
        );
      }
    }

    return result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'amount':
          comparison = a.amount - b.amount;
          break;

        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;

        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;

        case 'interestRate':
          comparison = ((a as any).interestRate || 0) - ((b as any).interestRate || 0);
          break;

        case 'maturityDate':
          const aDate = (a as any).maturityDate ? new Date((a as any).maturityDate).getTime() : 0;
          const bDate = (b as any).maturityDate ? new Date((b as any).maturityDate).getTime() : 0;
          comparison = aDate - bDate;
          break;

        case 'date':
        default:
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
      }

      return sortDirection === 'asc'
        ? comparison
        : -comparison;
    });
  }, [
    savings,
    searchTerm,
    dateRange,
    sortField,
    sortDirection,
    typeFilter
  ]);

  const handleReset = () => {
    setSearchTerm('');
    setDateRange('all');
    onClearFilter();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 flex-1 w-full">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
            <div className="w-3 h-10 bg-primary rounded-full shadow-2xl shadow-primary/50" />
            Portofoliu Active
          </h2>

          {/* SEARCH */}
          <div className="mt-4 flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </div>

              <input
                type="text"
                placeholder="Caută după nume sau bancă..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm dark:text-white"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Type Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {[
          { value: 'all', label: 'Toate' },
          { value: SavingType.DEPOSIT, label: 'Depozite' },
          { value: SavingType.CASH_RESERVE, label: 'Cash' },
          { value: SavingType.GOLD, label: 'Aur' },
          { value: SavingType.STOCKS, label: 'Acțiuni' },
          { value: SavingType.ETF, label: 'ETF' },
          { value: SavingType.BONDS, label: 'Titluri Stat' },
          { value: SavingType.RENT, label: 'Chirii' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setTypeFilter(option.value as SavingType | 'all')}
            className={cn(
              'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center',
              typeFilter === option.value
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => toggleSort('amount')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors min-h-[40px]',
            sortField === 'amount'
              ? 'text-primary border-primary bg-primary/5'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          )}
        >
          <ArrowUpDown className="w-3 h-3" />
          Sumă
          {sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
        </button>
        <button
          onClick={() => toggleSort('type')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors min-h-[40px]',
            sortField === 'type'
              ? 'text-primary border-primary bg-primary/5'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          )}
        >
          <Layers className="w-3 h-3" />
          Tip
          {sortField === 'type' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
        </button>
        <button
          onClick={() => toggleSort('interestRate')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors min-h-[40px]',
            sortField === 'interestRate'
              ? 'text-primary border-primary bg-primary/5'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          )}
        >
          <TrendingUp className="w-3 h-3" />
          Randament
          {sortField === 'interestRate' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
        </button>
        <button
          onClick={() => toggleSort('maturityDate')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-colors min-h-[40px]',
            sortField === 'maturityDate'
              ? 'text-primary border-primary bg-primary/5'
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          )}
        >
          <Calendar className="w-3 h-3" />
          Scadență
          {sortField === 'maturityDate' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
        </button>
      </div>

      {/* Mobile View - Virtualized List */}
      <div className="lg:hidden h-[600px] w-full">
        <Virtuoso
          style={{ height: '600px' }}
          data={filteredAndSortedSavings}
          itemContent={(index, s) => (
            <div className="pb-4">
              <MobileRow
                saving={s}
                index={index}
                style={{}}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                onDelete={onDelete}
                onEdit={onEdit}
                onViewDetails={onViewDetails}
              />
            </div>
          )}
          className="scrollbar-hide"
        />
      </div>

      {/* Desktop View - Virtualized Table */}
      <div className="hidden lg:block">
        <div className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-6 px-4">
          <div className="flex-[2]">Active / Instrument</div>
          <div className="flex-[1.5] px-4">Instituție / Locație</div>
          <div className="flex-[1.5] px-4">Sumă Deținută</div>
          <div className="flex-[1.2] px-4">Randament</div>
          <div className="flex-1 text-right">Acțiuni</div>
        </div>

        <div className="h-[600px] w-full">
          <Virtuoso
            style={{ height: '600px' }}
            data={filteredAndSortedSavings}
            itemContent={(index, s) => (
              <DesktopRow
                saving={s}
                index={index}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                onDelete={onDelete}
                onEdit={onEdit}
                onViewDetails={onViewDetails}
                style={{ height: '88px' }}
              />
            )}
            className="scrollbar-hide"
          />
        </div>
      </div>
    </div>
  );
};
