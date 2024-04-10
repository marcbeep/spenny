import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

// Set the Authorization header for all requests
axios.defaults.headers.common['Authorization'] = '';

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const fetchAccounts = async () => {
  const response = await axios.get(`${API_BASE_URL}/accounts`);
  return response.data;
};

export const fetchAccountById = async (accountId) => {
  const response = await axios.get(`${API_BASE_URL}/accounts/${accountId}`);
  return response.data;
};

export const addAccount = async (accountData) => {
  const response = await axios.post(`${API_BASE_URL}/accounts`, accountData);
  return response.data;
};

export const updateAccount = async (accountId, updateData) => {
  const response = await axios.patch(`${API_BASE_URL}/accounts/${accountId}`, updateData);
  return response.data;
};

export const moveMoneyBetweenAccounts = async (fromAccountId, toAccountId, amount) => {
  const response = await axios.post(`${API_BASE_URL}/accounts/moveMoney`, {
    fromAccountId,
    toAccountId,
    amount,
  });
  return response.data;
};

export const archiveAccount = async (accountId) => {
  const response = await axios.post(`${API_BASE_URL}/accounts/archive/${accountId}`);
  return response.data;
};

export const fetchTotalBalanceAPI = async () => {
  const response = await axios.get(`${API_BASE_URL}/account/totalBalance`);
  return response.data;
};
