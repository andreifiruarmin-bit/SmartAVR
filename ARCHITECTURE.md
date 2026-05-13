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
│   │       ├── PortfolioSummaryCard.tsx   # Sold total + currency switcher + 5x PieChart selector
│   │       ├── CashReserveCard.tsx        # Rezervă cash
│   │       ├── BankDepositsCard.tsx       # Depozite bancare
│   │       ├── GoldAssetsCard.tsx         # Aur + grafic volatilitate
│   │       ├── EquitiesCard.tsx           # Acțiuni & ETF
│   │       ├── PortfolioEvolutionCard.tsx # AreaChart evoluție istorică
│   │       └── CollapsibleCard.tsx        # Wrapper pentru carduri colapsabile
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

### Navigation.tsx
- **Funcție:** Bară de navigare plutitoare (Desktop: bottom-center, Mobile: full-width bottom)
- **Structură:** Doar două tab-uri principale: "Dashboard" și "Active"
- **Links eliminați:** "Termeni" și "Confidențialitate" au fost eliminați din navigare și acum sunt accesibile doar din Footer-ul dashboard-ului
- **Mobile-First:** Design responsive cu touch targets de 40×40px minimum și animații fluide
- **Floating Action Button:** Buton "Plus" central pe mobil pentru adăugare rapidă de active

### Dashboard (Modularizat - Mobile-First)
- **Arhitectură:** Componentă orchestrator slim (~200 linii) care orchestrează carduri dedicate și hook-uri specializate
- **Design Mobile-First:** Aplicația este proiectată mobile-first ca bază pentru viitoarea aplicație Android. Toate elementele interactive respectă touch target minimum 40×40px.
- **Structură modulară:**
  - `Dashboard.tsx` - Orchestrator principal cu grid responsive (1 coloană mobile, 2 desktop)
  - `DashboardHeader.tsx` - Header cu titlu, DarkModeToggle integrat și buton de configurare
  - `DashboardConfig.tsx` - Panou configurare carduri cu AnimatePresence modal
  - `hooks/useDashboardConfig.ts` - Management stări carduri + localStorage persistence
  - `hooks/useDashboardData.ts` - Toate calculele useMemo (goldData, filteredTotals, portfolioHistory, etc.)
  - `hooks/usePieInteraction.ts` - Logica click/double-click pentru PieChart cu debounce
  - `cards/PortfolioSummaryCard.tsx` - Sold total non-hideable + currency switcher + 5x PieChart selector
  - `cards/CashReserveCard.tsx` - Card dedicat pentru rezervă cash cu butoane always-visible
  - `cards/BankDepositsCard.tsx` - Card dedicat pentru depozite bancare cu randament mediu
  - `cards/GoldAssetsCard.tsx` - Card dedicat pentru aur cu grafic volatilitate LineChart
  - `cards/EquitiesCard.tsx` - Card dedicat pentru acțiuni & ETF cu performanțe simboluri
  - `cards/PortfolioEvolutionCard.tsx` - Card dedicat pentru evoluție istorică cu AreaChart
  - `cards/CollapsibleCard.tsx` - Wrapper pentru carduri colapsabile cu animații
  - `types.ts` - Tipuri și constante partajate (DashboardProps, CardSettings, GoldData, variante animație)
  - `index.ts` - Barrel export pentru importuri curate
- **Principii modularizare:**
  - Fiecare instrument de investiție are cardul său dedicat în `src/components/dashboard/cards/`
  - Logica specifică este izolată în hook-uri custom reutilizabile
  - Zero schimbări de funcționalitate - doar reorganizare cod
  - Fiecare fișier nou compilează independent fără erori TypeScript
- **Reguli UI Mobile-First:**
  - **Portfolio Summary Card:** Cardul sold total este non-hideable, include currency switcher pentru monedele utilizatorului și selector pentru 5 tipuri de grafice pie
  - **Dark Mode Toggle:** Repoziționat în DashboardHeader lângă titlu, eliminat din Navigation
  - **Butoane Hide/Show:** Always-visible pe toate cardurile (exceptat portfolio_summary) cu touch targets de 40×40px minimum
  - **Selectoare Monedă:** Always-visible pe carduri cu styling mobile-friendly (text-xs, padding adecvat)
  - **Grid Layout:** 1 coloană pe mobile, 2 coloane pe desktop cu PortfolioSummaryCard spanning full-width la desktop
  - **Text Responsive:** Valori mari folosesc `text-2xl md:text-3xl lg:text-4xl` cu `break-all` pentru a preveni overflow
  - **Padding Responsive:** Carduri folosesc `px-4 py-3 md:px-6 md:py-4 lg:p-8` pentru touch targets adecvate
  - **Bottom Padding:** Container principal are `pb-24 md:pb-8` pentru a nu fi acoperit de navigation bar mobil
  - **Carduri Navigabile:** Toate cardurile de instrumente sunt complet vizibile și clickable, navigând către pagini de detaliu specifice
