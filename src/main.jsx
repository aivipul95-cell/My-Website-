import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { PagesProvider } from './context/PagesContext';
import { ConfirmProvider } from './context/ConfirmContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <SettingsProvider>
        <PagesProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </PagesProvider>
      </SettingsProvider>
    </HashRouter>
  </React.StrictMode>,
);
