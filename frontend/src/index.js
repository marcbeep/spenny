import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { TransactionsProvider } from './context/TransactionsContext';
import { AccountContextProvider } from './context/AccountsContext';
import { CategoriesContextProvider } from './context/CategoriesContext';
import { BudgetProvider } from './context/BudgetContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <BudgetProvider>
        <AccountContextProvider>
          <TransactionsProvider>
            <CategoriesContextProvider>
              <App />
            </CategoriesContextProvider>
          </TransactionsProvider>
        </AccountContextProvider>
      </BudgetProvider>
    </AuthContextProvider>
  </React.StrictMode>,
);
