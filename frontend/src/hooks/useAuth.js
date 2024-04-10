import { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext';
import { loginUserAPI, signupUserAPI } from '../api/authService';
import { setAuthToken } from '../utils/axiosConfig';

export const useAuth = () => {
  const navigate = useNavigate(); 
  const { dispatch } = useContext(AuthContext);

  const login = useCallback(async (email, password) => {
    try {
      const { email: userEmail, token } = await loginUserAPI(email, password); 
      const user = { email: userEmail }; 
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token); 
      setAuthToken(token); 
      navigate('/placeholder');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [dispatch, navigate]);
  

  const signup = useCallback(async (email, password) => {
    try {
      const { email: userEmail, token, profilePicture } = await signupUserAPI(email, password);
      const user = { email: userEmail, profilePicture }; 
      dispatch({ type: 'LOGIN', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setAuthToken(token);
      navigate('/placeholder');
    } catch (error) {
      console.error('Signup failed:', error.message);
      throw error;
    }
  }, [dispatch, navigate]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthToken(null); 
    navigate('/'); 
  }, [dispatch, navigate]);

  return { login, logout, signup };
};
