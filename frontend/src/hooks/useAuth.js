import { useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { loginUserAPI } from '../api/authService';

export const useAuth = () => {
  const { user, authIsReady, dispatch } = useContext(AuthContext);

  const login = useCallback(async (email, password) => {
    try {
      const userData = await loginUserAPI(email, password);
      dispatch({ type: 'LOGIN', payload: userData });
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Propagate the error for handling at the calling site, such as displaying an error message.
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
    // Redirect or perform additional cleanup if necessary
  }, [dispatch]);

  return { login, logout, isAuthReady: authIsReady, user };
};
