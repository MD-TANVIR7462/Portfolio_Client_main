import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { ScrollToTopOnRoute } from './components/common/ScrollToTopOnRoute';

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnRoute />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '13px',
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
