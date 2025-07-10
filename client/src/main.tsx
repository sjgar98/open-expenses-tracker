import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/i18n';
import AppProviders from './AppProviders';
import App from './App';

import './styles/global.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);

