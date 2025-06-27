# GitHub Copilot adoption dashboard

A React-based dashboard for tracking GitHub Copilot adoption metrics for enterprises.

🔗 **Live Demo**: https://frankburmo.github.io/github-copilot-adoption-dashboard/

## Overview

This application provides a clean, simple interface for viewing GitHub Copilot usage metrics via the GitHub API. Users can input their GitHub token and enterprise name to fetch and display adoption metrics.

## Features

- **Token-based Authentication**: Secure input for GitHub personal access tokens
- **Enterprise Metrics**: Fetch metrics for any GitHub enterprise 
- **Clean Dashboard**: Simple, readable display of key metrics including:
  - Total seats (estimated)
  - Active users
  - Engaged users
  - Engagement rate
- **Historical Visualization**: Interactive line chart showing engagement trends over time
- **Detailed Breakdown**: Comprehensive table showing:
  - Usage by programming language and editor
  - Code suggestions and acceptance counts
  - Acceptance rates percentage
  - Active users per language/editor combination

## Setup and Installation

### Using the Live Demo

The easiest way to use this dashboard is through the live demo at:
https://frankburmo.github.io/github-copilot-adoption-dashboard/

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/FrankBurmo/github-copilot-adoption-dashboard.git
   cd github-copilot-adoption-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The application will open in your browser at `http://localhost:5173`.

### Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` folder.

## Usage

1. **GitHub Token**: Enter your GitHub personal access token. The token needs the following permissions:
   - `copilot` scope for accessing Copilot metrics
   - Enterprise member access if the enterprise is private

2. **Enterprise**: Enter the GitHub enterprise name

3. **Get Metrics**: Click the "Get Metrics" button to fetch and display the live metrics

## API Information

This application uses the GitHub Copilot Metrics API:
- Endpoint: `https://api.github.com/enterprises/{enterprise}/copilot/metrics`
- Documentation: https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-metrics?apiVersion=2022-11-28
- API Version: 2022-11-28

## Available Scripts

- `npm start` - Runs the app in development mode (same as `npm run dev`)
- `npm run dev` - Runs the app in development mode with Vite
- `npm test` - Launches the test runner in watch mode
- `npm run test:run` - Runs tests once
- `npm run test:ui` - Launches the test UI
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Deployment

This application is automatically deployed to GitHub Pages whenever changes are pushed to the main branch. The deployment is handled by GitHub Actions and the live version is available at:

https://frankburmo.github.io/github-copilot-adoption-dashboard/

### GitHub Pages Setup

The application is configured for GitHub Pages deployment with:
- Vite base path set to `/github-copilot-adoption-dashboard/`
- GitHub Actions workflow that builds and deploys the app
- No server-side components required (client-side only)

## Technology Stack

- React 19 with TypeScript
- Vite for build tooling and development server
- Chart.js with react-chartjs-2 for data visualization
- CSS for styling
- GitHub REST API for data fetching
- Vitest for testing

## Security Notes

- GitHub tokens are handled securely and never stored
- All API calls are made directly from the browser to GitHub
- No backend server required