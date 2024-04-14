//GoalsContext.js: Manages goal-related state and operations, allowing for goal creation, updates, and deletion.
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as goalsService from '../api/goalsService';

const GoalsContext = createContext();

const initialState = {
  goals: [],
  isLoading: false,
  error: null,
};

const goalsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.payload, isLoading: false, error: null };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload], isLoading: false };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((goal) => (goal._id === action.payload._id ? action.payload : goal)),
        isLoading: false,
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((goal) => goal._id !== action.payload),
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: true };
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

export const GoalsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(goalsReducer, initialState);

  const fetchGoals = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await goalsService.fetchAllGoals();
      dispatch({ type: 'SET_GOALS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Context value that will be provided to consuming components
  const contextValue = {
    ...state,
    dispatch,
    fetchGoals,
  };

  return <GoalsContext.Provider value={contextValue}>{children}</GoalsContext.Provider>;
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
