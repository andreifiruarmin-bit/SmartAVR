import React from 'react';

interface FooterProps {
  setCurrentPage: (page: 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            <p>&copy; {currentYear} SmartAVR Financial Ecosystem SRL. Toate drepturile rezervate.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <button 
              onClick={() => setCurrentPage('terms')}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Termeni și Condiții
            </button>
            <span className="text-slate-400">•</span>
            <button 
              onClick={() => setCurrentPage('privacy')}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Politica de Confidențialitate
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
