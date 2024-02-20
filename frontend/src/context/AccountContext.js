import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import backendURL from '../config';

export const AccountContext = createContext();

const accountReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [action.payload, ...state.accounts] };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((account) => account._id !== action.payload),
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((account) =>
          account._id === action.payload._id ? action.payload : account,
        ),
      };
    case 'SET_TOTAL_BALANCE':
      return { ...state, totalBalance: action.payload };
    default:
      return state;
  }
};

export const AccountContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, { accounts: [], totalBalance: 0 });
  const { user } = useAuthContext();

  const fetchTotalBalance = useCallback(async () => {
    if (user && user.token) {
      try {
        const response = await fetch(`${backendURL}/account/totalBalance`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        if (response.ok) {
          dispatch({ type: 'SET_TOTAL_BALANCE', payload: data.totalBalance });
        } else {
          console.error('Failed to fetch total balance');
        }
      } catch (error) {
        console.error('Error fetching total balance:', error);
      }
    }
  }, [user?.token]); // Depend on user.token to re-fetch when the user or token changes

  useEffect(() => {
    fetchTotalBalance();
  }, [fetchTotalBalance]); // Depend on fetchTotalBalance to re-fetch when the function or its dependencies change

  return (
    <AccountContext.Provider value={{ ...state, dispatch, fetchTotalBalance }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccountContext must be used within an AccountContextProvider');
  }
  return context;
};
