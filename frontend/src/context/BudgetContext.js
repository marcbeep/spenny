import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContext } from './AuthContext'; // Adjust the import path as necessary

const initialState = {
  readyToAssign: 0,
};

export const BudgetContext = createContext();

const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_READY_TO_ASSIGN':
      return {
        ...state,
        readyToAssign: action.payload,
      };
    default:
      return state;
  }
};

export const BudgetContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const { user } = useContext(AuthContext); // Use AuthContext to get the current user

  // Function to fetch "ready to assign" funds from the backend
  const fetchReadyToAssign = async () => {
    if (!user) return; // Ensure there's a user and token available
    try {
      const response = await fetch('/budget/readyToAssign', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`, // Use the token from AuthContext
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch ready to assign funds');
      }
      const data = await response.json();
      dispatch({ type: 'SET_READY_TO_ASSIGN', payload: data.readyToAssign });
      console.log(`${data.readyToAssign} ready to assign funds fetched`);
    } catch (error) {
      console.error('Error fetching ready to assign funds:', error);
    }
  };

  useEffect(() => {
    fetchReadyToAssign();
  }, [user]); // Rerun when the user changes

  return (
    <BudgetContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetContextProvider');
  }
  return context;
};
