import { createContext, useContext, useReducer } from 'react';

export const AccountContext = createContext();

const accountReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [action.payload, ...state.accounts] };
    case 'ARCHIVE_ACCOUNT':
      // Adjust to mark an account as archived instead of removing it
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account._id === action.payload ? { ...account, accountStatus: 'archived' } : account
        ),
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account._id === action.payload._id ? action.payload : account
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

  // fetchTotalBalance function removed. Use a custom hook to interact with the API and dispatch actions instead.

  return (
    <AccountContext.Provider value={{ ...state, dispatch }}>
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
