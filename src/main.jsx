import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,    // 15 minutos de datos frescos en memoria
      gcTime: 1000 * 60 * 60,       // 1 hora de persistencia en caché del cliente
      refetchOnWindowFocus: false,  // NO re-consultar al cambiar de ventana o pestaña
      refetchOnMount: false,        // NO re-consultar al remontar si la caché sigue fresca
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);