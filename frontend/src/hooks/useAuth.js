// useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { loginUserAPI } from '../api/authService';
import { setAuthToken } from '../utils/axiosConfig';

export const useAuth = () => {
  const { user, authIsReady, dispatch } = useContext(AuthContext);

  const login = useCallback(async (email, password) => {
    try {
      const { user, token } = await loginUserAPI(email, password); // Assumes loginUserAPI returns { user, token } - Also profilePictureUrl
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token); // Store token separately
      setAuthToken(token); // Set token in Axios headers
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthToken(null); // Remove token from Axios headers
    // TODO: Redirect & perform additional cleanup 
  }, [dispatch]);

  return { login, logout, isAuthReady: authIsReady, user };
};

