import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAccountContext } from '../context/AccountContext'; // Ensure this import is correct
import backendURL from '../config';

const AccountModal = ({ isOpen, closeModal, editingAccount }) => {
  const initialState = { name: '', balance: '', type: '' };
  const [formData, setFormData] = useState(editingAccount || initialState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const { dispatch } = useAccountContext();

  const isEditing = !!editingAccount;
  const url = isEditing
    ? `${backendURL}/account/${editingAccount._id}`
    : `${backendURL}/account/`;

  useEffect(() => {
    setFormData(editingAccount || initialState);
  }, [editingAccount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!/^\d+(\.\d{1,2})?$/.test(formData.balance)) errors.balance = 'Balance must be a valid number';
    else if (parseFloat(formData.balance) > 1000000) errors.balance = 'Balance must be less than or equal to £1,000,000.00';
    if (!formData.type) errors.type = 'Type is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const actionType = isEditing ? 'UPDATE_ACCOUNT' : 'ADD_ACCOUNT';
        const data = await response.json();
        dispatch({ type: actionType, payload: data });
        setFormData(initialState);
        closeModal();
      } else {
        const error = await response.json();
        console.error(error.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAccount?._id) return;
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch(`${backendURL}/account/${editingAccount._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
  
      if (response.ok) {
        dispatch({ type: 'DELETE_ACCOUNT', payload: editingAccount._id });
        console.log('deleted account:', editingAccount._id);
        closeModal();
      } else {
        console.error('Failed to delete the account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className='modal modal-open' aria-labelledby='modalTitle' aria-describedby='modalDescription'>
      <div className='modal-box'>
        <form onSubmit={handleSubmit} className='form-control'>
          {['name', 'balance', 'type'].map((field) => (
            <Field
              key={field}
              type={field === 'balance' ? 'number' : 'text'}
              name={field}
              placeholder={`Enter ${field}`}
              value={formData[field]}
              onChange={handleInputChange}
              error={formErrors[field]}
            />
          ))}
          <div className='modal-action'>
            <ActionButton
              isSubmitting={isSubmitting}
              isEditing={isEditing}
              closeModal={closeModal}
              handleDelete={handleDelete} 
            />
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ type, name, placeholder, value, onChange, error }) => (
  <div className='mb-2'>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={`input input-bordered w-full ${error ? 'border-red-500' : ''}`}
      value={value}
      onChange={onChange}
    />
    {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
  </div>
);

const ActionButton = ({ isSubmitting, isEditing, closeModal, handleDelete }) => { 
  return (
    <>
      <button type='button' className='btn' onClick={closeModal} disabled={isSubmitting}>
        Close
      </button>
      <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : isEditing ? 'Update' : 'Add'} Account
      </button>
      {isEditing && (
        <button type='button' className='btn btn-error' onClick={handleDelete} disabled={isSubmitting}>
          Delete
        </button>
      )}
    </>
  );
};

export default AccountModal;
