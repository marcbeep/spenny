import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

// Set up Axios for Authorization header globally or per request based on user's token.
// This setup is assumed and should be adapted to the authentication handling.

export const getCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/categories`);
  return response.data;
};

export const getCategoryById = async (categoryId) => {
  const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}`);
  return response.data;
};

export const addCategory = async (categoryData) => {
  const response = await axios.post(`${API_BASE_URL}/categories`, categoryData);
  return response.data;
};

export const updateCategory = async (categoryId, updateData) => {
  // updateData should contain the new title or other fields to be updated
  const response = await axios.patch(`${API_BASE_URL}/categories/${categoryId}`, updateData);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await axios.delete(`${API_BASE_URL}/categories/${categoryId}`);
  return response.data; 
};
