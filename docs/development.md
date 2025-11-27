# Utviklingsguide

Denne guiden dekker alt du trenger for å komme i gang med lokal utvikling av GitHub Copilot Adoption Dashboard.

## Forutsetninger

### Påkrevd programvare

- **Node.js** >= 18.x (anbefalt: 20.x LTS)
- **npm** >= 9.x (følger med Node.js)
- **Git** for versjonskontroll

### Verifiser installasjon

```bash
node --version  # v20.x.x
npm --version   # 9.x.x
git --version   # 2.x.x
```

## Første gangs oppsett

### 1. Klon repository

```bash
git clone https://github.com/FrankBurmo/github-copilot-adoption-dashboard.git
cd github-copilot-adoption-dashboard
```

### 2. Installer avhengigheter

```bash
npm install
```

Dette installerer:
- React 19.2 og React DOM
- TypeScript 5.9
- Vite 7.2 (dev server og build tool)
- Chart.js 4.5 + react-chartjs-2
- Testing libraries (Vitest, Testing Library)
- ESLint og linting tools

### 3. Start utviklingsserver

```bash
npm run dev
```

Applikasjonen starter på: **http://localhost:5173**

```
VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/github-copilot-adoption-dashboard/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Merk**: URL inkluderer `/github-copilot-adoption-dashboard/` base path (for GitHub Pages kompatibilitet).

## Utviklingsmiljø

### Vite Dev Server features

- **Hot Module Replacement (HMR)** - Endringer reflekteres øyeblikkelig
- **Fast refresh** - Beholder React state ved fil-lagring
- **TypeScript type checking** - Real-time feildeteksjon
- **Instant restart** - Server starter på sekunder

### Fil-struktur

```
github-copilot-adoption-dashboard/
├── src/
│   ├── App.tsx           # Hovedkomponent (all logikk)
│   ├── App.test.tsx      # Unit tests for App
│   ├── index.tsx         # React entry point
│   ├── index.css         # Global styles
│   └── setupTests.ts     # Test configuration
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint configuration
├── package.json          # Dependencies & scripts
└── docs/                 # Documentation
```

### VS Code anbefalt setup

#### Extensions

- **ESLint** - Linting i editoren
- **Prettier** - Code formatting
- **TypeScript and JavaScript** - IntelliSense
- **ES7+ React/Redux/React-Native snippets** - React snippets

#### Settings (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Tilgjengelige scripts

### Development

```bash
npm run dev      # Start dev server (samme som npm start)
npm start        # Alias for npm run dev
```

### Testing

```bash
npm test         # Run tests i watch mode
npm run test:ui  # Åpne Vitest UI i browser
npm run test:run # Run tests én gang (CI mode)
```

### Production

```bash
npm run build    # Build for produksjon → dist/
npm run preview  # Preview production build lokalt
```

### Code quality

```bash
npm run lint     # Run ESLint på src/ katalog
```

## Testing

### Test framework

**Vitest 4.0** - Modern, fast unit test runner (Vite-native)

### Test setup

Tests kjører i **jsdom** environment (browser simulation):

```typescript
// vite.config.ts
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/setupTests.ts',
}
```

### Kjøre tests

#### Watch mode (anbefalt under utvikling)

```bash
npm test
```

Vitest vil:
- Kjøre alle tests
- Watche for endringer
- Re-run relevante tests ved fil-lagring
- Vise coverage i terminal

#### UI mode

```bash
npm run test:ui
```

Åpner interaktiv UI i browser med:
- Test tree visualization
- Code coverage
- Test timing
- Detailed error messages

#### CI mode

```bash
npm run test:run
```

Kjører alle tests én gang og avslutter (for CI/CD pipelines).

### Test struktur

Eksempel fra `App.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock Chart.js (krever canvas)
vi.mock('react-chartjs-2', () => ({
  Line: () => <div>Chart</div>,
}));

describe('App Component', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText('GitHub Copilot Metrics')).toBeInTheDocument();
  });

  it('renders input fields', () => {
    render(<App />);
    expect(screen.getByLabelText(/GitHub Token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enterprise/i)).toBeInTheDocument();
  });
});
```

### Mocking

#### Chart.js

Chart.js krever canvas API som ikke finnes i jsdom. Vi mocker `react-chartjs-2`:

```typescript
vi.mock('react-chartjs-2', () => ({
  Line: () => <div>Chart</div>,
}));
```

#### Fetch API

For å teste API calls:

```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([mockData]),
  })
) as jest.Mock;
```

## Linting og Code Quality

### ESLint configuration

Bruker **flat config format** (`eslint.config.js`), ikke legacy `.eslintrc`:

```javascript
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### Kjøre linter

```bash
npm run lint
```

Output:
```
✨ Done in 0.5s
```

