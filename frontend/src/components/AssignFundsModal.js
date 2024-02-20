import React, { useState } from 'react';
import { useCategoryContext } from '../context/CategoryContext';
import { useAuthContext } from '../hooks/useAuthContext';
import backendURL from '../config';
import { useBudgetContext } from '../context/BudgetContext';

const AssignFundsModal = ({ isOpen, closeModal }) => {
  const { user } = useAuthContext();
  const { categories, dispatch: dispatchCategory } = useCategoryContext();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [formErrors, setFormErrors] = useState({}); // Use this for error messages
  const { fetchReadyToAssign } = useBudgetContext();

  const handleAssignFunds = async (e) => {
    e.preventDefault();
    // Validation logic...

    try {
      const response = await fetch(`${backendURL}/budget/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ categoryId: selectedCategory, amount: parseFloat(amount) }),
      });
      const result = await response.json();

      if (response.ok) {
        // Update category context with the new category data
        dispatchCategory({ type: 'UPDATE_CATEGORY', payload: result.category });

        // Assuming you have a way to access fetchReadyToAssign from BudgetContext
        // This could be passed as a prop to this modal or accessed directly using useBudgetContext() if inside a component
        fetchReadyToAssign();

        closeModal();
      } else {
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
        {formErrors.selectedCategory && (
          <div className='text-red-500 mb-4'>{formErrors.selectedCategory}</div>
        )}
        <input
          type='number'
          placeholder='Amount'
          className='input input-bordered w-full mb-4'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {formErrors.form && <div className='text-red-500 mb-4'>{formErrors.form}</div>}
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
