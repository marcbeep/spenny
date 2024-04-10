import axios from 'axios';
import backendURL from '../config';

const API_BASE_URL = backendURL;

export const fetchAllGoals = async () => {
  const response = await axios.get(`${API_BASE_URL}/goals`);
  return response.data;
};

export const fetchGoalById = async (goalId) => {
  const response = await axios.get(`${API_BASE_URL}/goals/${goalId}`);
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await axios.post(`${API_BASE_URL}/goals`, goalData);
  return response.data;
};

export const updateGoal = async (goalId, updateData) => {
  const response = await axios.patch(`${API_BASE_URL}/goals/${goalId}`, updateData);
  return response.data;
};

export const deleteGoal = async (goalId) => {
  const response = await axios.delete(`${API_BASE_URL}/goals/${goalId}`);
  return response.data; 
};
