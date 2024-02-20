import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import backendURL from '../config';
import { useAuthContext } from '../hooks/useAuthContext';

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
  const [state, dispatch] = useReducer(budgetReducer, { readyToAssign: 0 });
  const { user } = useAuthContext();

  const fetchReadyToAssign = useCallback(async () => {
    if (user && user.token) {
      try {
        const response = await fetch(`${backendURL}/budget/readyToAssign`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
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
  }, [user?.token]); // Depend on user.token to re-fetch when the user or token changes

  useEffect(() => {
    fetchReadyToAssign();
  }, [fetchReadyToAssign]); // Depend on fetchReadyToAssign to re-fetch when the function changes

  return (
    <BudgetContext.Provider value={{ ...state, dispatch, fetchReadyToAssign }}>
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
