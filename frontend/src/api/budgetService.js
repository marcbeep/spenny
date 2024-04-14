import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

export const fetchReadyToAssign = async () => {
  const response = await axios.get(`${API_BASE_URL}/budget/readyToAssign`);
  return response.data;
};

export const assignMoneyToCategory = async (categoryId, amount) => {
  const response = await axios.post(`${API_BASE_URL}/budget/assignToCategory`, {
    categoryId,
    amount,
  });
  return response.data;
};

export const moveMoneyBetweenCategories = async (fromCategoryId, toCategoryId, amount) => {
  const response = await axios.post(`${API_BASE_URL}/budget/moveBetweenCategories`, {
    fromCategoryId,
    toCategoryId,
    amount,
  });
  return response.data;
};

export const removeMoneyFromCategory = async (categoryId, amount) => {
  const response = await axios.post(`${API_BASE_URL}/budget/removeFromCategories`, {
    categoryId,
    amount,
  });
  return response.data;
};

export const moveToReadyToAssign = async (categoryId, amount) => {
  const response = await axios.post(`${API_BASE_URL}/budget/moveToReadyToAssign`, {
    categoryId,
    amount,
  });
  return response.data;
};
