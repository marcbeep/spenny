import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

export const fetchTotalSpend = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/totalSpend`);
  return response.data;
};

export const fetchSpendingByCategory = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/spendByCategory`);
  return response.data;
};

export const fetchNetWorth = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/networth`);
  return response.data;
};

export const fetchIncomeVsExpenses = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/incomeVsExpenses`);
  return response.data;
};

export const fetchSavingsRate = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/savingsRate`);
  return response.data;
};

export const fetchAllTimeAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/alltime`);
  return response.data;
};
