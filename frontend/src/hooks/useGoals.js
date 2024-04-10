//useGoals.js: For creating, fetching, updating, and deleting goals associated with categories.
import { useCallback, useContext } from 'react';
import { GoalsContext } from '../contexts/GoalsContext';
import * as goalsService from '../api/goalsService';

export const useGoals = () => {
  const { goals, dispatch, isLoading, error } = useContext(GoalsContext);

  const fetchGoals = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await goalsService.fetchAllGoals();
      dispatch({ type: 'SET_GOALS', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [dispatch]);

  const createGoal = useCallback(async (goalData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const newGoal = await goalsService.createGoal(goalData);
      dispatch({ type: 'ADD_GOAL', payload: newGoal });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [dispatch]);

  const updateGoal = useCallback(async (goalId, updateData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const updatedGoal = await goalsService.updateGoal(goalId, updateData);
      dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [dispatch]);

  const deleteGoal = useCallback(async (goalId) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      await goalsService.deleteGoal(goalId);
      dispatch({ type: 'DELETE_GOAL', payload: goalId });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [dispatch]);

  // TODO: add methods for other goal-related functionalities as needed

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };
};
