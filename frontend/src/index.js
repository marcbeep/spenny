import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { TransactionContextProvider } from './context/TransactionContext';
import { AccountContextProvider } from './context/AccountContext';
import { CategoryContextProvider } from './context/CategoryContext'; 
import { BudgetContextProvider } from './context/BudgetContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <BudgetContextProvider>
        <AccountContextProvider>
          <TransactionContextProvider>
           <CategoryContextProvider> 
            <App />
          </CategoryContextProvider>
        </TransactionContextProvider>
      </AccountContextProvider>
     </BudgetContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
);
