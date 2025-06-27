import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

// Mock Chart.js to avoid errors during testing
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Chart Placeholder</div>,
}));

test('renders GitHub Copilot Metrics heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/GitHub Copilot Metrics/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders form inputs', () => {
  render(<App />);
  const tokenInput = screen.getByLabelText(/GitHub Token/i);
  const enterpriseInput = screen.getByLabelText(/Enterprise/i);
  const submitButton = screen.getByRole('button', { name: /Get Metrics/i });
  
  expect(tokenInput).toBeInTheDocument();
  expect(enterpriseInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});