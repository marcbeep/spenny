//CategoriesContext.js: Manages the state related to categories and their operations.

import { createContext, useContext, useReducer } from 'react';

export const CategoriesContext = createContext();

const categoriesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category,
        ),
      };
    case 'DELETE_CATEGORY':
      // Assuming delete means removing from the list for UI purposes, actual deletion handled by API
      return {
        ...state,
        categories: state.categories.filter((category) => category._id !== action.payload),
      };
    default:
      return state;
  }
};

export const CategoriesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(categoriesReducer, { categories: [] });

  return (
    <CategoriesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategoriesContext = () => useContext(CategoriesContext);
