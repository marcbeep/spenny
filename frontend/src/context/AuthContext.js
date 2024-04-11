// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserAPI, signupUserAPI } from '../api/authService';
import { setAuthToken } from '../utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      setAuthState({ ...authState, isAuthenticated: true, token });
      // Optionally, fetch user details here and update the authState with user details
    }
  }, []);

  const loginUser = async (email, password) => {
    try {
      const { token, email: userEmail, ...userDetails } = await loginUserAPI(email, password);
      localStorage.setItem('token', token);
      setAuthToken(token);
      setAuthState({ token, isAuthenticated: true, user: { email: userEmail, ...userDetails } });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signupUser = async (email, password) => {
    try {
      const { token, email: userEmail, ...userDetails } = await signupUserAPI(email, password);
      localStorage.setItem('token', token);
      setAuthToken(token);
      setAuthState({ token, isAuthenticated: true, user: { email: userEmail, ...userDetails } });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setAuthState({ token: null, isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, loginUser, signupUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
