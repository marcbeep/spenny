import React, { useState, useEffect, useRef } from 'react';
import { formatCurrencyInput } from '../utils/currencyInputFormatter';
import { useAuthContext } from '../hooks/useAuthContext';
import { useBudgetContext } from '../context/BudgetContext';
import { useCategoryContext } from '../context/CategoryContext';
import { faCaretDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import backendURL from '../config';

const MoveFundsModal = ({ isOpen, closeModal, category, refreshCategories }) => {
  const { user } = useAuthContext();
  const { categories } = useCategoryContext();
  const { fetchReadyToAssign } = useBudgetContext();

  const [fromCategory, setFromCategory] = useState('');
  const [toCategory, setToCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);


  useEffect(() => {
    if (category) {
      setFromCategory(category._id);
      setAmount(formatCurrencyInput(category.available.toString()));
    } else {
      resetForm();
    }
  }, [category]);

  const handleAmountChange = (e) => {
    setAmount(formatCurrencyInput(e.target.value));
  };

  const handleMoveFunds = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      console.error('MoveFundsModal Error: Invalid amount input by user.'); // More specific error log
      return;
    }

    const url =
      toCategory === 'readyToAssign'
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
          Authorization: `Bearer ${user.token}`,
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

  const selectFromCategory = (categoryId) => {
    setFromCategory(categoryId);
    fromDropdownRef.current.removeAttribute("open");
  };

  const selectToCategory = (categoryId) => {
    setToCategory(categoryId);
    toDropdownRef.current.removeAttribute("open");
  };

  if (!isOpen) return null;

  return (
    <div className='modal modal-open items-center justify-center'>
  <div className='modal-box relative'>
    <button onClick={closeModal} className='btn btn-sm btn-circle absolute right-2 top-2'>✕</button>

    <div className='flex items-center justify-center gap-4 mb-4'>
      {/* From Category Dropdown */}
      <details className="dropdown" ref={fromDropdownRef}>
        <summary className="btn flex items-center gap-2">
          {fromCategory ? categories.find(c => c._id === fromCategory).title : "MOVE FROM"} <FontAwesomeIcon icon={faCaretDown} />
        </summary>
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          {categories.map((category) => (
            <li key={category._id} onClick={() => { setFromCategory(category._id); fromDropdownRef.current.removeAttribute("open"); }}>
              <a>{category.title}</a>
            </li>
          ))}
        </ul>
      </details>

      <FontAwesomeIcon icon={faArrowRight} size="lg" />

      {/* To Category Dropdown */}
      <details className="dropdown" ref={toDropdownRef}>
        <summary className="btn flex items-center gap-2">
          {toCategory ? categories.find(c => c._id === toCategory)?.title || "Ready to Assign" : "MOVE TO"} <FontAwesomeIcon icon={faCaretDown} />
        </summary>
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <li onClick={() => { setToCategory('readyToAssign'); toDropdownRef.current.removeAttribute("open"); }}>
            <a>Ready to Assign</a>
          </li>
          {categories.filter((c) => c._id !== fromCategory).map((filteredCategory) => (
            <li key={filteredCategory._id} onClick={() => { setToCategory(filteredCategory._id); toDropdownRef.current.removeAttribute("open"); }}>
              <a>{filteredCategory.title}</a>
            </li>
          ))}
        </ul>
      </details>
    </div>

    {/* Amount Input */}
    <div className='flex justify-center'>
      <input
        type='text'
        placeholder='Amount'
        className='input input-bordered w-full max-w-xs text-4xl text-center font-extrabold'
        value={amount}
        onChange={handleAmountChange}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
    </div>

    {error && <p className='text-red-500 text-center'>{error}</p>}
    <div className='modal-action justify-center mt-4'>
      <button className='btn btn-primary' onClick={handleMoveFunds}>Move</button>
    </div>
  </div>
</div>
  );
};

export default MoveFundsModal;
