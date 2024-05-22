import axios from 'axios';

export const setAuthToken = (token) => {
  if (token) {
    // Apply the token to every request header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Delete the auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};
