import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { TransactionContextProvider } from './context/TransactionContext';
import { AccountContextProvider } from './context/AccountContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <AccountContextProvider>
      <TransactionContextProvider>
        <App />
      </TransactionContextProvider>
      </AccountContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
);
