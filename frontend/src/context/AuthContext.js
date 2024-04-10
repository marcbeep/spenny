//AuthContext.js: Stores user authentication state and provides functions for logging in, logging out, and checking authentication status.

import { createContext, useReducer, useEffect } from 'react';

export const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'AUTH_READY':
      return { ...state, user: action.payload, authIsReady: true };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null, authIsReady: false });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      dispatch({ type: 'AUTH_READY', payload: user });
    } else {
      // Explicitly mark auth as ready even if no user is found to handle cases where
      // the app needs to know it can proceed without a logged-in user.
      dispatch({ type: 'AUTH_READY', payload: null });
    }
  }, []);

  return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>;
};
