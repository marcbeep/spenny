import React, { createContext, useContext, useReducer } from 'react';

// Define the initial state of the budget context
const initialState = {
  totalAvailable: 0,
  totalAssigned: 0,
  readyToAssign: 0,
  categories: [], // Assuming you want to manage categories here as well
};

// Create a context
export const BudgetContext = createContext();

// Define a reducer function for managing state changes
// Define a reducer function for managing state changes
export const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BUDGET':
      return {
        ...state,
        totalAvailable: action.payload.totalAvailable,
        totalAssigned: action.payload.totalAssigned,
        readyToAssign: action.payload.readyToAssign,
        categories: action.payload.categories, // Ensure categories are updated
      };
    case 'UPDATE_CATEGORY_ASSIGNMENT':
      // Assuming action.payload has { categoryId, amountAssigned }
      const updatedCategories = state.categories.map(category => {
        if (category.id === action.payload.categoryId) {
          const newAssignedAmount = category.assignedAmount + action.payload.amountAssigned;
          return {
            ...category,
            assignedAmount: newAssignedAmount,
            available: category.available + action.payload.amountAssigned, // Assuming this logic fits your needs
          };
        }
        return category;
      });
      return {
        ...state,
        categories: updatedCategories,
        // Update totalAssigned and readyToAssign as needed
      };
    case 'MOVE_FUNDS_BETWEEN_CATEGORIES':
      // Assuming action.payload has { fromCategoryId, toCategoryId, amount }
      const categoriesAfterMovingFunds = state.categories.map(category => {
        if (category.id === action.payload.fromCategoryId) {
          return {
            ...category,
            assignedAmount: category.assignedAmount - action.payload.amount,
            available: category.available - action.payload.amount,
          };
        }
        if (category.id === action.payload.toCategoryId) {
          return {
            ...category,
            assignedAmount: category.assignedAmount + action.payload.amount,
            available: category.available + action.payload.amount,
          };
        }
        return category;
      });
      return {
        ...state,
        categories: categoriesAfterMovingFunds,
      };
      case 'ADD_FUNDS_TO_CATEGORY':
        // Assuming action.payload has { categoryId, amount }
        const categoriesAfterAddingFunds = state.categories.map(category => {
          if (category.id === action.payload.categoryId) {
            // Increase the assignedAmount and available by the specified amount
            return {
              ...category,
              assignedAmount: category.assignedAmount + action.payload.amount,
              available: category.available + action.payload.amount,
            };
          }
          return category;
        });
        return {
          ...state,
          categories: categoriesAfterAddingFunds,
          totalAssigned: state.totalAssigned + action.payload.amount,
          readyToAssign: state.readyToAssign - action.payload.amount,
        };
  
      case 'REMOVE_FUNDS_FROM_CATEGORY':
        // Assuming action.payload has { categoryId, amount }
        const categoriesAfterRemovingFunds = state.categories.map(category => {
          if (category.id === action.payload.categoryId) {
            // Decrease the assignedAmount and available by the specified amount
            return {
              ...category,
              assignedAmount: category.assignedAmount - action.payload.amount,
              available: category.available - action.payload.amount,
            };
          }
          return category;
        });
        return {
          ...state,
          categories: categoriesAfterRemovingFunds,
          totalAssigned: state.totalAssigned - action.payload.amount,
          readyToAssign: state.readyToAssign + action.payload.amount,
        };
    // Implement cases for handling transactions that affect category funds
    default:
      return state;
  }
};

// Define a provider component
export const BudgetContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  return (
    <BudgetContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
};

// Hook for consuming context
export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetContextProvider');
  }
  return context;
};
