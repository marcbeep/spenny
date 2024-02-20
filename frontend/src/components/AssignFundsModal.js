import React, { useState } from 'react';
import { useCategoryContext } from '../context/CategoryContext';
import { useAuthContext } from '../hooks/useAuthContext';
import { useBudgetContext } from '../context/BudgetContext';
import { formatCurrencyInput } from '../utils/currencyInputFormatter'; // Import the utility function
import backendURL from '../config';

const AssignFundsModal = ({ isOpen, closeModal, readyToAssign, fetchCategories }) => {
  const { user } = useAuthContext();
  const { categories } = useCategoryContext();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [formErrors, setFormErrors] = useState({});
  const { fetchReadyToAssign } = useBudgetContext();

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue > readyToAssign) {
      setFormErrors({ ...formErrors, amount: 'Cannot assign more than available funds.' });
      return false;
    } else {
      setFormErrors({ ...formErrors, amount: '' }); // Clear error if validation passes
      return true;
    }
  };

  const handleAmountChange = (e) => {
    setAmount(formatCurrencyInput(e.target.value));
  };

  const handleAssignFunds = async (e) => {
    e.preventDefault();
    if (!validateAmount(amount)) return;

    try {
      const response = await fetch(`${backendURL}/budget/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ categoryId: selectedCategory, amount: parseFloat(amount) }),
      });
      if (response.ok) {
        fetchReadyToAssign();
        fetchCategories();
        closeModal();
      } else {
        const result = await response.json();
        setFormErrors({ form: result.error || 'Failed to assign funds. Please try again.' });
      }
    } catch (error) {
      console.error('Error assigning funds:', error);
      setFormErrors({ form: 'An unexpected error occurred. Please try again.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal modal-open'>
      <div className='modal-box'>
        <button onClick={closeModal} className='btn btn-sm btn-circle absolute right-2 top-2'>
          ✕
        </button>
        <h3 className='font-bold text-lg'>Assign Funds to Category</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='select select-bordered w-full mb-4'
        >
          <option disabled value=''>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.title}
            </option>
          ))}
        </select>
        <input
          type='text' // Changed to text to manually handle numeric input
          placeholder='Amount'
          className='input input-bordered w-full mb-4'
          value={amount}
          onChange={handleAmountChange}
        />
        {formErrors.amount && <div className='text-red-500 mb-4'>{formErrors.amount}</div>}
        <div className='modal-action'>
          <button className='btn btn-primary' onClick={handleAssignFunds}>
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignFundsModal;
