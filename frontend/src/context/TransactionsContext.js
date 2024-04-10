//TransactionsContext.js: Holds the state for transactions and includes functionality for CRUD operations on transactions.

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import * as transactionService from '../api/transactionService';

const TransactionsContext = createContext();

// Reducer to handle different actions related to transactions
const transactionsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction._id === action.payload._id ? action.payload : transaction
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction._id !== action.payload),
      };
    default:
      return state;
  }
};

export const TransactionsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionsReducer, { transactions: [] });

  // Fetch all transactions
  const loadTransactions = useCallback(async () => {
    try {
      const transactions = await transactionService.getTransactions();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);

  // Context value that will be provided to any consuming components
  const contextValue = {
    ...state,
    dispatch,
    loadTransactions,
  };

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
};

// Custom hook to use the transactions context
export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
