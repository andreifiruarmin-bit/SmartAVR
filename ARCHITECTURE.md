# Documentație Arhitectură - SmartAVR

SmartAVR este o platformă avansată de gestionare a activelor și optimizare a economiilor, concepută pentru a oferi utilizatorilor o imagine clară și consolidată asupra portofoliului lor financiar, integrând inteligența artificială pentru analize predictive și recomandări personalizate.

---

## 1. Descrierea Aplicației
**SmartAVR** se adresează persoanelor care doresc să își urmărească economiile dispersate în diverse forme (depozite, acțiuni, cash, aur) într-un singur loc.
- **Scop:** Centralizarea activelor și vizualizarea randamentului real (net) după inflație și taxe.
- **Public țintă:** Investitori individuali, persoane care economisesc activ, utilizatori care doresc optimizarea portofoliului prin AI.
- **Model de business:** Freemium. Utilizatorii de bază primesc funcționalități esențiale de tracking, în timp ce abonamentele (Pro/Business) deblochează analize AI profunde, istoric nelimitat și sincronizare automată.

---

## 2. Stack Tehnic Complet
| Tehnologie | Versiune | Rol |
| :--- | :--- | :--- |
| **React** | 19.x | Framework Frontend (Functional Components, Hooks) |
| **TypeScript** | 5.8.x | Limbaj de programare (Type Safety) |
| **Vite** | 6.x | Build Tool și Development Server |
| **Tailwind CSS** | 4.x | Styling utilitar (interfață modernă, responsive) |
| **useDarkMode hook** | custom | Persistență temă în localStorage |
| **Recharts** | 3.8.x | Vizualizare date (grafice interactive) |
| **Motion** | 12.x | Animații și tranziții fluide (fostul Framer Motion) |
| **Lucide React** | 0.5xx | Iconografie |
| **Supabase** | 2.1xx | Backend-as-a-Service (Auth, DB, RLS) |
| **Netlify Functions** | 5.x | Serverless Functions pentru API-uri critice și AI Proxy |
| **Gemini AI** | 1.5/2.0 | Inteligență Artificială pentru analize financiare |
| **Date-fns** | 4.x | Manipulare date calendaristice |

---

