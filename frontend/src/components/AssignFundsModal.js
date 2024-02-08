import React, { useState } from 'react';
import { useCategoryContext } from '../context/CategoryContext';
import { useAuthContext } from '../hooks/useAuthContext';
import backendURL from '../config';

const AssignFundsModal = ({ isOpen, closeModal }) => {
  const { user } = useAuthContext();
  const { categories, dispatch: dispatchCategory } = useCategoryContext();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleAssignFunds = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!selectedCategory || isNaN(numericAmount) || numericAmount <= 0) return;

    const url = `${backendURL}/budget/assign`;
    const data = { categoryId: selectedCategory, amount: numericAmount };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        dispatchCategory({ type: 'UPDATE_CATEGORY', payload: result.category });
        closeModal(); 
      } else {
        console.error('Failed to assign funds:', result.error);
      }
    } catch (error) {
      console.error('Error assigning funds:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
      <button onClick={closeModal} className='btn btn-sm btn-circle absolute right-2 top-2'>✕</button>
        <h3 className="font-bold text-lg">Assign Funds to Category</h3>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="select select-bordered w-full my-4">
          <option disabled value="">Select a category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
        <input type="number" placeholder="Amount" className="input input-bordered w-full" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleAssignFunds}>Assign</button>
        </div>
      </div>
    </div>
  );
};

export default AssignFundsModal;
