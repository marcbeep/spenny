import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useBudgetContext } from '../context/BudgetContext';
import { useCategoryContext } from '../context/CategoryContext';
import backendURL from '../config';

const MoveFundsModal = ({ isOpen, closeModal, category, refreshCategories }) => {
  const { user } = useAuthContext();
  const { categories } = useCategoryContext();
  const { fetchReadyToAssign } = useBudgetContext();

  const [fromCategory, setFromCategory] = useState(category ? category._id : '');
  const [toCategory, setToCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFromCategory(category._id);
    }
  }, [category]);

  const handleMoveFunds = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const url = `${backendURL}/budget/move`;
    const data = {
      fromCategoryId: fromCategory,
      toCategoryId: toCategory === 'readyToAssign' ? null : toCategory,
      amount: parseFloat(amount),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Assuming the server returns a successful operation in the response body
        refreshCategories();
        fetchReadyToAssign();
        closeModal();
        resetForm(); // Clear form values
      } else {
        const result = await response.json();
        setError(result.message || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to move funds');
    }
  };

  // Clear form values
  const resetForm = () => {
    setFromCategory('');
    setToCategory('');
    setAmount('');
    setError('');
  };

  // Close modal and reset form
  const handleClose = () => {
    closeModal();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <button onClick={handleClose} className="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">Move Funds</h3>
        <select value={fromCategory} onChange={(e) => setFromCategory(e.target.value)} className="select select-bordered w-full mb-2">
          <option value="">Select source category</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>{category.title}</option>
          ))}
        </select>
        <select value={toCategory} onChange={(e) => setToCategory(e.target.value)} className="select select-bordered w-full mb-2">
          <option value="">Select destination</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>{category.title}</option>
          ))}
          <option value="readyToAssign">Ready to Assign</option>
        </select>
        <input type="number" placeholder="Amount" className="input input-bordered w-full mb-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {error && <p className="text-red-500">{error}</p>}
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleMoveFunds}>Move</button>
        </div>
      </div>
    </div>
  );
};

export default MoveFundsModal;