## 3. Structura Fișierelor
```text
/
├── .env.example              # Template variabile de mediu
├── .gitignore                # Fișiere excluse din Git
├── ARCHITECTURE.md           # [ACEST FIȘIER] Documentația tehnică
├── index.html                # Punctul de intrare HTML
├── metadata.json             # Configurație metadate applet AIS
├── netlify.toml              # Configurație deploy și redirect-uri Netlify
├── package.json              # Gestiune dependențe și scripturi npm
├── tsconfig.json             # Configurație TypeScript
├── vite.config.ts            # Configurație Vite și plugin-uri
│
├── netlify/
│   └── functions/
│       ├── deposit-summary.ts # Calcul sumatizat dobânzi (Serverless)
│       ├── exchange-rates.ts  # Fetch și cache cursuri valutare
│       └── gemini-chat.ts     # Proxy pentru interacțiunea cu Gemini AI
│
├── public/                    # Asset-uri statice (logo, favicon)
│
├── src/
│   ├── hooks/               # Custom React Hooks
│   │   └── useDarkMode.ts   # Hook pentru dark mode cu localStorage persistență
│   ├── main.tsx              # Entry point React
│   ├── App.tsx               # Componenta Root, inițializare Auth și State
│   ├── constants.ts          # Constante globale (monede, opțiuni default)
│   ├── index.css             # Stiluri globale și Tailwind imports
│   ├── types.ts              # Definiții interfețe și enum-uri TypeScript
│   │
│   ├── components/           # Componente React Reutilizabile
│   │   ├── AIAssistant.tsx   # Chatbot-ul inteligent (Gemini AI)
│   │   ├── AddSavingModal.tsx # Dialog pentru adăugarea activelor
│   │   ├── Auth.tsx          # Formulare Login/Signup Supabase
│   │   ├── dashboard/         # Dashboard modularizat (orchestrator + carduri dedicate)
│   │   │   ├── index.ts          # Barrel export pentru Dashboard
│   │   │   ├── Dashboard.tsx      # Orchestrator slim (~150 linii)
│   │   │   ├── DashboardHeader.tsx        # Header cu titlu, dark mode, filtre
│   │   │   ├── DashboardConfig.tsx        # Panoul de configurare (AnimatePresence modal)
│   │   │   ├── types.ts          # DashboardProps, CardSettings, GoldData, variante animație
│   │   │   ├── hooks/           # Hook-uri custom pentru logică Dashboard
│   │   │   │   ├── useDashboardConfig.ts  # cardSettings + localStorage persistence
│   │   │   ├── useDashboardData.ts    # toate calculele useMemo
│   │   │   └── usePieInteraction.ts   # logica click/double-click pie
│   │   └── cards/           # Carduri dedicate pentru fiecare instrument
│   │       ├── PortfolioSummaryCard.tsx   # Sold total + 2x PieChart
│   │       ├── CashReserveCard.tsx        # Rezervă cash
│   │       ├── BankDepositsCard.tsx       # Depozite bancare
│   │       ├── GoldAssetsCard.tsx         # Aur + grafic volatilitate
│   │       ├── EquitiesCard.tsx           # Acțiuni & ETF
│   │       └── PortfolioEvolutionCard.tsx # AreaChart evoluție istorică
│   │   ├── DarkModeToggle.tsx # Hook pentru dark mode cu localStorage persistență
│   │   ├── ErrorBoundary.tsx # Catch-all pentru crash-uri UI
│   │   ├── Navigation.tsx    # Bara de navigare (Desktop/Mobile)
│   │   ├── SavingForm.tsx    # Formularul dinamic pentru active noi
│   │   └── SavingsList.tsx   # Lista detaliată de active cu filtre și sortare
│   │
│   └── lib/
│       ├── supabase.ts       # Configurație client Supabase
│       └── utils.ts          # Helperi styling (cn) și formatare date
```

---

## 4. Schema Bazei de Date (Supabase / PostgreSQL)

### 1. `savings_products` (Activele utilizatorului)
| Câmp | Tip | Descriere |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificator unic |
| `user_id` | uuid (FK) | Legătura cu auth.users |
| `type` | text | Tip (Depozit Bancar, Rezervă Cash, Acțiuni, ETF, Aur, Titluri de Stat, Chirii) |
| `name` | text | Numele activului |
| `amount` | numeric | Suma investită |
| `currency` | text | RON, EUR, USD, etc. |
| `interest_rate` | numeric | Dobânda anuală (Depozit / Titluri Stat) |
| `maturity_date` | date | Data scadenței |
| `capitalized` | boolean | Dacă dobânda se adaugă la principal |
| `bank` | text | Numele băncii / brokerului |
| `details` | jsonb | Informații specifice (simbol, nr. acțiuni, greutate, etc.) |
| `created_at` | timestamp | Data adăugării |
| `updated_at` | timestamp | Data ultimei modificări |
- **RLS:** `(role = 'authenticated')` -> utilizatorul poate accesa doar rândurile unde `user_id = auth.uid()`.

### 2. `user_profiles` (Extensie cont user)
| Câmp | Tip | Descriere |
| :--- | :--- | :--- |
| `id` | uuid (PK)| corelat cu auth.users.id |
| `full_name` | text | Nume complet |
| `avatar_url` | text | URL poză profil |
| `plan` | text | 'free', 'pro', 'business' |
| `default_currency`| text | Moneda de bază pentru dashboard (implicit RON) |

### 3. `subscriptions` (Gestiune plată)
| Câmp | Tip | Descriere |
| :--- | :--- | :--- |
| `id` | uuid (PK) | - |
| `user_id` | uuid (FK) | - |
| `plan` | text | Tipul de abonament curent |
| `status` | text | active, cancelled, expired |
| `expires_at` | timestamp | Data expirării beneficiilor |
| `external_id` | text | ID tranzacție (Stripe/PayPal) |

