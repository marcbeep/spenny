import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { TransactionContextProvider } from './context/TransactionContext';
import { AccountContextProvider } from './context/AccountContext';
import { CategoryContextProvider } from './context/CategoryContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <AccountContextProvider>
        <TransactionContextProvider>
          <CategoryContextProvider> 
            <App />
          </CategoryContextProvider>
        </TransactionContextProvider>
      </AccountContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
);
