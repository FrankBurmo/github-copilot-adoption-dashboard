# GitHub Copilot adoption dashboard

A React-based dashboard for tracking GitHub Copilot adoption metrics for enterprises.

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

1. Clone the repository:
   ```bash
   git clone https://github.com/FrankBurmo/copilot-metrics-frontend.git
   cd copilot-metrics-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The application will open in your browser at `http://localhost:3000`.

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