import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useCategoryContext } from '../context/CategoryContext';
import backendURL from '../config';

const CategoryModal = ({ isOpen, closeModal, editingCategory }) => {
  const initialState = { title: '', available: 0, newCategoryId: '' };
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const { user } = useAuthContext();
  const { categories, dispatch } = useCategoryContext();

  useEffect(() => {
    if (isOpen) {
      setFormData(
        editingCategory
          ? { title: editingCategory.title, available: editingCategory.available }
          : initialState,
      );
    }
    // This will ensure that the modal resets its form data when it's opened or when the editingCategory changes
  }, [isOpen, editingCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          Authorization: `Bearer ${user.token}`,
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
    // Ensure newCategoryId is selected before allowing delete
    if (!editingCategory?._id || !formData.newCategoryId) {
      setFormErrors({
        ...formErrors,
        newCategoryId: 'Please select a category to reassign transactions to.',
      });
      return;
    }

    try {
      const response = await fetch(`${backendURL}/category/${editingCategory._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newCategoryId: formData.newCategoryId }),
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

  const filteredCategories = categories.filter((c) => c._id !== editingCategory?._id);

  return (
    <div className='modal modal-open'>
      <div className='modal-box'>
        <button onClick={closeModal} className='btn btn-sm btn-circle absolute right-2 top-2'>
          ✕
        </button>
        <h3 className='font-bold text-lg mb-4'>
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='title'
            placeholder='Category Name'
            value={formData.title}
            onChange={handleInputChange}
            className='input input-bordered w-full mb-4'
          />
          {editingCategory && (
            <div className='form-control my-4'>
              <label htmlFor='newCategoryId' className='label'>
                Reassign Transactions To:
              </label>
              <select
                id='newCategoryId'
                name='newCategoryId'
                className='select select-bordered w-full'
                value={formData.newCategoryId}
                onChange={handleInputChange}
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
          )}
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