- **Conditional Rendering:**
  - Cardurile sunt afișate doar dacă utilizatorul are economii de tipul respectiv:
    - `CashReserveCard` doar dacă `savings.some(s => s.type === 'Rezervă Cash')`
    - `BankDepositsCard` doar dacă `savings.some(s => s.type === 'Depozit Bancar')`
    - `GoldAssetsCard` doar dacă `savings.some(s => s.type === 'Aur')`
    - `EquitiesCard` doar dacă `savings.some(s => s.type === 'Acțiuni' || s.type === 'ETF')`
    - `PortfolioEvolutionCard` doar dacă `savings.length > 0`
    - `PortfolioSummaryCard` este întotdeauna afișat
- **Interactivitate Pie Chart:** 
  - **5 Opțiuni Grafice:** Selector cu navigare prin 5 tipuri de grafice: By Type, By Currency, Liquidity, Risk Profile, Time Horizon
  - **Currency Switcher:** Afișează doar monedele pe care le deține utilizatorul cu conversie în timp real
  - **Navigation Controls:** Butoane stânga/dreapta și dot indicators pentru navigarea între grafice
  - Click behavior cu debounce (300ms) pentru a distinge single vs double click
  - Primul click: Afișează detalii mobile-friendly pentru secțiunea activă
  - Al doilea click: Navighează/filtrează SavingsList după tipul/moneda respectivă
  - State management: `activeSliceIndex` și `clickCount` cu timer pentru debounce
- **Animații Carduri:** 
  - Toate cardurile folosesc `motion.div` cu hover animations
  - Scale effect: `scale: 1.02` la hover
  - Box shadow adaptiv: Light mode `'0 8px 30px rgba(0,0,0,0.12)'`, Dark mode `'0 8px 30px rgba(0,0,0,0.4)'`
  - Spring transition: `{ type: 'spring', stiffness: 300, damping: 20 }`
  - **Colapsare:** Animații smooth cu `AnimatePresence` și `motion.div` pentru height animation
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

### Dark Mode Status & Roadmap

**Current Status (MVP Stubbed):**
- Dark mode functionality has been temporarily commented out for MVP release
- All `dark:` Tailwind classes have been removed from components
- `DarkModeToggle` component import and usage commented out in `DashboardHeader.tsx`
- `useDarkMode` hook remains in codebase for future re-implementation
- Light theme optimized for mobile-first experience as per design specifications

**What was implemented before stubbing:**
- Complete dark mode toggle with localStorage persistence
- Dark theme variants for all components (cards, modals, navigation)
- Automatic system preference detection
- Smooth transitions between light/dark themes
- Dark mode aware color schemes and contrast ratios

**Roadmap for Dark Mode Re-implementation:**
1. **Phase 1 (Post-MVP):** 
   - Re-enable all dark: class variants in components
   - Test and fix contrast issues in mobile view
   - Implement proper dark mode color palette (not just inverted colors)
   - Add dark mode aware chart colors and tooltips

2. **Phase 2 (Enhancement):**
   - Add system preference detection (prefers-color-scheme)
   - Implement theme scheduling (auto light/dark based on time)
   - Add custom theme options beyond light/dark
   - Optimize dark mode for battery life on mobile

3. **Phase 3 (Advanced):**
   - Theme customization options for users
   - Export/import theme configurations
   - Accessibility improvements for color blind users
   - Performance optimizations for theme switching

**Technical Notes:**
- All dark mode related code is commented out, not deleted - can be easily re-enabled
- Component structure supports theme switching via props
- Tailwind configuration supports dark mode variants
- CSS custom properties ready for theme implementation

### Instrument Card Currency Selection (Stubbed)

**Current Status (MVP Stubbed):**
- Individual currency dropdown functionality has been temporarily removed from instrument cards
- Cards now display values in the currency set from the main PortfolioSummaryCard (displayCurrencyMode)
- All instrument cards (BankDepositsCard, CashReserveCard, GoldAssetsCard, EquitiesCard) use a unified display currency
- Currency conversion is handled centrally in `useDashboardData.ts` via the `getCardValue` function

