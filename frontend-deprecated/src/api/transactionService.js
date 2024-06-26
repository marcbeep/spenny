import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

export const getTransactions = async () => {
  const response = await axios.get(`${API_BASE_URL}/transactions`);
  return response.data;
};

export const getTransactionById = async (transactionId) => {
  const response = await axios.get(`${API_BASE_URL}/transactions/${transactionId}`);
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData);
  return response.data;
};

export const updateTransaction = async (transactionId, updateData) => {
  const response = await axios.patch(`${API_BASE_URL}/transactions/${transactionId}`, updateData);
  return response.data;
};

export const deleteTransaction = async (transactionId) => {
  const response = await axios.delete(`${API_BASE_URL}/transactions/${transactionId}`);
  return response.data;
};

export const analyzeReceipt = async (imageData) => {
  const response = await axios.post(`${API_BASE_URL}/transactions/ai`, imageData);
  return response.data;
};
