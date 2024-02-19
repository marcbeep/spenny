import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useBudgetContext } from '../context/BudgetContext';
import { useCategoryContext } from '../context/CategoryContext';
import backendURL from '../config';

const MoveFundsModal = ({ isOpen, closeModal, category, refreshCategories }) => {
  const { user } = useAuthContext();
  const { categories } = useCategoryContext();
  const { fetchReadyToAssign } = useBudgetContext();

  const [fromCategory, setFromCategory] = useState('');
  const [toCategory, setToCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFromCategory(category._id);
      setAmount(category.available.toString());
      console.log(`Selected category: ${category._id}, Available amount: ${category.available}`);
    } else {
      resetForm();
    }
  }, [category]);
  

  const handleMoveFunds = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      console.error('MoveFundsModal Error: Invalid amount input by user.'); // More specific error log
      return;
    }
  
    const url = toCategory === 'readyToAssign'
      ? `${backendURL}/budget/moveToReadyToAssign`
      : `${backendURL}/budget/move`;
  
    const data = {
      fromCategoryId: fromCategory,
      toCategoryId: toCategory === 'readyToAssign' ? undefined : toCategory,
      amount: parseFloat(amount),
    };

    console.log('Sending request to URL:', url);
    console.log('Request data:', data);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        console.log('Successfully moved funds.');
        refreshCategories();
        fetchReadyToAssign();
        closeModal();
      } else {
        console.log(`Failed to move funds. Response status: ${response.status}`);
        let errorText = await response.text(); // Read once and store
        console.log('Error response text:', errorText);
        try {
          let result = JSON.parse(errorText); // Attempt to parse the stored text
          console.error('MoveFundsModal Error Body:', result);
          setError(result.message || 'An error occurred without specific message.');
        } catch (error) {
          // If parsing fails, log the original text
          console.error('MoveFundsModal Error Response Text:', errorText);
          setError('An error occurred, and the error message could not be parsed.');
        }
      }
    } catch (err) {
      setError('Failed to move funds');
      console.error('MoveFundsModal Fetch Error:', err); // Logging fetch error
    }
  };
  
  const resetForm = () => {
    setFromCategory('');
    setToCategory('');
    setAmount('');
    setError('');
  };

  const handleClose = () => {
    closeModal();
    resetForm();
  };

  const handleFromCategoryChange = (e) => {
    setFromCategory(e.target.value);
    console.log(`From category changed to: ${e.target.value}`);
  };
  
  const handleToCategoryChange = (e) => {
    setToCategory(e.target.value);
    console.log(`To category changed to: ${e.target.value}`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <button onClick={handleClose} className="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">Move Funds</h3>
        <select value={fromCategory} onChange={handleFromCategoryChange} className="select select-bordered w-full mb-2">
          <option value="">Select source category</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>{category.title}</option>
          ))}
        </select>
        <input type="number" placeholder="Amount" className="input input-bordered w-full mb-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select value={toCategory} onChange={handleToCategoryChange} className="select select-bordered w-full mb-2">
          <option value="">Select destination</option>
          <option value="readyToAssign">Ready to Assign</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>{category.title}</option>
          ))}
        </select>
        {error && <p className="text-red-500">{error}</p>}
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleMoveFunds}>Move</button>
        </div>
      </div>
    </div>
  );
};

export default MoveFundsModal;


