import { createContext, useContext, useReducer } from 'react';

export const AccountContext = createContext();

export const accountReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload,
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [action.payload, ...state.accounts],
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account._id !== action.payload),
      };
      case 'UPDATE_ACCOUNT':
        return {
          ...state,
          accounts: state.accounts.map((account) =>
            account._id === action.payload._id ? action.payload : account
          ),
        };
      
    default:
      return state;
  }
};

export const AccountContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, { accounts: [] });

  return (
    <AccountContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccountContext must be used within a AccountContextProvider');
  }
  return context;
};
