//AnalyticsContext.js: Provides access to analytics data and functions to refresh or update this data.
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as analyticsService from '../services/analyticsService';

const AnalyticsContext = createContext();

const initialState = {
  totalSpend: null,
  spendingByCategory: [],
  netWorth: null,
  incomeVsExpenses: null,
  savingsRate: null,
  allTimeAnalytics: null,
  isLoading: false,
  error: null,
};

const analyticsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true };
    case 'SET_DATA':
      return { ...state, [action.payload.key]: action.payload.data, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const AnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  const fetchData = async (key, fetchFunction) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await fetchFunction();
      dispatch({ type: 'SET_DATA', payload: { key, data } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.toString() });
    }
  };

  useEffect(() => {
    fetchData('totalSpend', analyticsService.fetchTotalSpend);
    fetchData('spendingByCategory', analyticsService.fetchSpendingByCategory);
    fetchData('netWorth', analyticsService.fetchNetWorth);
    fetchData('incomeVsExpenses', analyticsService.fetchIncomeVsExpenses);
    fetchData('savingsRate', analyticsService.fetchSavingsRate);
    fetchData('allTimeAnalytics', analyticsService.fetchAllTimeAnalytics);
  }, []);

  return (
    <AnalyticsContext.Provider value={{ ...state }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
