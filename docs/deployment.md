# Deployment Guide

Denne guiden forklarer hvordan GitHub Copilot Adoption Dashboard deployeres til GitHub Pages.

## Oversikt

Applikasjonen bruker **automatisk deployment** via GitHub Actions til GitHub Pages:

- ✅ **Trigger**: Push til `main` branch
- ✅ **Build**: Vite production build
- ✅ **Test**: Kjører alle tests før deployment
- ✅ **Deploy**: Automatisk til GitHub Pages
- ✅ **URL**: https://frankburmo.github.io/github-copilot-adoption-dashboard/

## GitHub Actions Workflow

### Workflow fil

Lokasjon: `.github/workflows/deploy.yml`

### Workflow struktur

```yaml
name: Build and Deploy

on:
  push:
    branches: [ "main" ]       # Deploy ved push til main
  pull_request:
    branches: [ "main" ]       # Test ved PR til main
  workflow_dispatch:           # Manuell trigger
```

### Jobs

#### 1. Build Job

Kjører på **ubuntu-latest** ved alle triggers:

```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - Checkout code
    - Setup Node.js 22.x
    - Install dependencies (npm ci)
    - Build project (npm run build)
    - Run tests (npm test)
    - Upload artifact (kun main branch)
```

**npm ci vs npm install**:
- `npm ci` installerer fra `package-lock.json` (deterministisk)
- Raskere og sikrere for CI/CD

#### 2. Deploy Job

Kjører **kun ved push til main**:

```yaml
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  needs: build
  steps:
    - Deploy to GitHub Pages
```

**Conditional deployment**:
- Pull requests bygges og testes, men deployes IKKE
- Kun main branch changes deployes

### Permissions

```yaml
permissions:
  contents: read      # Lese repository
  pages: write        # Skrive til GitHub Pages
  id-token: write     # OIDC token for deployment
```

### Concurrency

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

**Betydning**: Kun én deployment om gangen. Hvis ny deployment starter mens forrige kjører, venter den (cancel-in-progress: false).

## GitHub Pages Konfiguration

### Repository Settings

1. Gå til repository Settings
2. Navigér til **Pages** (venstre sidebar)
3. Under **Build and deployment**:
   - Source: **GitHub Actions** (ikke "Deploy from branch")
4. Vent på første deployment

### Custom Domain (optional)

For custom domain (e.g., `metrics.yourcompany.com`):

1. Legg til CNAME record hos DNS provider:
   ```
   metrics.yourcompany.com → frankburmo.github.io
   ```

2. I GitHub Pages settings:
   - Custom domain: `metrics.yourcompany.com`
   - Enforce HTTPS: ✅

3. Oppdater `vite.config.ts`:
   ```typescript
   base: '/' // Ikke '/github-copilot-adoption-dashboard/'
   ```

## Build Process

### Vite Production Build

```bash
npm run build
```

Kjører: `vite build`

### Build output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Bundled JavaScript (minified)
│   ├── index-[hash].css     # Compiled CSS
│   └── [other assets]
└── vite.svg                  # Favicon
```

### Build optimalisering

Vite optimaliserer automatisk:

- **Minification**: Fjerner whitespace, kommentarer, forkorter variabelnavn
- **Tree shaking**: Fjerner ubrukt kode
- **Code splitting**: Deler koden i chunks
- **Asset hashing**: `[hash]` i filnavn for cache busting
- **Compression**: Gzip/Brotli ready

### Build statistikk

Eksempel output:

```
vite v7.2.4 building for production...
✓ 245 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-DwN5v5Rt.css   12.34 kB │ gzip:  3.21 kB
dist/assets/index-C8F9jkLm.js   156.78 kB │ gzip: 52.45 kB
✓ built in 2.34s
```

## Base Path Konfiguration

### Hvorfor base path?

GitHub Pages serverer repositories på:
```
https://<username>.github.io/<repository-name>/
```

For dette prosjektet:
```
https://frankburmo.github.io/github-copilot-adoption-dashboard/
```

### Vite konfigurasjon

```typescript
// vite.config.ts
export default defineConfig({
  base: '/github-copilot-adoption-dashboard/',
})
```

**Kritisk**: Base path må matche repository navn, ellers:
- ❌ Assets (JS, CSS) feiler å laste
- ❌ Routing blir feil
- ❌ Applikasjonen vises blank

### Lokal testing av base path

Test produksjonsbygg med base path:

```bash
npm run build
npm run preview
```

Preview server vil servere på:
```
http://localhost:4173/github-copilot-adoption-dashboard/
```

## Deployment Prosess

### Automatisk deployment (anbefalt)

1. **Gjør kodeendringer** lokalt
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
3. **Push til main**:
   ```bash
   git push origin main
   ```
4. **GitHub Actions trigger automatisk**
5. **Vent 2-3 minutter**
6. **Verifiser deployment** på live URL

### Manuell deployment

Trigger workflow manuelt via GitHub UI:

1. Gå til **Actions** tab
2. Velg **Build and Deploy** workflow
3. Klikk **Run workflow**
4. Velg branch (vanligvis `main`)
5. Klikk **Run workflow**

### Deployment status

Sjekk deployment status:

1. Gå til **Actions** tab
2. Se siste workflow run
3. Grønn ✅ = Success
4. Rød ❌ = Failure (klikk for detaljer)

### Deployment URL

Etter vellykket deployment:

- Finn URL i **Environments** → **github-pages**
- Eller i workflow output: `steps.deployment.outputs.page_url`

## Feilsøking

### Build feiler

**Problem**: `npm run build` feiler i workflow

**Løsning**:
1. Test build lokalt: `npm run build`
2. Fikse TypeScript errors
3. Sjekk ESLint warnings: `npm run lint`
4. Push fix til main

### Tests feiler

**Problem**: `npm test` feiler i workflow

**Løsning**:
1. Kjør tests lokalt: `npm run test:run`
2. Fikse failing tests
3. Verifiser med `npm test`
4. Push fix

### Deployment succeeds, men siden er blank

**Problem**: GitHub Pages viser blank side eller 404

**Mulige årsaker og løsninger**:

1. **Feil base path**:
   ```typescript
   // vite.config.ts
   base: '/github-copilot-adoption-dashboard/' // Må matche repo navn
   ```

2. **Feil GitHub Pages source**:
   - Settings → Pages → Source må være **GitHub Actions**

3. **Assets ikke lastet**:
   - Sjekk browser DevTools (F12) → Console for errors
   - Sjekk Network tab for 404s

### 404 på refresh

**Problem**: Siden fungerer, men refresh gir 404

**Løsning**: Dette skjer ikke for denne SPA siden vi kun har én route (`/`). Men hvis du legger til routing i fremtiden:

- Bruk HashRouter i stedet for BrowserRouter
- Eller legg til 404.html fallback for GitHub Pages

### Cache problems

**Problem**: Deployment succeeds, men gamle filer vises

**Løsning**:

1. **Hard refresh**: Ctrl+Shift+R (Windows) eller Cmd+Shift+R (Mac)
2. **Clear cache**: DevTools → Network → Disable cache
3. **Verifiser hash**: Sjekk at asset filenames har ny hash

## Produksjonsoptimalisering

### Performance

Vite bygger automatisk optimalisert bundle:

- **Lazy loading**: Dynamic imports for code splitting
- **Minification**: Terser for JavaScript
- **CSS optimization**: Inline critical CSS
- **Asset optimization**: Optimal chunk sizes

### Metrics

Sjekk bundle size:

```bash
npm run build

