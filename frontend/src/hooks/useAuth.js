//useAuth.js: Manage authentication states, including login, logout, and user session management.

import { useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';

// Assuming you have a utility/API service to handle HTTP requests
import { loginUserAPI, logoutUserAPI } from '../api/authService';

export const useAuth = () => {
  const { user, authIsReady, dispatch } = useContext(AuthContext);

  const login = useCallback(async (email, password) => {
    try {
      // Assuming loginUserAPI is a function that returns user data on successful login
      const userData = await loginUserAPI(email, password);
      dispatch({ type: 'LOGIN', payload: userData });
      
      // Store user (or preferably a user token) in local storage
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (e.g., wrong credentials, server error)
      // This could involve setting an error state, which you could also manage in your AuthContext
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
    // Assuming you might need to call an API for logging out
    logoutUserAPI().catch(error => console.error('Logout failed:', error));
  }, [dispatch]);

  const isAuthReady = useCallback(() => {
    return authIsReady;
  }, [authIsReady]);

  // Additional functionality can be added here, such as refresh tokens, 
  // handling session timeouts, or registering new users.

  return { login, logout, isAuthReady, user };
};
