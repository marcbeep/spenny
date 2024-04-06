import React, { useState, useEffect } from 'react';
import { formatCurrencyInput } from '../../utils/currencyInputFormatter';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useTransactionContext } from '../../context/TransactionContext';
import { useCategoryContext } from '../../context/CategoryContext';
import { useAccountContext } from '../../context/AccountContext';
import backendURL from '../../config';

const TransactionModal = ({ isOpen, closeModal, editingTransaction }) => {
  const initialState = { title: '', amount: '', category: '', account: '' };
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const { dispatch: transactionDispatch } = useTransactionContext();
  const { categories } = useCategoryContext();
  const { accounts } = useAccountContext(); // Use accounts from AccountContext

  useEffect(() => {
    if (isOpen) {
      setFormData(editingTransaction || initialState);
    }
  }, [editingTransaction, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      // Use formatCurrencyInput for the amount field
      setFormData({ ...formData, [name]: formatCurrencyInput(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0)
      errors.amount = 'Amount must be a valid number and greater than 0';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.account) errors.account = 'Account is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const method = editingTransaction ? 'PATCH' : 'POST';
    const url = `${backendURL}/transaction/${editingTransaction ? editingTransaction._id : ''}`;

    setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        transactionDispatch({
          type: editingTransaction ? 'UPDATE_TRANSACTION' : 'ADD_TRANSACTION',
          payload: data,
        });
        closeModal();
      } else {
        const error = await response.json();
        setFormErrors({ form: error.message || 'An error occurred' });
      }
    } catch (error) {
      setFormErrors({ form: 'An error occurred during the request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTransaction?._id) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${backendURL}/transaction/${editingTransaction._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (response.ok) {
        transactionDispatch({ type: 'DELETE_TRANSACTION', payload: editingTransaction._id });
        closeModal();
      } else {
        console.error('Failed to delete the transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal modal-open' aria-modal='true' role='dialog'>
      <div className='modal-box'>
        <button
          onClick={closeModal}
          className='btn btn-sm btn-circle absolute right-4 top-4'
          aria-label='Close'
        >
          ✕
        </button>
        <h3 className='text-lg font-bold mb-4'>
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className='form-control my-4'>
            <input
              type='text'
              id='title'
              name='title'
              placeholder='Transaction Title'
              className='input input-bordered w-full'
              value={formData.title}
              onChange={handleInputChange}
            />
            {formErrors.title && <span className='text-error text-sm'>{formErrors.title}</span>}
          </div>
          <div className='form-control my-4'>
            <input
              type='text'
              id='amount'
              name='amount'
              placeholder='Amount'
              className='input input-bordered w-full'
              value={formData.amount}
              onChange={handleInputChange}
            />
            {formErrors.amount && <span className='text-error text-sm'>{formErrors.amount}</span>}
          </div>
          <div className='form-control my-4'>
            <select
              id='category'
              name='category'
              className='select select-bordered w-full'
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value=''>Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <span className='text-error text-sm'>{formErrors.category}</span>
            )}
          </div>
          <div className='form-control my-4'>
            <select
              id='account'
              name='account'
              className='select select-bordered w-full'
              value={formData.account || ''}
              onChange={handleInputChange}
            >
              <option value=''>Select Account</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.title}
                </option>
              ))}
            </select>
            {formErrors.account && <span className='text-error text-sm'>{formErrors.account}</span>}
          </div>
          <div className='modal-action'>
            {editingTransaction && (
              <button
                type='button'
                className='btn btn-error'
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete
              </button>
            )}
            <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : editingTransaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
