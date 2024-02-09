import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useCategoryContext } from '../context/CategoryContext';
import backendURL from '../config';

const CategoryModal = ({ isOpen, closeModal, editingCategory }) => {
    const initialState = { name: '', available: 0 };
    const [formData, setFormData] = useState(initialState);
    const [formErrors, setFormErrors] = useState({});
    const { user } = useAuthContext();
    const { dispatch } = useCategoryContext();
  
    useEffect(() => {
      // Reset form data whenever the modal is opened/closed or an editing category is set/unset
      setFormData(editingCategory ? { name: editingCategory.name, available: editingCategory.available } : initialState);
    }, [editingCategory]);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const validateForm = () => {
      const errors = {};
      if (!formData.title) errors.title = 'Title is required';
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
          <h3 className='font-bold text-lg mb-4'>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={handleSubmit}>
            <input type='text' name='title' placeholder='Category Name' value={formData.title} onChange={handleInputChange} className='input input-bordered w-full mb-4' />
            
            <div className='modal-action'>
              <button type='submit' className='btn btn-primary'>
                {editingCategory ? 'Update' : 'Add'}
              </button>
              {editingCategory && (
                <button type='button' className='btn btn-error' onClick={handleDelete}>
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default CategoryModal;
