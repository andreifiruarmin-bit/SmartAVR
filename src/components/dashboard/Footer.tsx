import React from 'react';

interface FooterProps {
  onOpenLegal: (type: 'terms' | 'privacy' | 'gdpr') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-20 pb-12 border-t border-slate-200 dark:border-slate-800 pt-12 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 text-center">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
          <button 
            onClick={() => onOpenLegal('terms')}
            className="text-slate-400 hover:text-primary transition-all text-xs font-black uppercase tracking-widest cursor-pointer"
          >
            Termeni și Condiții
          </button>
          <button 
            onClick={() => onOpenLegal('privacy')}
            className="text-slate-400 hover:text-primary transition-all text-xs font-black uppercase tracking-widest cursor-pointer"
          >
            Confidențialitate
          </button>
          <button 
            onClick={() => onOpenLegal('gdpr')}
            className="text-slate-400 hover:text-primary transition-all text-xs font-black uppercase tracking-widest cursor-pointer"
          >
            GDPR
          </button>
        </div>
        
        <div className="space-y-2">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-50">
            © {new Date().getFullYear()} SmartAVR Financial Ecosystem
          </p>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest opacity-30">
            Toate drepturile rezervate. Investițiile implică riscuri.
          </p>
        </div>
      </div>
    </footer>
  );
};