Eller ved feil:
```
/src/App.tsx
  45:7  error  'unused' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)
```

### Auto-fix

ESLint kan fikse mange problemer automatisk:

```bash
npm run lint -- --fix
```

## TypeScript

### Konfiguration

`tsconfig.json` bruker moderne React-oppsett:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",  // Ny JSX transform (no React import needed)
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

### Type checking

TypeScript compiler kjører automatisk i Vite dev server:

```bash
npm run dev
```

Vite vil vise type errors i:
- Terminal
- Browser overlay
- VS Code (med extension)

### Conventions

#### Interface naming

```typescript
// ✅ Descriptive names
interface DailyMetrics { ... }
interface DisplayMetrics { ... }
interface ErrorResponse { ... }

// ❌ Generic prefixes
interface IMetrics { ... }
```

#### Array typing

```typescript
// ✅ Preferred
DailyMetrics[]

// ❌ Avoid
Array<DailyMetrics>
```

#### Explicit return types (optional)

```typescript
// Function components
const App: React.FC = () => { ... }

// Functions
const processMetricsData = (data: DailyMetrics[]): DisplayMetrics => { ... }
```

## Debugging

### Browser DevTools

1. Åpne DevTools (F12)
2. Gå til Sources tab
3. Finn `src/App.tsx` i file tree
4. Sett breakpoints
5. Klikk "Get Metrics" for å trigge debugging

### React DevTools

Installer [React Developer Tools](https://react.dev/learn/react-developer-tools) browser extension:

- Inspiser component tree
- Se props og state
- Profile re-renders
- Debug hooks

### Console logging

Midlertidig debugging:

```typescript
console.log('Metrics data:', data);
console.table(breakdown); // Fancy table display
```

**Husk**: Fjern console.log før commit!

### Vite debug mode

Start med debug logging:

```bash
DEBUG=vite:* npm run dev
```

## Common Development Tasks

### Legge til ny metric

1. **Oppdater type** i `App.tsx`:
   ```typescript
   interface DisplayMetrics {
     // ... existing fields
     new_metric: number;
   }
   ```

2. **Ekstraher data** i `processMetricsData()`:
   ```typescript
   return {
     // ... existing fields
     new_metric: latestDay.some_field,
   };
   ```

3. **Render** i UI:
   ```tsx
   <div className="metric-card">
     <h3>New Metric</h3>
     <p className="value">{metrics.new_metric}</p>
   </div>
   ```

### Endre styling

1. Åpne `src/index.css`
2. Finn relevant CSS class
3. Gjør endringer
4. Se endringer live i browser (HMR)

### Legge til test

1. Åpne `src/App.test.tsx`
2. Legg til ny `it()` block:
   ```typescript
   it('should do something', () => {
     render(<App />);
     expect(screen.getByText('Expected text')).toBeInTheDocument();
   });
   ```
3. Kjør `npm test` for å verifisere

## Performance profiling

### Vite build analysis

```bash
npm run build -- --mode analyze
```

Viser bundle size og dependencies.

### React Profiler

Wrap komponenter for å profile:

```typescript
import { Profiler } from 'react';

<Profiler id="App" onRender={(id, phase, actualDuration) => {
  console.log({ id, phase, actualDuration });
}}>
  <App />
</Profiler>
```

## Troubleshooting

### Problem: Port 5173 er opptatt

**Løsning**: Vite vil automatisk prøve neste tilgjengelige port (5174, 5175, etc.)

### Problem: Module not found errors

**Løsning**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: TypeScript errors ikke synlige

**Løsning**: Restart Vite dev server med `Ctrl+C` og `npm run dev`.

### Problem: Tests feiler med "canvas not available"

**Løsning**: Sjekk at Chart.js er mocket:
```typescript
vi.mock('react-chartjs-2', () => ({
  Line: () => <div>Chart</div>,
}));
```

### Problem: ESLint errors om React import

**Løsning**: Moderne React (17+) krever ikke `import React`. Fjern importen:
```typescript
// ❌ Old
import React from 'react';

// ✅ New
// (ingen import nødvendig for JSX)
```

## Best Practices

### Commit messages

Følg Conventional Commits:

```
feat: add new metric card
fix: correct chart data order
docs: update API documentation
test: add test for data processing
style: format code with prettier
```

### Branch naming

```
feature/add-chat-metrics
fix/chart-rendering-bug
docs/api-integration-guide
```

### Code review checklist

- [ ] TypeScript type errors resolved
- [ ] Tests pass (`npm run test:run`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console.log statements
- [ ] Comments added for complex logic

## Neste steg

- Les [Deployment guide](deployment.md) for produksjonsbygg
- Se [Architecture](architecture.md) for dypere forståelse
- Sjekk [API Integration](api-integration.md) for API-detaljer
