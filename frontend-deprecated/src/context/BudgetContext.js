//BudgetContext.js: Manages the overall budget state, including the allocation of funds to categories and tracking of "Ready to Assign" funds.

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as budgetService from '../api/budgetService';

const BudgetContext = createContext();

const initialState = {
  readyToAssign: 0,
  isLoading: false,
  error: null,
};

const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_READY_TO_ASSIGN':
      return { ...state, readyToAssign: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: true };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  const fetchReadyToAssign = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await budgetService.fetchReadyToAssign();
      dispatch({ type: 'SET_READY_TO_ASSIGN', payload: data.readyToAssign });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  useEffect(() => {
    fetchReadyToAssign();
  }, []);

  return (
    <BudgetContext.Provider value={{ ...state, fetchReadyToAssign }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
