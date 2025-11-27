# Arkitektur

Dette dokumentet beskriver den tekniske arkitekturen til GitHub Copilot Adoption Dashboard.

## Overordnet arkitektur

Applikasjonen er bygget som en **Single-Page Application (SPA)** med følgende hovedkarakteristikker:

- **100% klientsidebasert** - Ingen backend-server kreves
- **Direkte API-integrasjon** - Kommuniserer direkte med GitHub REST API fra nettleseren
- **Statisk hosting** - Deployeres til GitHub Pages som statiske filer
- **Type-sikker** - Fullt TypeScript-basert kodebase

## Komponentstruktur

### Monolittisk design

Applikasjonen følger en monolittisk komponentarkitektur hvor all logikk er samlet i `App.tsx` (387 linjer):

```
App.tsx
├── Form State Management
├── API Integration Layer
├── Data Processing Logic
├── UI Rendering
│   ├── Input Form
│   ├── Metrics Cards
│   ├── Historical Chart
│   └── Breakdown Table
└── Error Handling
```

**Hvorfor monolittisk?**

- Enkel kodebase for et begrenset scope
- Redusert kompleksitet uten unødvendig abstraksjon
- Lettere å debugge og vedlikeholde
- Alle avhengigheter er eksplisitte og synlige

## Dataflyt

Applikasjonen følger en lineær dataflyt:

```
1. Brukerinput (token + enterprise)
   ↓
2. API-forespørsel til GitHub
   ↓
3. Respons validering (DailyMetrics[])
   ↓
4. processMetricsData() transformasjon
   ↓
5. React State oppdatering
   ↓
6. UI re-rendering
```

### State management

Bruker React hooks for state:

```typescript
// Brukerinput
const [token, setToken] = useState<string>('');
const [enterprise, setEnterprise] = useState<string>('');

// Applikasjonsstatus
const [metrics, setMetrics] = useState<DisplayMetrics | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string>('');
```

Ingen eksterne state management biblioteker (Redux, Zustand, etc.) brukes - plain `useState` er tilstrekkelig for denne applikasjonen.

## TypeScript type system

### API Response types

Kompleks nestet type-hierarki for GitHub API respons:

```typescript
DailyMetrics
├── copilot_ide_code_completions: CopilotIdeCodeCompletions
│   └── editors: Editor[]
│       └── models: Model[]
│           └── languages: CodeLanguage[]
├── copilot_ide_chat: CopilotIdeChat
├── copilot_dotcom_chat: CopilotDotcomChat
└── copilot_dotcom_pull_requests: CopilotDotcomPullRequests
```

### Display types

Forenklet interface for visning:

```typescript
interface DisplayMetrics {
  total_seats: number;
  total_active_users: number;
  total_engaged_users: number;
  historical_data: {
    dates: string[];
    engaged_users: number[];
  };
  breakdown: Array<{
    language: string;
    editor: string;
    suggestions_count: number;
    acceptances_count: number;
    lines_suggested: number;
    lines_accepted: number;
    active_users: number;
  }>;
}
```

## Dataprosessering

### processMetricsData() funksjon

Kritisk transformasjonsfunksjon som konverterer rå API-data til visningsformat:

**Input**: `DailyMetrics[]` (array av daglige metrikker, eldste først)

**Output**: `DisplayMetrics` (optimalisert for visning)

#### Hovedoperasjoner

1. **Siste dag ekstraksjon**
   ```typescript
   const latestDay = data[data.length - 1];
   ```
   API returnerer data i kronologisk rekkefølge (eldste → nyeste).

2. **Historisk data mapping**
   ```typescript
   const historicalData = {
     dates: data.map(day => day.date),
     engaged_users: data.map(day => day.total_engaged_users)
   };
   ```

3. **Breakdown-tabell flatting**
   - Flater ut nestet struktur: `editors → models → languages`
   - Samler suggestions, acceptances, og brukere per språk/editor
   - Sorterer etter aktive brukere (descending), deretter aksepteringsrate

4. **Sete-estimering**
   ```typescript
   const estimated_total_seats = Math.round(latestDay.total_active_users * 1.2);
   ```
   **Workaround**: API gir ikke totalt antall seter, så vi estimerer til 120% av aktive brukere.

## Visualisering med Chart.js

### Registrering

Chart.js krever eksplisitt komponentregistrering:

```typescript
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
```

**Kritisk**: Hvis en komponent mangler, vil applikasjonen krasje ved runtime.

### Line Chart konfiguration

- **X-akse**: Datoer (kronologisk, venstre → høyre)
- **Y-akse**: Antall engasjerte brukere
- **Features**: Tooltip callbacks, fill area, responsive design

## Styling

### CSS arkitektur

- **Ingen CSS Modules eller styled-components**
- **Global CSS**: `index.css` (164 linjer)
- **Inline styles**: Kun for breakdown-tabellen (linjer 344-375 i App.tsx)

### Layout teknikker

```css
/* Metrics grid: Responsive auto-fit */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

## Sikkerhet

### Token håndtering

- **Input type**: `<input type="password">` - skjuler token fra skjermen
- **Ingen persistering**: Token lagres ALDRI i localStorage eller cookies
- **Kun i minnet**: Token lives kun i React state under sesjon
- **HTTPS**: All kommunikasjon via HTTPS (GitHub API + GitHub Pages)

### CORS og CSP

- **Ingen CORS-problemer**: Browser sender forespørsler direkte til GitHub API
- **GitHub godtar**: `github.io` domener som gyldige origin

## Build og Bundling

### Vite configuration

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/github-copilot-adoption-dashboard/', // Kritisk for GitHub Pages
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
```

**Base path**: Må matches med GitHub repository navn for korrekt asset loading.

### Build output

```
dist/
├── index.html        # Entry point
├── assets/
│   ├── index-[hash].js   # Bundled JavaScript
│   └── index-[hash].css  # Compiled CSS
└── ...
```

## Ytelse

### Optimalisering

- **Code splitting**: Vite's automatiske splitting
- **Tree shaking**: Fjerner ubrukt kode
- **Minification**: Produksjons-build er minifisert
- **Caching**: Hash-baserte filnavn for optimal browser caching

### Begrensninger

- **Ingen lazy loading**: All kode lastes ved første side-load
- **Ingen memo/useMemo**: Ingen kompleks state som krever memoisering
- **Re-render**: Hele `App` re-rendres ved state endringer (akseptabelt for denne størrelsen)

## Testing arkitektur

### Test setup

- **Framework**: Vitest 4.0
- **Environment**: jsdom (browser simulation)
- **Library**: @testing-library/react

### Chart.js mocking

```typescript
vi.mock('react-chartjs-2', () => ({
  Line: () => <div>Chart</div>,
}));
```

**Hvorfor**: Chart.js krever canvas, som ikke fungerer i jsdom. Vi mocker komponenten for å teste logikk uten visning.

## Potensielle forbedringer

Hvis applikasjonen skal skaleres:

1. **Component decomposition**: Splitt `App.tsx` i mindre komponenter
2. **Custom hooks**: Ekstraher API-logikk til `useGitHubMetrics()`
3. **Context API**: For global state (hvis flere features legges til)
4. **React Query**: For bedre data fetching og caching
5. **CSS-in-JS**: Styled-components eller Emotion for bedre modularitet
6. **Lazy loading**: Code-splitting for større bundles

## Tekniske begrensninger

- **GitHub API rate limits**: 5000 requests/time for autentiserte brukere
- **Browser storage**: Ingen data persisteres mellom sesjoner
- **Client-side only**: Kan ikke skjule secrets eller gjøre server-side operasjoner
