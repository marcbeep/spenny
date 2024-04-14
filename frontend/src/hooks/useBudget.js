//useBudget.js: Handle budget-related functionality, like assigning money to categories, moving money between categories, and calculating the "Ready to Assign" value.
import { useContext, useCallback, useState } from 'react';
import { BudgetContext } from '../contexts/BudgetContext';
import * as budgetService from '../services/budgetService';

export const useBudget = () => {
  const { readyToAssign, dispatch } = useContext(BudgetContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReadyToAssign = useCallback(async () => {
    setIsLoading(true);
    try {
      const { readyToAssign } = await budgetService.fetchReadyToAssign();
      dispatch({ type: 'SET_READY_TO_ASSIGN', payload: readyToAssign });
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const assignMoneyToCategory = useCallback(
    async (categoryId, amount) => {
      setIsLoading(true);
      try {
        await budgetService.assignMoneyToCategory(categoryId, amount);
        // Optionally, refresh the "ready to assign" amount after successful update
        await fetchReadyToAssign();
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchReadyToAssign],
  );

  // TODO: implement moveMoneyBetweenCategories, removeMoneyFromCategory, and moveToReadyToAssign functions

  return {
    readyToAssign,
    isLoading,
    error,
    fetchReadyToAssign,
    assignMoneyToCategory,
    // Add the other functions here once implemented
  };
};
