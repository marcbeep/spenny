import React, { useState, useEffect } from 'react';
import apiUrl from '../apiConfig';

const TransactionModal = ({ isOpen, closeModal, onAddTransaction, onDeleteTransaction, editingTransaction }) => {
  const initialState = editingTransaction || { title: '', amount: '', category: '' };
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const url = editingTransaction 
    ? `${apiUrl}/transaction/${editingTransaction._id}` 
    : `${apiUrl}/transaction/`;

  useEffect(() => {
    if (editingTransaction) {
      setFormData(editingTransaction);
    } else {
      setFormData(initialState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTransaction]);

  const handleDelete = async () => {
    if (editingTransaction && editingTransaction._id) {
      onDeleteTransaction(editingTransaction._id);
      closeModal(); // Close modal after deletion
    }
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setFormErrors({ ...formErrors, [field]: '' });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title) {
      errors.title = 'Title is required';
    }

    if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      errors.amount = 'Amount must be a valid number';
    } else if (parseFloat(formData.amount) > 1000000) {
      errors.amount = 'Amount must be less than or equal to £1,000,000.00';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const method = editingTransaction ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await response.json();

      if (response.ok) {
        setFormData(initialState);
        console.log('New transaction added:', json);
        closeModal();
        onAddTransaction();
      } else {
        console.error(json.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal modal-open' aria-labelledby='modalTitle' aria-describedby='modalDescription'>
      <div className='modal-box'>
        <form onSubmit={handleSubmit} className='form-control'>
          <Field
            type='text'
            placeholder='Item (e.g. Greggs)'
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            error={formErrors.title}
          />
          <Field
            type='number'
            placeholder='Price (1.50)'
            value={formData.amount}
            onChange={(e) => updateFormData('amount', e.target.value)}
            error={formErrors.amount}
          />
          <div className='mb-2'>
            <select
              className={`select select-bordered w-full ${formErrors.category ? 'border-red-500' : ''}`}
              value={formData.category}
              onChange={(e) => updateFormData('category', e.target.value)}
            >
              <option disabled value=''>
                Select Category
              </option>
              <option value='Groceries'>Groceries</option>
              <option value='Utilities'>Utilities</option>
              {/* Add more categories here */}
            </select>
            {formErrors.category && (
              <p className='text-red-500 text-sm mt-1'>{formErrors.category}</p>
            )}
          </div>
          <div className='modal-action'>
  {isSubmitting ? (
    <button type="button" className="btn btn-primary" disabled>
      <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full" role="status">
      </div>
    </button>
  ) : (
    <>
      <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
        {editingTransaction ? 'Update' : 'Add Transaction'}
      </button>
      {editingTransaction && (
        <button type='button' className='btn btn-error' onClick={handleDelete} disabled={isSubmitting}>
          Delete
        </button>
      )}
    </>
  )}
  <button type='button' className='btn' onClick={closeModal} disabled={isSubmitting}>Close</button>
</div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ type, placeholder, value, onChange, error }) => (
  <div className='mb-2'>
    <input
      type={type}
      placeholder={placeholder}
      className={`input input-bordered w-full ${error ? 'border-red-500' : ''}`}
      value={value}
      onChange={onChange}
    />
    {error && (
      <p className='text-red-500 text-sm mt-1'>{error}</p>
    )}
  </div>
);

export default TransactionModal;
