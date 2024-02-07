import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useCategoryContext } from '../context/CategoryContext';
import backendURL from '../config';

const CategoryModal = ({ isOpen, closeModal, editingCategory }) => {
    const initialState = { name: '', available: 0, activity: 0 };
    const [formData, setFormData] = useState(initialState);
    const [formErrors, setFormErrors] = useState({});
    const { user } = useAuthContext();
    const { dispatch } = useCategoryContext();
  
    useEffect(() => {
      setFormData(editingCategory ? editingCategory : initialState);
    }, [editingCategory, initialState]);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const validateForm = () => {
      const errors = {};
      if (!formData.name) errors.name = 'Name is required';
      if (isNaN(formData.available) || formData.available < 0) errors.available = 'Available funds must be a non-negative number';
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
  
      const method = editingCategory ? 'PATCH' : 'POST';
      const url = `${backendURL}/category/${editingCategory ? editingCategory._id : ''}`;
  
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(formData),
        });
        const json = await response.json();
  
        if (response.ok) {
          const actionType = editingCategory ? 'UPDATE_CATEGORY' : 'ADD_CATEGORY';
          dispatch({ type: actionType, payload: json });
          closeModal();
        } else {
          console.error('Failed to perform the operation:', json.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    const handleDelete = async () => {
      if (!editingCategory?._id) return;
  
      try {
        const response = await fetch(`${backendURL}/category/${editingCategory._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
  
        if (response.ok) {
          dispatch({ type: 'DELETE_CATEGORY', payload: editingCategory._id });
          closeModal();
        } else {
          console.error('Failed to delete the category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className='modal modal-open'>
        <div className='modal-box'>
          <button onClick={closeModal} className='btn btn-sm btn-circle absolute right-2 top-2'>✕</button>
          <h3 className='font-bold text-lg'>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={handleSubmit}>
            {/* Input fields here */}
            
            <div className='modal-action'>
              <button type='submit' className='btn btn-primary'>
                {editingCategory ? 'Update' : 'Add'}
              </button>
              {editingCategory && (
                <button type='button' className='btn btn-error' onClick={handleDelete}>
                  Delete
                </button>
              )}
              <button type='button' className='btn' onClick={closeModal}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default CategoryModal;
  