import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

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
  const response = await axios.patch(`${API_BASE_URL}/categories/${categoryId}`, updateData);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await axios.delete(`${API_BASE_URL}/categories/${categoryId}`);
  return response.data;
};
