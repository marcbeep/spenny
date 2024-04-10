// useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUserAPI, signupUserAPI } from '../api/authService';
import { setAuthToken } from '../utils/axiosConfig';

export const useAuth = () => {
  const { user, authIsReady, dispatch } = useContext(AuthContext);

  const login = useCallback(async (email, password) => {
    try {
      const { email: userEmail, token } = await loginUserAPI(email, password); // Assumes loginUserAPI returns { email, token }
      const user = { email: userEmail }; // Construct the user object if needed
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token); // Store token separately
      setAuthToken(token); // Set token in Axios headers
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [dispatch]);
  

  const signup = useCallback(async (email, password) => {
    try {
      const { user, token } = await signupUserAPI(email, password);
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setAuthToken(token);
    } catch (error) {
      console.error('Signup failed:', error.message);
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

  return { login, logout, signup, isAuthReady: authIsReady, user };
};

