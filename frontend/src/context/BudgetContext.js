// TODO: set budget, add funds to category, move funds between categories, remove funds from category 

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import backendURL from '../config';
import { useAuthContext } from '../hooks/useAuthContext'; 

export const BudgetContext = createContext();

// Define the actions and the reducer function
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

// Define the BudgetContextProvider
export const BudgetContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, { readyToAssign: 0 });
  const { user } = useAuthContext(); // Use AuthContext to access the user and token

  // Function to fetch "Ready to Assign" amount
  const fetchReadyToAssign = async () => {
    if (user && user.token) {
      try {
        const response = await fetch(`${backendURL}/budget/readyToAssign`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          dispatch({ type: 'SET_READY_TO_ASSIGN', payload: data.readyToAssign });
        } else {
          console.error('Failed to fetch ready to assign amount');
        }
      } catch (error) {
        console.error('Error fetching ready to assign amount:', error);
      }
    }
  };

  // Use useEffect to fetch the "Ready to Assign" amount when the component mounts
  // and when the user changes (logs in/out)
  useEffect(() => {
    fetchReadyToAssign();
  }, [user]); // Depend on user to re-fetch when the user logs in/out

  return (
    <BudgetContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
};

// Define a hook for easy context consumption
export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetContextProvider');
  }
  return context;
};
