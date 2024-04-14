//useAnalytics.js: Fetch and manage analytics data, such as total spend, spending by category, net worth tracking, and savings rate.
import { useContext, useCallback } from 'react';
import { AnalyticsContext } from '../contexts/AnalyticsContext';
import * as analyticsService from '../api/analyticsService';

export const useAnalytics = () => {
  const {
    totalSpend,
    spendingByCategory,
    netWorth,
    incomeVsExpenses,
    savingsRate,
    allTimeAnalytics,
    isLoading,
    error,
    dispatch,
  } = useContext(AnalyticsContext);

  const fetchAllAnalytics = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING' });

      const totalSpendData = await analyticsService.fetchTotalSpend();
      const spendingByCategoryData = await analyticsService.fetchSpendingByCategory();
      const netWorthData = await analyticsService.fetchNetWorth();
      const incomeVsExpensesData = await analyticsService.fetchIncomeVsExpenses();
      const savingsRateData = await analyticsService.fetchSavingsRate();
      const allTimeAnalyticsData = await analyticsService.fetchAllTimeAnalytics();

      dispatch({ type: 'SET_DATA', payload: { key: 'totalSpend', data: totalSpendData } });
      dispatch({
        type: 'SET_DATA',
        payload: { key: 'spendingByCategory', data: spendingByCategoryData },
      });
      dispatch({ type: 'SET_DATA', payload: { key: 'netWorth', data: netWorthData } });
      dispatch({
        type: 'SET_DATA',
        payload: { key: 'incomeVsExpenses', data: incomeVsExpensesData },
      });
      dispatch({ type: 'SET_DATA', payload: { key: 'savingsRate', data: savingsRateData } });
      dispatch({
        type: 'SET_DATA',
        payload: { key: 'allTimeAnalytics', data: allTimeAnalyticsData },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.toString() });
    }
  }, [dispatch]);

  return {
    totalSpend,
    spendingByCategory,
    netWorth,
    incomeVsExpenses,
    savingsRate,
    allTimeAnalytics,
    isLoading,
    error,
    fetchAllAnalytics,
  };
};
