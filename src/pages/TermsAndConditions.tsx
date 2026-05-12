import React from 'react';

export default function TermsAndConditions() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header with Back Button */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                S
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                Smart<span className="text-primary">AVR</span> - Termeni și Condiții
              </h1>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 text-slate-600 hover:text-primary transition-colors rounded-lg border border-slate-200"
            >
              ← Înapoi
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 pb-20">
        <div className="prose prose-slate max-w-none">
          <div className="space-y-8">
            {/* 1. Definiții */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                1. Definiții
              </h2>
              
              <div className="space-y-4 text-slate-700">
                <div>
                  <strong className="text-slate-900">Utilizator:</strong> Persoană fizică sau juridică care utilizează platforma SmartAVR.
                </div>
                <div>
                  <strong className="text-slate-900">Serviciu:</strong> Platformă software-as-a-service (SaaS) furnizată de SmartAVR Financial Ecosystem SRL pentru gestionarea activelor financiare.
                </div>
                <div>
                  <strong className="text-slate-900">Abonament:</strong> Contractul de utilizare a serviciilor SmartAVR pe bază de abonament lunar sau anual.
                </div>
                <div>
                  <strong className="text-slate-900">Date Personale:</strong> Informații furnizate voluntar de utilizator pentru crearea și gestionarea contului.
                </div>
              </div>
            </section>

            {/* 2. Acceptarea Termenilor */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                2. Acceptarea Termenilor
              </h2>
              
              <div className="space-y-4 text-slate-700">
                <p>
                  Prin crearea și utilizarea contului SmartAVR, utilizatorul declară că a citit, înțeles și este de acord cu următorii termeni și condiții de utilizare a serviciilor furnizate.
                </p>
                <p>
                  Acești termeni constituie un contract legal obligatoriu între utilizator și SmartAVR Financial Ecosystem SRL.
                </p>
              </div>
            </section>

            {/* 3. Descrierea Serviciului */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                3. Descrierea Serviciului SmartAVR
              </h2>
              
              <div className="space-y-6 text-slate-700">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">3.1. Funcționalități Principale</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li>Centralizarea portofoliului de active (depozite bancare, acțiuni, ETF-uri, aur, cash, titluri de stat, chirii)</li>
                    <li>Calculul randamentului real net după inflație și taxe</li>
                    <li>Monitorizarea evoluției istorice a activelor</li>
                    <li>Analize financiare predictive prin inteligență artificială (Gemini AI)</li>
                    <li>Export de date în format CSV</li>
                    <li>Notificări automate pentru scadențe și evenimente importante</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">3.2. Planuri de Abonament</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-slate-900 mb-1">Plan Free</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Maxim 10 active în portofoliu</li>
                        <li>Monede: RON, EUR, USD</li>
                        <li>Asistență AI de bază</li>
                        <li>Grafice evoluție 30 zile</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-1">Plan Pro</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Active nelimitate în portofoliu</li>
                        <li>Toate monedele suportate + XAU (Aur)</li>
                        <li>Analize AI avansate</li>
                        <li>Grafice evoluție istorică completă</li>
                        <li>Export CSV/PDF</li>
                        <li>Notificări push + calendar sync</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-indigo-600 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-1">Plan Business</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Toate funcționalitățile Plan Pro</li>
                        <li>Integrare API bancare (Open Banking)</li>
                        <li>Proiecții personalizate avansate</li>
                        <li>Support dedicat 24/7</li>
                        <li>Audit financiar anual</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Conturi de Utilizator și Securitate */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                4. Conturi de Utilizator și Securitate
              </h2>
              
              <div className="space-y-6 text-slate-700">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">4.1. Crearea Contului</h3>
                  <p>Utilizatorii își pot crea cont gratuit prin email și parolă. Datele personale sunt stocate în conformitate cu politica de confidențialitate.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">4.2. Securitatea Datelor</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li>Autentificare securizată prin JWT tokens</li>
                    <li>Conexiune criptată HTTPS/TLS 1.3</li>
                    <li>Parole stocate în format hash (bcrypt)</li>
                    <li>Autentificare cu doi factori (email + parolă)</li>
                    <li>Sesiune persistentă cu logout automat după 30 zile inactivitate</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">4.3. Responsabilitatea Utilizatorului</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li>Mentținerea confidențialității datelor de acces</li>
                    <li>Utilizarea serviciilor în conformitate cu legile aplicabile</li>
                    <li>Raportarea imediată a încălcărilor de securitate</li>
                    <li>Neaccesarea neautorizată a conturilor altor utilizatori</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Abonamente și Plăți */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                5. Abonamente și Plăți
              </h2>
              
              <div className="space-y-6 text-slate-700">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">5.1. Modalități de Plată</h3>
                  <p>Plățile se pot efectua prin card bancar, transfer bancar sau portofele electronice autorizate în România.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">5.2. Politica de Rambursare</h3>
                  <p>Conform legislației române, utilizatorii au dreptul la rambursare integrală în 14 zile calendaristice de la data solicitării, fără obligația de a motiva decizia.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">5.3. Modificarea și Rezilierea Abonamentului</h3>
                  <p>Utilizatorii pot modifica sau rezilia abonamentul oricând din setările contului. Rezilierea devine efectivă la sfârșitul perioadei facturate, fără penalități.</p>
                </div>
              </div>
            </section>

            {/* 6. Limitarea Răspunderii */}
            <section className="bg-amber-50 rounded-2xl p-8 shadow-sm border border-amber-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-amber-200">
                6. Limitarea Răspunderii
              </h2>
              
              <div className="space-y-4 text-amber-800">
                <p>
                  <strong className="text-amber-900">Atenție:</strong> Informațiile și analizele furnizate de SmartAVR nu constituie consiliere financiară, investiții sau recomandări personalizate.
                </p>
                <p>
                  Platforma oferă doar informații generale și instrumente de analiză. Deciziile financiare rămân la discreția și responsabilitatea exclusivă a utilizatorului.
                </p>
                <p>
                  SmartAVR nu este responsabilă pentru pierderile financiare rezultate din utilizarea informațiilor furnizate.
                </p>
              </div>
            </section>

            {/* 7. Proprietate Intelectuală */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                7. Proprietate Intelectuală
              </h2>
              
              <div className="space-y-4 text-slate-700">
                <p>
                  Platforma SmartAVR, inclusiv logo-ul, interfața, textele, graficele și funcționalitățile acesteia, este proprietate intelectuală protejată prin legea drepturilor de autor și legislația română aplicabilă.
                </p>
                <p>
                  Toate drepturile asupra platformei sunt rezervate SmartAVR Financial Ecosystem SRL.
                </p>
                <p>
                  Este interzisă utilizarea, copierea, modificarea sau distribuirea neautorizată a oricărei părți din platformă.
                </p>
              </div>
            </section>

            {/* 8. Modificarea Termenilor */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                8. Modificarea Termenilor
              </h2>
              
              <div className="space-y-4 text-slate-700">
                <p>
                  SmartAVR își rezervă dreptul de a modifica acești termeni și condiții în orice moment.
                </p>
                <p>
                  Modificările vor intra în vigoare de la data publicării pe platformă și se vor aplica automat tuturor utilizatorilor.
                </p>
                <p>
                  Utilizatorii sunt sfătuiți să consulte periodic această pagină pentru a fi la curent cu ultimele modificări.
                </p>
              </div>
            </section>

            {/* 9. Legea Aplicabilă */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                9. Legea Aplicabilă
              </h2>
              
              <div className="space-y-4 text-slate-700">
                <p>
                  Prezentul document este guvernat de legislația română în vigoare la data {currentYear}.
                </p>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Referințe Legale Principale:</h4>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li><strong>GDPR (Regulamentul UE 2016/679):</strong> Protecția datelor personale la nivel european</li>
                    <li><strong>O.G. nr. 129/2018:</strong> Protecția consumatorilor în domeniul serviciilor financiare</li>
                    <li><strong>Legea nr. 365/2002:</strong> Comerțul electronic</li>
                    <li><strong>O.U.G. nr. 21/2018:</strong> Combaterea spălării de fonduri</li>
                  </ul>
                </div>
                <p>
                  Orice litigii vor fi soluționate pe calea amiabilă, iar în caz de neînțelegeri, instanța competentă va fi instanța de judecată din București.
                </p>
              </div>
            </section>

            {/* 10. Contact */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-200">
                10. Contact și Suport
              </h2>
              
              <div className="space-y-6 text-slate-700">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">10.1. Date de Contact</h3>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> contact@smartavr.ro</p>
                    <p><strong>Adresă:</strong> Strada Principală Nr. 15, Sector 1, București, România</p>
                    <p><strong>Telefon:</strong> +40 722 123 456 (Luni - Vineri, 9:00 - 17:00)</p>
                    <p><strong>Program:</strong> Luni - Vineri: 9:00 - 17:00</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">10.2. Serviciu Clienți</h3>
                  <p>Suport tehnic disponibil prin email și telefon pentru întrebări legate de utilizarea platformei.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">10.3. Reclamații</h3>
                  <p>Pentru orice reclamații sau sesizări legate de protecția datelor, vă rugăm să contactați Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP):</p>
                  <p><strong>Adresă:</strong> B-dul General Magheru Aurel Vlaicu nr. 25, Sector 1, București, România</p>
                  <p><strong>Email:</strong> anspdc@anspdc.ro</p>
                  <p><strong>Telefon:</strong> +40 318 917 200</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
