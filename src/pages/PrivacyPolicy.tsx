import React from 'react';

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header with Back Button */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                P
              </div>
              <h1 className="text-2xl font-black text-black tracking-tighter">
                Smart<span className="text-primary">AVR</span> - Politica de Confidențialitate
              </h1>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="font-semibold text-black transition-colors rounded-lg border border-gray-200"
            >
              ← Înapoi
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 pb-20">
        <div className="prose prose-gray max-w-none">
          <div className="space-y-8">
            {/* 1. Identitatea Operatorului de Date */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                1. Identitatea Operatorului de Date
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <strong className="text-black">Operator:</strong> SmartAVR Financial Ecosystem SRL, persoană juridică română, cod unic de înregistrare: J40/1234/2023
                </div>
                <div>
                  <strong className="text-black">Adresă:</strong> Strada Principală Nr. 15, Sector 1, București, România
                </div>
                <div>
                  <strong className="text-black">Email:</strong> contact@smartavr.ro
                </div>
                <div>
                  <strong className="text-black">Telefon:</strong> +40 722 123 456
                </div>
                <div>
                  <strong className="text-black">Website:</strong> https://smartavr.ro
                </div>
              </div>
            </section>

            {/* 2. Datele Colectate */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                2. Datele Colectate și Prelucrate
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-black text-black mb-3">2.1. Categorii de Date</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li><strong>Date Personale:</strong> Nume, prenume, email, telefon, dată nașterii, adresă (opțional)</li>
                    <li><strong>Date de Cont:</strong> IBAN, număr cont bancar, monedă preferată</li>
                    <li><strong>Date Financiare:</strong> Suma investită, tipuri de active, dobânzi, scadențe, randamente istorice</li>
                    <li><strong>Date Tehnice:</strong> IP address, browser, sistem de operare, device ID</li>
                    <li><strong>Date de Utilizare:</strong> Data/ora accesării, durată sesiunilor, funcționalități utilizate</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">2.2. Metode de Colectare</h3>
                  <p>Datele sunt colectate direct de la utilizator prin formularul de înregistrare și în timpul utilizării serviciilor. Nu colectăm date de la terțe părți.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">2.3. Baza Legală</h3>
                  <p>Colectarea și prelucrarea datelor se realizează în baza consimțământului liber și informat al utilizatorului, conform prevederilor art. 6 alin. (1) lit. b) din Regulamentul UE 2016/679 (GDPR).</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">2.4. Perioada de Păstrare</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li>Datele de cont sunt păstrate pe durata existenței contului</li>
                    <li>Datele financiare sunt păstrate pe termen nelimitat</li>
                    <li>Datele de utilizare (log-uri, statistici) sunt păstrate 24 luni</li>
                    <li>Datele personale sunt șterse automat după 5 ani de inactivitate</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Scopul și Temeiul Legal */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                3. Scopul și Temeiul Legal al Prelucrării
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-black text-black mb-3">3.1. Scopul Principal</h3>
                  <p>SmartAVR colectează și prelucrează datele dumneavoastră exclusiv pentru scopurile următoare:</p>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li>Furnizarea serviciilor de gestionare a portofoliului financiar</li>
                    <li>Calcularea randamentelor și analiză financiară</li>
                    <li>Generarea de rapoarte și export de date</li>
                    <li>Comunicare cu utilizatorii despre servicii și actualizări</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">3.2. Temeiul Legal</h3>
                  <p>Conform art. 6(1)(a) GDPR, prelucrarea datelor este necesară pentru:</p>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li><strong>Executarea Contractului:</strong> Furnizarea serviciilor conform termenilor și condițiilor</li>
                    <li><strong>Interes Legitim:</strong> Analize financiare și optimizarea portofoliului</li>
                    <li><strong>Respectarea Legislației:</strong> Conformitate cu legile române și europene aplicabile</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">3.3. Consimțământul Utilizatorului</h3>
                  <p>Utilizatorii își exprimă consimțământul liber și informat prin crearea și utilizarea contului SmartAVR. Consimțământul poate fi retras oricând prin ștergerea contului.</p>
                </div>
              </div>
            </section>

            {/* 4. Destinatarii Datelor */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                4. Destinatarii Datelor
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-black text-black mb-3">4.1. Categorii de Destinatari</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li><strong>Furnizori de Servicii:</strong> Supabase (Suedia) - stocare bază de date și autentificare</li>
                    <li><strong>Procesatori de Date:</strong> Netlify (SUA) - serverless functions și CDN global</li>
                    <li><strong>Procesatori AI:</strong> Google (SUA) - servicii Gemini AI pentru analize financiare</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">4.2. Transferuri Internaționale</h3>
                  <p>Datele cu caracter personal pot fi transferate internațional în cadrul Uniunii Europene. Toate transferurile se realizează în conformitate cu GDPR și cu măsurile tehnice și organizatorice adecvate de securitate.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">4.3. Măsuri de Securitate</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li><strong>Criptare:</strong> Toate datele sensibile sunt criptate în tranzit și în repaus</li>
                    <li><strong>Controlul Accesului:</strong> Autentificare cu doi factori și control granular al permisiunilor</li>
                    <li><strong>Securitatea Infrastructurii:</strong> Servere securizate, conexiuni HTTPS/TLS 1.3, backup-uri zilnice</li>
                    <li><strong>Audit-uri Regulate:</strong> Audit-uri de securitate efectuate de către terți specializați</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Drepturile Utilizatorului */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                5. Drepturile Utilizatorului
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-black text-black mb-3">5.1. Dreptul de Acces</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li>Acces la toate datele personale stocate despre dumneavoastră</li>
                    <li>Dreptul de a solicita rectificarea sau ștergerea datelor</li>
                    <li>Dreptul de a restricționa procesarea datelor</li>
                    <li>Dreptul de a porta datele către un alt operator</li>
                    <li>Dreptul de a fi informat despre încălcările de securitate</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">5.2. Dreptul de Rectificare</h3>
                  <p>Conform art. 17 din GDPR, aveți dreptul de a obține de la noi rectificarea datelor personale incorecte, fără întârzieri nejustificate.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">5.3. Dreptul de a Fi Uitat</h3>
                  <p>Aveți dreptul de a fi "uitat" - adică de a obține ștergerea datelor personale care nu mai sunt necesare pentru scopurile pentru care au fost colectate.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">5.4. Dreptul de Opunere</h3>
                  <p>Puteți vă opune prelucrării datelor dumneavoastră în scopuri de marketing, fără a afecta calitatea serviciilor furnizate.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">5.5. Dreptul de a Depune Plângere</h3>
                  <p>Aveți dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) dacă considerați că drepturile dumneavoastră au fost încălcate.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">5.6.Restrictionări Procesare Automată</h3>
                  <p>Deciziile bazate exclusiv pe prelucrarea automată a datelor, inclusiv profilare, pot fi contestate.</p>
                </div>
              </div>
            </section>

            {/* 6. Cookies și Tehnologii Similare */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                6. Cookies și Tehnologii Similare
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-black text-black mb-3">6.1. Cookies</h3>
                  <p>Platforma utilizează cookie-uri esențiale pentru funcționalități de bază (autentificare, sesiune, preferințe). Cookie-urile sunt stocate local în browser și sunt securizate.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">6.2. Tehnologii de Tracking</h3>
                  <p>Utilizăm Google Analytics pentru statistici de utilizare anonimizate. Puteți dezactiva tracking-ul din setările browser-ului.</p>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">6.3. LocalStorage</h3>
                  <p>Stocăm preferințele de temă și setări de configurare local pentru o experiență personalizată.</p>
                </div>
              </div>
            </section>

            {/* 7. Securitatea Datelor */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                7. Securitatea Datelor
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-lg font-black text-black mb-3">7.1. Măsuri Tehnice și Organizatorice</h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li><strong>Autentificare:</strong> JWT tokens cu expirare automată</li>
                    <li><strong>Criptare:</strong> AES-256 pentru date sensibile</li>
                    <li><strong>Conexiuni Securizate:</strong> HTTPS/TLS 1.3 pentru toate transferurile</li>
                    <li><strong>Controlul Accesului:</strong> Row Level Security (RLS) în Supabase</li>
                    <li><strong>Monitorizare:</strong> Audit-uri regulate și monitorizare 24/7</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">7.2. Incidente de Securitate</h3>
                  <p>În caz de incidente de securitate, utilizatorii afectați vor fi notificați în maxim 72 ore. Vom investiga și rezolva incidentele conform legislației aplicabile.</p>
                </div>
              </div>
            </section>

            {/* 8. Modificări ale Politicii */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-black text-black mb-6 pb-2 border-b border-gray-200">
                8. Modificări ale Politicii de Confidențialitate
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <p>
                  Ne rezervăm dreptul de a modifica această politică de confidențialitate în orice moment. Orice modificare va intra în vigoare de la data publicării și se va aplica automat tuturor utilizatorilor.
                </p>
                <p>
                  Utilizatorii vor fi notificați prin email despre orice modificare semnificativă cu cel puțin 30 zile înainte de data aplicării.
                </p>
                <p>
                  Cea mai recentă versiune a acestei politici este întotdeauna disponibilă la adresa: https://smartavr.ro/privacy
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
