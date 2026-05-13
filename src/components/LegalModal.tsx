import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | 'gdpr';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const content = {
    terms: {
      title: 'Termeni și Condiții',
      body: `
        1. Acceptarea Termenilor
        Prin utilizarea SmartAVR, sunteți de acord să respectați acești termeni. Aplicația este destinată exclusiv monitorizării financiare personale.

        2. Responsabilitatea Utilizatorului
        Utilizatorul este singurul responsabil pentru datele introduse. SmartAVR nu oferă consultanță financiară profesionistă. Deciziile de investiții vă aparțin în totalitate.

        3. Limitarea Răspunderii
        SmartAVR nu este răspunzătoare pentru nicio pierdere financiară rezultată din utilizarea aplicației sau din erori ale ratelor de schimb furnizate de terți.

        4. Modificări ale Aplicației
        Ne rezervăm dreptul de a modifica sau întrerupe serviciul în orice moment, cu sau fără preaviz.
      `
    },
    privacy: {
      title: 'Confidențialitate',
      body: `
        1. Colectarea Datelor
        Colectăm date despre activele dumneavoastră financiare pentru a vă oferi o imagine de ansamblu asupra portofoliului. Aceste date sunt stocate securizat în infrastructura Supabase.

        2. Utilizarea Datelor
        Datele dumneavoastră nu sunt vândute sau partajate cu terțe părți în scopuri de marketing. Ele sunt utilizate strict pentru funcționalitatea aplicației SmartAVR.

        3. Securitatea
        Implementăm măsuri de securitate standard pentru a proteja informațiile dumneavoastră împotriva accesului neautorizat.

        4. Contact
        Pentru întrebări despre confidențialitate, ne puteți contacta prin intermediul platformei.
      `
    },
    gdpr: {
      title: 'GDPR - Protecția Datelor',
      body: `
        Conform Regulamentului General privind Protecția Datelor (GDPR), aveți următoarele drepturi:

        1. Dreptul de acces: Puteți solicita o copie a datelor dumneavoastră personale stocate în aplicație.
        2. Dreptul la rectificare: Puteți corecta datele inexacte direct din interfață.
        3. Dreptul la ștergere: Aveți "dreptul de a fi uitat" - puteți să vă ștergeți contul și toate datele asociate în orice moment.
        4. Dreptul la portabilitatea datelor: Datele introduse pot fi exportate (în viitoare versiuni).
        5. Consimțământ: Prin crearea unui cont, vă oferiți consimțământul explicit pentru prelucrarea datelor financiare în scopul afișării lor în dashboard.
      `
    }
  };

  const activeContent = content[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{activeContent.title}</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-10 overflow-y-auto whitespace-pre-line text-slate-600 font-medium leading-relaxed">
              {activeContent.body}
            </div>
            <div className="p-8 bg-slate-50 text-center">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all shadow-xl"
              >
                Am înțeles
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
