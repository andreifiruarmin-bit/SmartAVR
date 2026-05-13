import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { App } from '@capacitor/app';
import { Saving, SavingType, Currency } from '../../types';
import { PortfolioSummaryCard } from './cards/PortfolioSummaryCard';
import { CashReserveCard } from './cards/CashReserveCard';
import { BankDepositsCard } from './cards/BankDepositsCard';
import { GoldAssetsCard } from './cards/GoldAssetsCard';
import { EquitiesCard } from './cards/EquitiesCard';
import { PortfolioAnalysisCard } from './cards/PortfolioAnalysisCard';
import { Footer } from './Footer';
import { addMonths, format } from 'date-fns';

// Submenus
import { CashSubMenu } from './submenus/CashSubMenu';
import { DepositsSubMenu } from './submenus/DepositsSubMenu';
import { EquitiesSubMenu } from './submenus/EquitiesSubMenu';
import { GoldSubMenu } from './submenus/GoldSubMenu';
import { RentSubMenu } from './submenus/RentSubMenu';
import { EyeOff, TrendingUp } from 'lucide-react';
import { getAssetAttributes } from '../../lib/assetUtils';
import { convertToRON } from '../../lib/utils';

interface DashboardProps {
  isDark: boolean;
  savings: Saving[];
  totals: {
    totalInBase: number;
    byCurrency: Record<string, number>;
    byType: Record<string, number>;
    averageYield: number;
    averageDepositYield: number;
    totalDepositsBase: number;
  };
  rates: Record<string, number>;
  onSliceClick: (filter: { type?: SavingType; currency?: Currency }) => void;
  onEdit: (saving: Saving) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  cardVisibility: Record<string, boolean>;
  setCardVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onOpenLegal: (type: 'terms' | 'privacy' | 'gdpr') => void;
}

type SubView = 'main' | SavingType;

