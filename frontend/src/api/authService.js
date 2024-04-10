import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

export const loginUserAPI = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : 'Network error');
    throw error;
  }
};

