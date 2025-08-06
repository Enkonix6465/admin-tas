import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App.tsx';
import './index.css';

// Type declaration for warning suppression flag
declare global {
  interface Window {
    __rbdWarningLogged?: boolean;
  }
}

// Suppress react-beautiful-dnd defaultProps warning (known issue with React 18+)
// Only suppress in development mode to maintain production debugging capabilities
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;

  // Override console.warn
  console.warn = (...args) => {
    // Convert all arguments to strings for comprehensive checking
    const fullMessage = args.map(arg =>
      typeof arg === 'string' ? arg : String(arg)
    ).join(' ');

    // Check for react-beautiful-dnd defaultProps warnings
    if (
      fullMessage.includes('Support for defaultProps will be removed from memo components') ||
      fullMessage.includes('defaultProps will be removed') ||
      fullMessage.includes('Connect(Droppable)') ||
      fullMessage.includes('Connect(Draggable)') ||
      (fullMessage.includes('defaultProps') && fullMessage.includes('memo'))
    ) {
      // Log once that we're suppressing these warnings
      if (!window.__rbdWarningLogged) {
        window.__rbdWarningLogged = true;
        console.info('🔇 Suppressing react-beautiful-dnd defaultProps warnings (known React 18+ compatibility issue)');
      }
      return;
    }

    originalWarn.apply(console, args);
  };

  // Override console.error for warnings that might appear as errors
  console.error = (...args) => {
    const fullMessage = args.map(arg =>
      typeof arg === 'string' ? arg : String(arg)
    ).join(' ');

    if (
      fullMessage.includes('Support for defaultProps will be removed from memo components') ||
      fullMessage.includes('Connect(Droppable)') ||
      fullMessage.includes('Connect(Draggable)')
    ) {
      return;
    }

    originalError.apply(console, args);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
