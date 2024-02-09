import React, { createContext, useContext, useReducer } from 'react';

// Define the initial state of the budget context
const initialState = {
  totalAvailable: 0,
  totalAssigned: 0,
  readyToAssign: 0,
  categories: [], // Assuming you want to manage categories here as well
};

// Create a context
export const BudgetContext = createContext();

// Define a reducer function for managing state changes
export const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BUDGET':
      return {
        ...state,
        totalAvailable: action.payload.totalAvailable,
        totalAssigned: action.payload.totalAssigned,
        readyToAssign: action.payload.readyToAssign,
      };
    case 'UPDATE_CATEGORY_ASSIGNMENT':
      // Implementation depends on how you want to update categories
      return state; // Placeholder return
    case 'ADD_FUNDS_TO_CATEGORY':
    case 'REMOVE_FUNDS_FROM_CATEGORY':
      // Handle adding or removing funds to/from categories
      return state; // Placeholder return
    default:
      return state;
  }
};

// Define a provider component
export const BudgetContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  return (
    <BudgetContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
};

// Hook for consuming context
export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetContextProvider');
  }
  return context;
};
