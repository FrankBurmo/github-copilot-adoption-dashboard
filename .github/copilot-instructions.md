# GitHub Copilot Adoption Dashboard - AI Agent Instructions

## Project Overview

This is a client-side React dashboard for viewing GitHub Copilot enterprise metrics via the GitHub REST API. The app is deployed to GitHub Pages and requires no backend server - all API calls happen directly from the browser to GitHub's API.

**Key constraint**: GitHub Pages deployment with base path `/github-copilot-adoption-dashboard/` (set in `vite.config.ts`).

## Architecture & Data Flow

### Single-Page Application Structure
- **`App.tsx`**: Monolithic component handling all logic (form state, API fetching, data processing, rendering)
- **No component decomposition**: All UI (form, metrics cards, chart, table) lives in one 387-line component
- **Data flow**: User input → GitHub API fetch → `processMetricsData()` → React state → render

### GitHub API Integration
```
Endpoint: GET https://api.github.com/enterprises/{enterprise}/copilot/metrics
Headers:
  - Authorization: Bearer {token}
  - Accept: application/vnd.github+json
  - X-GitHub-Api-Version: 2022-11-28
```

Response is `DailyMetrics[]` (array of daily metrics, oldest first). The app:
1. Takes the **last item** as the latest day's data
2. Builds historical trend from the full array
3. Flattens the nested structure (`editors → models → languages`) into a breakdown table

### Critical Data Processing Logic

**Total Seats Estimation** (line 140 in App.tsx):
```typescript
const estimated_total_seats = Math.round(latestDay.total_active_users * 1.2);
```
This is a workaround - the API doesn't provide total seats, so we estimate at 120% of active users.

**Breakdown Table Sorting** (lines 127-136):
1. Primary: Active users (descending)
2. Secondary: Acceptance rate (descending)

**Historical Data Order**: Dates are rendered left-to-right chronologically (oldest to newest) for the Chart.js line chart.

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server on localhost:5173
```

### Testing
```bash
npm test             # Run Vitest in watch mode
npm run test:ui      # Launch Vitest UI
npm run test:run     # Run tests once (CI mode)
```

**Test setup**: Vitest with `@testing-library/react`, jsdom environment (configured in `vite.config.ts`). Chart.js is mocked in tests (see `App.test.tsx` line 6).

### Building & Deployment
```bash
npm run build        # Vite build → dist/
npm run preview      # Preview production build locally
```

Deployment is automated via GitHub Actions. The app **must** work with the `/github-copilot-adoption-dashboard/` base path.

## Project-Specific Conventions

### TypeScript Patterns
- **Interface naming**: Domain types use descriptive names (`DailyMetrics`, `CopilotIdeCodeCompletions`), not generic prefixes
- **Array typing**: Use `Type[]` syntax (e.g., `DailyMetrics[]`), not `Array<Type>`
- **Type safety on API responses**: Explicit `ErrorResponse` interface for error handling

### React Patterns
- **No JSX import needed**: Uses new `jsx: "react-jsx"` transform (tsconfig.json)
- **State management**: Plain `useState` - no external state libraries
- **Event handlers**: Inline arrow functions in JSX (e.g., `onChange={(e) => setToken(e.target.value)}`)
- **No component composition**: Everything in `App.tsx` - if adding features, follow this pattern unless refactoring

### Styling Approach
- **No CSS modules or styled-components**: Plain CSS in `index.css` with class-based styling
- **Layout**: CSS Grid for metrics cards (`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`)
- **Inline styles**: Only for the breakdown table (lines 344-375 in App.tsx)

### Chart.js Configuration
Chart.js components must be explicitly registered:
```typescript
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
```
Missing this causes runtime errors. The Line chart uses custom tooltip callbacks to format dates and user counts.

## Common Pitfalls & Gotchas

1. **Base path for GitHub Pages**: If adding routing or asset references, account for `/github-copilot-adoption-dashboard/`
2. **API data order**: The API returns oldest-first, but we show latest-day metrics. Don't reverse arrays unnecessarily
3. **Sensitive data**: Tokens are in password inputs but never persisted (no localStorage/cookies)
4. **ESLint config**: Uses flat config format (`eslint.config.js`), not legacy `.eslintrc`
5. **Testing Chart.js**: Always mock `react-chartjs-2` in tests to avoid canvas errors

## Key Files Reference

- **`App.tsx`**: Single source of truth for all application logic
- **`vite.config.ts`**: Defines base path and test configuration
- **`package.json`**: Note the project name is `copilot-metrics-frontend` (historical)
- **`setupTests.ts`**: Imports jest-dom matchers for Vitest

## When Adding Features

- **New metrics/charts**: Add to the monolithic `App.tsx` unless complexity demands refactoring
- **New API fields**: Update the `DailyMetrics` type chain and `processMetricsData()` function
- **Styling changes**: Prefer updating `index.css` over inline styles
- **Tests**: Mock external dependencies (Chart.js, fetch) and test user-facing behavior