# Output viser gzip size
dist/assets/index-C8F9jkLm.js   156.78 kB │ gzip: 52.45 kB
```

**Mål**: Hold bundle under 200 kB (gzipped) for god performance.

### Lighthouse score

Test med Google Lighthouse:

1. Åpne live site i Chrome
2. DevTools → Lighthouse tab
3. Kjør audit
4. Mål: 90+ score for alle kategorier

## Environment Variables

### Ingen secrets i frontend!

⚠️ **KRITISK**: Denne applikasjonen er 100% klientsidebasert.

**ALDRI commit**:
- GitHub tokens
- API keys
- Secrets

**Hvorfor**:
- All kode er synlig i browser
- `process.env` variabler blir embedded i bundle
- GitHub Pages er offentlig tilgjengelig

### Brukerinput for tokens

Applikasjonen ber brukere om tokens via input field:

```tsx
<input
  type="password"
  value={token}
  onChange={(e) => setToken(e.target.value)}
/>
```

**Sikkerhet**:
- ✅ Token er aldri committet
- ✅ Token lagres kun i React state (minnet)
- ✅ Token sendes kun til GitHub API (HTTPS)
- ✅ Token forsvinner ved page refresh

## Monitoring og Analytics

### GitHub Actions Insights

Se deployment metrics:

1. **Actions** → **Build and Deploy**
2. Se historikk av runs
3. Analyser build times
4. Identifiser failing patterns

### GitHub Pages Analytics

GitHub gir ikke built-in analytics. For å tracke trafikk:

**Option 1: Google Analytics**

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Option 2: Plausible/Umami** (privacy-friendly alternativer)

## Rollback Strategy

### Reverter til forrige versjon

Hvis ny deployment introduserer bugs:

```bash
# Finn forrige working commit
git log --oneline

# Revert til commit
git revert <commit-hash>

# Eller reset (force push required)
git reset --hard <commit-hash>
git push --force origin main
```

**Anbefaling**: Bruk `git revert` (lager ny commit) over `git reset --force`.

### Hotfix workflow

For kritiske bugs:

1. **Create hotfix branch**:
   ```bash
   git checkout -b hotfix/critical-bug
   ```

2. **Fix bug**:
   ```bash
   # Make changes
   git commit -m "hotfix: resolve critical bug"
   ```

3. **Merge til main**:
   ```bash
   git checkout main
   git merge hotfix/critical-bug
   git push origin main
   ```

4. **Deployment happens automatisk**

## Continuous Integration Best Practices

### Pre-deployment checks

Workflow kjører alltid:

1. ✅ Linting (`npm run lint` burde være i workflow)
2. ✅ Type checking (TypeScript compilation)
3. ✅ Unit tests (`npm test`)
4. ✅ Build verification (`npm run build`)

### Pull Request workflow

Ved PR til main:

1. **Build job kjører** (men deployer ikke)
2. **Tests kjører**
3. **Review required** før merge
4. **Merge trigger deployment**

**Anbefaling**: Legg til branch protection rules:
- Require PR reviews
- Require status checks (build + test)
- No direct pushes til main

## Neste steg

- Les [Development Guide](development.md) for lokal utvikling
- Se [Architecture](architecture.md) for system design
- Sjekk [API Integration](api-integration.md) for API detaljer
