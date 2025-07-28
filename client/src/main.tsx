import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/i18n';
import { InterceptorsService } from './services/api/interceptors.service';
import './styles/global.scss';
import AppProviders from './AppProviders';
import App from './App';

InterceptorsService.setupInterceptors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);

