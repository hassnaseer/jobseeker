import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';
import '@/i18n/config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeModeProvider>
          <App />
        </ThemeModeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
