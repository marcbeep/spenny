// Inside useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUserAPI, signupUserAPI } from '../api/authService';
import { setAuthToken } from '../utils/axiosConfig';

export const useAuth = () => {
  const { user, dispatch } = useContext(AuthContext); // Destructure `user` from the context

  const login = useCallback(async (email, password) => {
    try {
      const { email: userEmail, token } = await loginUserAPI(email, password);
      const userPayload = { email: userEmail }; // Use a different name to avoid confusion with `user` from context
      dispatch({ type: 'LOGIN', payload: userPayload });
      localStorage.setItem('user', JSON.stringify(userPayload));
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
      const userPayload = { email: userEmail, profilePicture }; // Same here, use `userPayload` to avoid naming conflict
      dispatch({ type: 'LOGIN', payload: userPayload });
      localStorage.setItem('user', JSON.stringify(userPayload));
      localStorage.setItem('token', token);
      setAuthToken(token);
      return true; 
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

  return { user, login, logout, signup };
};
