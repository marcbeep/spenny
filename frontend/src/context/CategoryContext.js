import { createContext, useContext, useReducer, useEffect } from 'react';
import backendURL from '../config';
import { useAuthContext } from '../hooks/useAuthContext'; 

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
  const { user } = useAuthContext(); // Access user context to get the current user

  useEffect(() => {
    const fetchCategories = async () => {
      if (user && user.token) { // Ensure there's a user token available
        try {
          const response = await fetch(`${backendURL}/category`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
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
    };

    fetchCategories();
  }, [user]); // Depend on user to re-fetch when the user logs in/out

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
