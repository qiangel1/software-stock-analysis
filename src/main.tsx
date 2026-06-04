import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import App from './App';
import { theme } from './theme';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

/**
 * StockQuant Application Entry Point
 * 
 * Initializes React application with:
 * - Theme provider for MUI
 * - Browser router for navigation
 * - Global error boundary
 * - Toast notifications
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <Toaster
            position="top-center"
            expand={false}
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, ignore
    });
  });
}

// Log application startup
console.info(
  '%c StockQuant %c 智能股票量化分析系统 ',
  'background:#0ea5e9;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;',
  'background:#0284c7;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;'
);
