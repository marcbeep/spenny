//useCategories.js: For operations related to categories, such as fetching, adding, deleting, and updating categories, as well as assigning money to categories.

import { useCallback } from 'react';
import { useCategoriesContext } from '../contexts/CategoriesContext';
import { 
  addCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory
} from '../api/categoryService';

export const useCategories = () => {
  const { dispatch } = useCategoriesContext();

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await getCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [dispatch]);

  const createCategory = useCallback(async (title) => {
    try {
      const category = await addCategory({ title });
      dispatch({ type: 'ADD_CATEGORY', payload: category });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }, [dispatch]);

  const modifyCategory = useCallback(async (id, title) => {
    try {
      const updatedCategory = await updateCategory(id, { title });
      dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }, [dispatch]);

  const removeCategory = useCallback(async (id, newCategoryId) => {
    try {
      await deleteCategory(id, newCategoryId);
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
      // Note: might need to refresh categories to reflect reassignment
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }, [dispatch]);

  return { 
    fetchCategories, 
    createCategory, 
    modifyCategory, 
    removeCategory 
  };
};