**What was implemented before stubbing:**
- Individual currency dropdowns on each instrument card with options: AUTO, RON, EUR, and user's active currencies
- AUTO mode synced with main card's displayCurrencyMode (RON/EUR toggle)
- Individual card currency settings persisted in localStorage via cardSettings
- Click propagation handling to prevent navigation when selecting currencies
- Real-time currency conversion using exchange rates

**Why it was stubbed:**
- Click propagation issues: Clicking currency options in dropdowns triggered navigation to detail pages instead of changing currency
- Event bubbling complexity: Multiple attempts to fix with `e.stopPropagation()`, `data-dropdown-option` attributes, and DOM selectors were unsuccessful
- User experience impact: The dropdown functionality was causing navigation issues that made the cards unusable
- Simplification: Removing per-card currency selection simplifies the UX and reduces complexity

**Roadmap for Currency Selection Re-implementation:**
1. **Phase 1 (Post-MVP):**
   - Re-implement currency dropdowns with proper event handling
   - Use React Portal for dropdowns to avoid z-index and event bubbling issues
   - Implement click-outside detection using refs instead of document-level event listeners
   - Test click propagation thoroughly across all card types

2. **Phase 2 (Enhancement):**
   - Add currency preference per instrument type (e.g., gold always in EUR, deposits in RON)
   - Implement currency conversion history tracking
   - Add currency comparison mode (side-by-side view in multiple currencies)
   - Optimize currency conversion performance with memoization

3. **Phase 3 (Advanced):**
   - Automatic currency detection based on instrument type
   - Currency alerts for significant exchange rate changes
   - Multi-currency portfolio analysis
   - Currency hedging recommendations

**Technical Notes:**
- All currency-related code is preserved in comments/history for easy re-implementation
- `cardSettings.currency` fields remain in localStorage schema for future use
- `getCardValue` function in `useDashboardData.ts` handles all currency conversion logic
- `displayCurrencyMode` state in Dashboard.tsx controls global display currency
- Conversion formula: `convertedValue = displayCurrency === 'EUR' ? baseValue / (rates?.['EUR'] || 1) : baseValue`

### Other Roadmap Items
1. [ ] Sistem de notificări pentru scadențe depozite (Service Workers).
2. [ ] Integrare cu API-uri bancare prin Open Banking (Specter/SaltEdge) - Pro Feature.
3. [ ] Modul dedicat pentru Imobiliare (Chirii, Taxe, Randament net).
4. [ ] Gamificare: "Saving Badges" pentru atingerea obiectivelor financiare.

---

## 12. Istoric Modificări Recente

### 12 Mai 2026 - Dashboard Refactoring: Navigation, Grid Layout, Pie Charts & Collapsible Cards
**Overview:** Refactoring major al dashboard-ului cu îmbunătățiri de UX, layout responsive și funcționalități avansate.

**Schimbări Implementate:**

1. **Navigation Cleanup:**
   - Eliminate "Termeni" și "Confidențialitate" din bara de navigare plutitoare
   - Păstrează doar "Dashboard" și "Active" tab-uri
   - Links juridice accesibile exclusiv din Footer-ul dashboard-ului

2. **Conditional Card Rendering:**
   - Cardurile instrumente sunt afișate doar dacă utilizatorul are economii de tipul respectiv
   - `CashReserveCard` → `savings.some(s => s.type === 'Rezervă Cash')`
   - `BankDepositsCard` → `savings.some(s => s.type === 'Depozit Bancar')`
   - `GoldAssetsCard` → `savings.some(s => s.type === 'Aur')`
   - `EquitiesCard` → `savings.some(s => s.type === 'Acțiuni' || s.type === 'ETF')`
   - `PortfolioEvolutionCard` → `savings.length > 0`
   - `PortfolioSummaryCard` → întotdeauna vizibil

3. **Responsive Grid Layout:**
   - Mobile: 1 coloană, fiecare card ocupă lățime completă
   - Tablet/Desktop: 2 coloane cu gap-4 md:gap-6
   - PortfolioSummaryCard spannează full-width (col-span-2) la desktop
   - Toate cardurile au `w-full h-full` pentru umplere proporțională

4. **PortfolioSummaryCard - Currency Switcher:**
   - Derivează monedele reale ale utilizatorului: `const userCurrencies = [...new Set(savings.map(s => s.currency))]`
   - Local state pentru moneda de afișare: `const [displayCurrency, setDisplayCurrency] = useState(userCurrencies[0])`
   - UI switcher cu pill buttons pentru monedele utilizatorului
   - Conversie în timp real folosind `rates` și `convertToRON` utility
   - Afișează doar dacă `userCurrencies.length > 1`

