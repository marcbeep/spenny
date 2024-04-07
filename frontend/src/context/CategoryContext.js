import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import backendURL from '../config';
import { useAuthContext } from '../hooks/useAuthContext';

export const CategoryContext = createContext();

const categoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [action.payload, ...state.categories] };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((category) => category._id !== action.payload),
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category,
        ),
      };
    case 'UPDATE_CATEGORIES_AFTER_MOVE':
      return {
        ...state,
        categories: state.categories.map((category) => {
          if (category._id === action.payload.fromCategoryId) {
            return { ...category, available: category.available - action.payload.amount };
          } else if (category._id === action.payload.toCategoryId) {
            return { ...category, available: category.available + action.payload.amount };
          }
          return category;
        }),
      };
    default:
      return state;
  }
};

export const CategoryContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(categoryReducer, { categories: [] });
  const { user } = useAuthContext();

  const fetchCategories = useCallback(async () => {
    if (user && user.token) {
      try {
        const response = await fetch(`${backendURL}/category`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        if (response.ok) {
          dispatch({ type: 'SET_CATEGORIES', payload: data });
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
  }, [user?.token]); // Updated to depend on user.token

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider value={{ ...state, dispatch, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategoryContext must be used within a CategoryContextProvider');
  }
  return context;
};
