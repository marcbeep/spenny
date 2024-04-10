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
  // goalData should include details like goalCategory, goalType, goalTarget, goalCurrent, goalDeadline
  const response = await axios.post(`${API_BASE_URL}/goals`, goalData);
  return response.data;
};

export const updateGoal = async (goalId, updateData) => {
  // updateData can include changes to goalType, goalTarget, goalDeadline, etc.
  const response = await axios.patch(`${API_BASE_URL}/goals/${goalId}`, updateData);
  return response.data;
};

export const deleteGoal = async (goalId) => {
  const response = await axios.delete(`${API_BASE_URL}/goals/${goalId}`);
  return response.data; 
};