5. **PortfolioSummaryCard - 5-Option Pie Chart Selector:**
   - **5 Tipuri de Grafice:** By Type, By Currency, Liquidity, Risk Profile, Time Horizon
   - **Navigation Controls:** Butoane `ChevronLeft`/`ChevronRight` și dot indicators
   - **Data Processing Functions:**
     - `getLiquidityData()` → Lichid/Semi-lichid/Blocat
     - `getRiskProfileData()` → Risc Scăzut/Mediu/Ridicat
     - `getTimeHorizonData()` → Sub 1 an/1–3 ani/Peste 3 ani
   - **Left Chart:** Ciclică prin opțiunile 1, 3, 4, 5 (excluzând By Currency)
   - **Right Chart:** Fixat la "By Currency"
   - **Dot Indicators:** Afișează care opțiune este activă

6. **Instrument Cards - Click Navigation:**
   - **Clickable Cards:** Fiecare card de instrument este complet vizibil și clickable
   - **Navigation Behavior:** Click pe un card navighează către pagina de detaliu specifică
   - **Hover Effect:** Afișează iconița `ArrowUpRight` în colțul dreapta-sus la hover
   - **Navigation Targets:**
     - `CashReserveCard` → `detail-cash` (CashReserveDetail.tsx)
     - `BankDepositsCard` → `detail-deposits` (BankDepositsDetail.tsx)
     - `GoldAssetsCard` → `detail-gold` (GoldDetail.tsx)
     - `EquitiesCard` → `detail-equities` (EquitiesDetail.tsx)
   - **Non-Navigable:** PortfolioSummaryCard și PortfolioEvolutionCard rămân pe dashboard

**Files Modified:**
- `src/components/Navigation.tsx` - Eliminate links juridice, cleanup imports
- `src/components/dashboard/Dashboard.tsx` - Grid responsive, conditional rendering, clickable card navigation
- `src/components/dashboard/cards/PortfolioSummaryCard.tsx` - Currency switcher + 5-option pie selector
- `src/components/dashboard/types.ts` - Added onNavigate prop to DashboardProps interface
- `src/App.tsx` - Extended currentPage type, added detail page routing, passed onNavigate prop
- `src/pages/BankDepositsDetail.tsx` - New detail page for bank deposits with projections
- `src/pages/CashReserveDetail.tsx` - New detail page for cash reserves
- `src/pages/GoldDetail.tsx` - New detail page for gold assets
- `src/pages/EquitiesDetail.tsx` - New detail page for stocks and ETFs with pie chart

**Impact UX:**
- **Navigation mai curată:** Focus pe funcționalități principale
- **Performance:** Render condițional reduce component load
- **Personalizare:** Currency switcher adaptat la monedele utilizatorului
- **Analiză avansată:** 5 tipuri de grafice pentru perspective multiple
- **Mobile-friendly:** Carduri clickable economisesc spațiu și oferă acces rapid la detalii
- **Consistency:** Layout proporțional și responsive pe toate device-urile
- **Deep Insights:** Pagini de detaliu specializate cu proiecții și analize specifice fiecărui instrument

**Note Tehnice:**
- Toate schimbările păstrează funcționalitatea existentă
- Design pattern consistent cu restul aplicației
- Animații fluide folosind Motion (Framer Motion)
- TypeScript strict pentru type safety
- Zero breaking changes pentru auth logic sau data fetching

### 12 Mai 2026 - Fix eroare `containerRef is not defined`
**Problem:** După refactor-ul componentei de autentificare, utilizatorul întâmpina eroarea "containerRef is not defined" la încercarea de a se loga.

**Root Cause:** În `PortfolioSummaryCard.tsx`, se folosea `containerRef` pentru a gestiona click-urile în afara chart-urilor PieChart, dar acesta nu era definit în componentă.

**Solution Applied:**
1. **Import adăugat:** `import React, { useRef } from 'react';` în `PortfolioSummaryCard.tsx`
2. **Definiție locală:** `const containerRef = useRef<HTMLDivElement>(null);` adăugat la începutul componentei

**Files Modified:**
- `src/components/dashboard/cards/PortfolioSummaryCard.tsx` - Adăugat import `useRef` și definiție `containerRef`

**Impact:** 
- Rezolvă eroarea de runtime care bloca accesul utilizatorilor după login
- Restabilește funcționalitatea de click-outside pentru PieCharts în dashboard
- Zero schimbări de funcționalitate, doar fix de definiție variabilă

**Note:** Această problemă a apărut probabil în urma refactor-ului UI al paginii de autentificare, unde s-a modificat ordinea render-ului în `App.tsx`, expunând această problemă în componenta de dashboard.