export const Dashboard: React.FC<DashboardProps> = ({ 
  isDark,
  savings, 
  totals, 
  rates, 
  onSliceClick,
  onEdit,
  onDelete,
  loading,
  cardVisibility,
  setCardVisibility,
  onOpenLegal
}) => {
  const [activeSubView, setActiveSubView] = useState<SubView>('main');
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartavr_display_currency');
      return (saved as Currency) || 'RON';
    }
    return 'RON';
  });

  React.useEffect(() => {
    localStorage.setItem('smartavr_display_currency', displayCurrency);
  }, [displayCurrency]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSubView]);

  React.useEffect(() => {
    const handler = App.addListener('backButton', () => {
      if (activeSubView !== 'main') {
        setActiveSubView('main');
      } else {
        App.exitApp();
      }
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, [activeSubView]);

  const [summaryFilter, setSummaryFilter] = useState<{ category: string; value: string } | null>(null);

  // Filter types user actually has
  const userSavingTypes = useMemo(() => {
    return Array.from(new Set(savings.map(s => s.type)));
  }, [savings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderSubView = () => {
    const commonProps = {
      savings,
      rates,
      onBack: () => setActiveSubView('main'),
      displayCurrency,
      onEdit,
      onDelete
    };

    switch (activeSubView) {
      case SavingType.CASH_RESERVE:
        return <CashSubMenu {...commonProps} />;
      case SavingType.DEPOSIT:
        return <DepositsSubMenu {...commonProps} />;
      case SavingType.STOCKS:
      case SavingType.ETF:
      case SavingType.BONDS:
        return <EquitiesSubMenu {...commonProps} />;
      case SavingType.GOLD:
        return <GoldSubMenu {...commonProps} />;
      case SavingType.RENT:
        return <RentSubMenu {...commonProps} />;
      default:
        return null;
    }
  };

  const handleHideCard = (id: string, name: string) => {
    if (confirm(`Sigur vrei să ascunzi cardul "${name}"? Îl poți readuce oricând din setările dashboard-ului.`)) {
      setCardVisibility(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {activeSubView === 'main' ? (
          <motion.div
            key="main-dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Top Stats Section */}
            <div className="relative group/card">
              <PortfolioSummaryCard 
                savings={savings}
                totals={totals}
                rates={rates}
                displayCurrency={displayCurrency}
                onCurrencyChange={setDisplayCurrency}
                actualCurrencies={Object.keys(totals.byCurrency) as Currency[]}
                onSliceClick={setSummaryFilter}
                onSliceDoubleClick={(filter) => {
                  if (typeof filter === 'string') {
                    // Legacy support or just type
                    setActiveSubView(filter as SavingType);
                  } else if (filter.type) {
                    setActiveSubView(filter.type);
                  } else if (filter.currency) {
                    onSliceClick(filter);
                  }
                }}
              />
            </div>

            {/* Active Filtering Results */}
            <AnimatePresence>
              {summaryFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-primary/20 p-8 shadow-xl overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Active: <span className="text-primary">{summaryFilter.value}</span>
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Filtrat după {summaryFilter.category === 'type' ? 'Categorie' : 
                                     summaryFilter.category === 'currency' ? 'Valută' : 
                                     summaryFilter.category === 'liquidity' ? 'Lichiditate' :
                                     summaryFilter.category === 'risk' ? 'Risc' : 'Orizont'}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSummaryFilter(null)}
                      className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all"
                    >
                      Resetează
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {savings
                      .filter(s => {
                        const attrs = getAssetAttributes(s.type);
                        switch (summaryFilter.category) {
                          case 'type': return s.type === summaryFilter.value;
                          case 'currency': return s.currency === (summaryFilter.value === 'AUR' ? 'XAU' : summaryFilter.value);
                          case 'liquidity': return attrs.liquidity === summaryFilter.value;
                          case 'risk': return attrs.risk === summaryFilter.value;
                          case 'horizon': return attrs.horizon === summaryFilter.value;
                          default: return false;
                        }
                      })
                      .map(s => (
                        <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                              <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-sm">{s.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase">{s.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900 dark:text-white text-sm">
                              {s.amount.toLocaleString()} {s.currency}
                            </p>
                            <p className="text-[9px] font-black text-primary uppercase">
                              ≈ {(convertToRON(s.amount, s.currency, rates) / (displayCurrency === 'RON' ? 1 : rates[displayCurrency])).toLocaleString()} {displayCurrency}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instruments Drilldown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSavingTypes.includes(SavingType.CASH_RESERVE) && cardVisibility.cash && (
                <div className="relative group/card">
                  <CashReserveCard 
                    savings={savings} 
                    rates={rates} 
                    displayCurrency={displayCurrency} 
                    onClick={() => setActiveSubView(SavingType.CASH_RESERVE)}
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleHideCard('cash', 'Rezervă Cash'); }}
                    className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-xl text-slate-400 opacity-0 group-hover/card:opacity-100 hover:text-red-500 transition-all z-20"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              )}
              {userSavingTypes.includes(SavingType.DEPOSIT) && cardVisibility.deposits && (
                <div className="relative group/card">
                  <BankDepositsCard 
                    savings={savings} 
                    rates={rates} 
                    displayCurrency={displayCurrency} 
                    averageYield={totals.averageDepositYield}
                    onClick={() => setActiveSubView(SavingType.DEPOSIT)}
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleHideCard('deposits', 'Depozite Bancare'); }}
                    className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-xl text-slate-400 opacity-0 group-hover/card:opacity-100 hover:text-red-500 transition-all z-20"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              )}
              {(userSavingTypes.includes(SavingType.STOCKS) || userSavingTypes.includes(SavingType.ETF) || userSavingTypes.includes(SavingType.BONDS)) && cardVisibility.equities && (
                <div className="relative group/card">
                  <EquitiesCard 
                    savings={savings} 
                    rates={rates} 
                    displayCurrency={displayCurrency} 
                    onClick={() => setActiveSubView(SavingType.STOCKS)} 
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleHideCard('equities', 'Bursă & Titluri'); }}
                    className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-xl text-slate-400 opacity-0 group-hover/card:opacity-100 hover:text-red-500 transition-all z-20"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              )}
              {userSavingTypes.includes(SavingType.GOLD) && cardVisibility.gold && (
                <div className="relative group/card">
                  <GoldAssetsCard 
                    savings={savings} 
                    rates={rates} 
                    displayCurrency={displayCurrency} 
                    onClick={() => setActiveSubView(SavingType.GOLD)}
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleHideCard('gold', 'Active Aur'); }}
                    className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-xl text-slate-400 opacity-0 group-hover/card:opacity-100 hover:text-red-500 transition-all z-20"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              )}
              {userSavingTypes.includes(SavingType.RENT) && cardVisibility.rent && (
                <div className="relative group/card">
                  <div 
                    onClick={() => setActiveSubView(SavingType.RENT)}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500 transition-all group flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Chirii / Imobiliare</p>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        {totals.byType[SavingType.RENT] ? 
                          `${(totals.byType[SavingType.RENT] / (displayCurrency === 'RON' ? 1 : rates[displayCurrency])).toLocaleString()} ${displayCurrency}`
                          : 'Vezi Detalii'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Venit Pasiv</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleHideCard('rent', 'Chirii / Imobiliare'); }}
                    className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl text-slate-400 dark:text-slate-500 opacity-0 group-hover/card:opacity-100 hover:text-red-500 transition-all z-20"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Section */}
            {cardVisibility.analysis !== false && (
              <div className="relative group/card">
                <PortfolioAnalysisCard 
                  isDark={isDark}
                  savings={savings}
                  rates={rates}
                  displayCurrency={displayCurrency}
                  onHide={() => handleHideCard('analysis', 'Analiză Portofoliu')}
                />
              </div>
            )}

            <Footer onOpenLegal={onOpenLegal} />
          </motion.div>
        ) : (
          <motion.div
            key="submenu-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {renderSubView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
