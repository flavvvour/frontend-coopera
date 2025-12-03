import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { App } from './app/App';
import '@/app/styles/index.css';

// Инициализация Sentry (только для production)
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN, // Добавь в .env
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0, // Процент трейсов для отправки
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  });
}

// Настройка React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Не перезагружать при фокусе окна
      retry: 1, // Повторять запрос 1 раз при ошибке
      staleTime: 5 * 60 * 1000, // Данные актуальны 5 минут
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
