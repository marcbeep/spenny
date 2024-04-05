import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useCategoryContext } from '../../context/CategoryContext';
import backendURL from '../../config';

const DeleteCategoryModal = ({ isOpen, closeModal, categoryId }) => {
  const [newCategoryId, setNewCategoryId] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const { user } = useAuthContext();
  const { categories, dispatch } = useCategoryContext();

  useEffect(() => {
    if (!isOpen) {
      setNewCategoryId('');
      setFormErrors({});
    }
  }, [isOpen]);

  const filteredCategories = categories.filter((c) => c._id !== categoryId);

  const handleDelete = async () => {
    if (!newCategoryId) {
      setFormErrors({ newCategoryId: 'Please select a category to reassign transactions to.' });
      return;
    }

    try {
      const response = await fetch(`${backendURL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newCategoryId }),
      });

      if (response.ok) {
        dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
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
        <button onClick={closeModal} className='btn btn-sm btn-circle absolute right-2 top-2'>
          ✕
        </button>
        <h3 className='font-bold text-lg mb-4'>Delete Category</h3>
        <div>
          <label htmlFor='newCategoryId' className='label'>
            Reassign Transactions To:
          </label>
          <select
            id='newCategoryId'
            className='select select-bordered w-full mb-4'
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
          >
            <option value=''>Select Category</option>
            {filteredCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
          {formErrors.newCategoryId && (
            <p className='text-error text-sm'>{formErrors.newCategoryId}</p>
          )}
        </div>
        <div className='modal-action'>
          <button className='btn btn-error' onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;
