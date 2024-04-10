// Inside useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUserAPI, signupUserAPI } from '../api/authService';
import { setAuthToken } from '../utils/axiosConfig';

export const useAuth = () => {
  const { dispatch } = useContext(AuthContext);

  const login = useCallback(async (email, password) => {
    try {
      const { email: userEmail, token } = await loginUserAPI(email, password);
      const user = { email: userEmail };
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setAuthToken(token);
      return true; // Indicate success
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [dispatch]);

  const signup = useCallback(async (email, password) => {
    try {
      const { email: userEmail, token, profilePicture } = await signupUserAPI(email, password);
      const user = { email: userEmail, profilePicture };
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setAuthToken(token);
      return true; // Indicate success
    } catch (error) {
      console.error('Signup failed:', error.message);
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthToken(null);
  }, [dispatch]);

  return { login, logout, signup };
};
