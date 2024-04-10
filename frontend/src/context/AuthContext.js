//AuthContext.js: Stores user authentication state and provides functions for logging in, logging out, and checking authentication status.

import { createContext, useReducer, useEffect } from 'react';
import { setAuthToken } from '../utils/axiosConfig'; 

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
    const token = localStorage.getItem('token');
    if (user && token) {
      setAuthToken(token); // Set Axios Authorization header if token exists
      dispatch({ type: 'AUTH_READY', payload: user });
    } else {
      dispatch({ type: 'AUTH_READY', payload: null });
    }
  }, []);

  return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>;
};