### 4. `exchange_rates_cache` (Optimizare API)
| Câmp | Tip | Descriere |
| :--- | :--- | :--- |
| `base_currency` | text | RON |
| `target_currency` | text | Moneda de destinație |
| `rate` | numeric | Valoarea cursului |
| `fetched_at` | timestamp | Timestamp pentru validare TTL |

---

## 5. Fluxul de Autentificare
1. **Signup:** Userul introduce email/parola -> Supabase creează intrarea în `auth.users` -> Trigger Supabase creează automat rând în `user_profiles`.
2. **Login:** Supabase validează credențialele -> Returnează JWT -> Clientul stochează sesiunea în LocalStorage (via `supabase-js`).
3. **Persistență:** `App.tsx` folosește `supabase.auth.onAuthStateChange` pentru a menține userul logat la refresh.
4. **Logout:** Se apelează `supabase.auth.signOut()`, se golește starea locală și se redirecționează către ecranul de Auth.

---

## 6. Fluxul de Date
1. **Interacțiune UI:** Userul adaugă un activ în `AddSavingModal`.
2. **Validare:** `SavingForm` validează datele local.
3. **Stocare:** Se apelează serviciul Supabase (`savings_products.insert`).
4. **Notificare:** Supabase confirmă succesul (sau emite eroare RLS dacă e cazul).
5. **Update UI:** `App.tsx` ascultă modificările sau re-face fetch la date pentru a actualiza Dashboard-ul și Graficele.
6. **AI Analysis:** La cerere, datele sunt trimise anonimizat către Netlify Function `gemini-chat` pentru proiecții.

---

## 7. Componentele Principale

### Dashboard (Modularizat)
- **Arhitectură:** Componentă orchestrator slim (~150 linii) care orchestrează carduri dedicate și hook-uri specializate
- **Structură modulară:**
  - `Dashboard.tsx` - Orchestrator principal care importează și coordonează toate componentele
  - `DashboardHeader.tsx` - Header cu titlu, dark mode toggle și buton de configurare
  - `DashboardConfig.tsx` - Panou configurare carduri cu AnimatePresence modal
  - `hooks/useDashboardConfig.ts` - Management stări carduri + localStorage persistence
  - `hooks/useDashboardData.ts` - Toate calculele useMemo (goldData, filteredTotals, portfolioHistory, etc.)
  - `hooks/usePieInteraction.ts` - Logica click/double-click pentru PieChart cu debounce
  - `cards/PortfolioSummaryCard.tsx` - Sold total + 2x PieChart (categorii + monede)
  - `cards/CashReserveCard.tsx` - Card dedicat pentru rezervă cash
  - `cards/BankDepositsCard.tsx` - Card dedicat pentru depozite bancare cu randament mediu
  - `cards/GoldAssetsCard.tsx` - Card dedicat pentru aur cu grafic volatilitate LineChart
  - `cards/EquitiesCard.tsx` - Card dedicat pentru acțiuni & ETF cu performanțe simboluri
  - `cards/PortfolioEvolutionCard.tsx` - Card dedicat pentru evoluție istorică cu AreaChart
  - `types.ts` - Tipuri și constante partajate (DashboardProps, CardSettings, GoldData, variante animație)
  - `index.ts` - Barrel export pentru importuri curate
- **Principii modularizare:**
  - Fiecare instrument de investiție are cardul său dedicat în `src/components/dashboard/cards/`
  - Logica specifică este izolată în hook-uri custom reutilizabile
  - Zero schimbări de funcționalitate - doar reorganizare cod
  - Fiecare fișier nou compilează independent fără erori TypeScript
