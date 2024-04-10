import axios from 'axios';
import backendURL from '../config';

// Set up the base URL for API requests
const API_BASE_URL = backendURL;

// Function to handle user login
export const loginUserAPI = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response.data);
    throw error;
  }
};

// Function to handle user logout
export const logoutUserAPI = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/logout`);
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error.response.data);
    throw error;
  }
};
