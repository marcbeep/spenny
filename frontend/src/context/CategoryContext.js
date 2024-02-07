import { createContext, useContext, useReducer } from 'react';

export const CategoryContext = createContext();

const categoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [action.payload, ...state.categories],
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category._id !== action.payload),
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        ),
      };
    default:
      return state;
  }
};

export const CategoryContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(categoryReducer, { categories: [] });

  return (
    <CategoryContext.Provider value={{ ...state, dispatch }}>
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