- **Interactivitate Pie Chart:** 
  - Click behavior cu debounce (300ms) pentru a distinge single vs double click
  - Primul click: Afișează detalii mobile-friendly pentru secțiunea activă
  - Al doilea click: Navighează/filtrează SavingsList după tipul/moneda respectivă
  - State management: `activeSliceIndex` și `clickCount` cu timer pentru debounce
- **Animații Carduri:** 
  - Toate cardurile folosesc `motion.div` cu hover animations
  - Scale effect: `scale: 1.02` la hover
  - Box shadow adaptiv: Light mode `'0 8px 30px rgba(0,0,0,0.12)'`, Dark mode `'0 8px 30px rgba(0,0,0,0.4)'`
  - Spring transition: `{ type: 'spring', stiffness: 300, damping: 20 }`
- **Banner Cursuri Neactualizate:**
  - Afișează banner de alertă când `rates.lastUpdated` este mai vechi de 24 ore
  - Iconiță `AlertTriangle` din Lucide React
  - Mesaj cu data ultimei actualizări formatată
- **Return:** UI-ul principal orchestrat ca sumă de componente modulare, independente și reutilizabile.
- **Extensibilitate:** Adăugarea unui nou instrument înseamnă crearea unui card nou în folderul `cards/` și înregistrarea lui în orchestrator.

### AIAssistant.tsx
- **State:** `messages`, `isOpen`.
- **Funcție:** Interfață de chat care comunică cu Gemini. Trimite contextul portofoliului (anonim) pentru a primi sfaturi.
- **Return:** Chat bubble flotant și fereastră de dialog.

### SavingsList.tsx
- **Props:** `savings`, `onDelete`, `onUpdate`.
- **Funcție:** Filtrare (după tip, bancă, sumă) și sortare. Afișează cardurile detaliate pentru fiecare activ.

---

## 8. Funcționalități Free vs Paid

| Feature | Plan FREE | Plan PRO |
| :--- | :--- | :--- |
| **Nr. Active** | Maxim 10 active | Nelimitat |
| **Monede** | RON, EUR, USD | Toate monedele + XAU (Aur) |
| **AI Assistant** | Răspunsuri de bază | Analiză profundă de portofoliu |
| **Grafice** | Evoluție 30 zile | Evoluție istorică completă |
| **Export** | Niciunul | CSV / PDF Report |
| **Alertă Scadență** | Email basics | Push Notifications + Calendar Sync |

---

## 9. Integrare Gemini AI
- **Model:** `gemini-3-flash-preview` (viteză și cost eficient).
- **Endpoint:** `/.netlify/functions/gemini-chat`.
- **Utilizare:** 
  1. Suport live pentru utilizatori ("Cum îmi calculez randamentul?").
  2. Analiză proactivă: "Văd că ai 80% din active în RON, poate ar fi bine să diversifici în EUR".
  3. Proiecții: Estimarea valorii portofoliului peste 5 ani bazată pe istoricul dobânzilor.

---

## 10. Variabile de Mediu (.env)
- `VITE_SUPABASE_URL`: URL-ul proiectului Supabase.
- `VITE_SUPABASE_ANON_KEY`: Cheia publică pentru client.
- `GEMINI_API_KEY`: Cheie API Google (stocată securizat pe Netlify, neaccesibilă în browser).
- `VITE_CURRENCY_API_KEY`: (Optional) Cheie pentru refresh rate-uri valutare live.
- `GOLD_API_KEY`: Cheie API pentru prețul aurului (stocată securizat pe Netlify).
- `BVB_API_KEY`: Cheie API pentru BVB (stocată securizat pe Netlify).

---

## 11. TODO / Roadmap
1. [x] Implementare Dark Mode complet.
2. [ ] Sistem de notificări pentru scadențe depozite (Service Workers).
3. [ ] Integrare cu API-uri bancare prin Open Banking (Specter/SaltEdge) - Pro Feature.
4. [ ] Modul dedicat pentru Imobiliare (Chirii, Taxe, Randament net).
5. [ ] Gamificare: "Saving Badges" pentru atingerea obiectivelor financiare.
