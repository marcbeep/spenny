import React, { useState } from 'react';

const TransactionModal = ({ isOpen, closeModal, onAddTransaction }) => {
  const [formData, setFormData] = useState({ title: '', amount: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('https://cash-api.reeflink.org/trans/', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    const json = await response.json();

    if (response.ok) {
      setFormData({ title: '', amount: '' });
      console.log('New transaction added:', json);
      closeModal();
      onAddTransaction(); // Refresh the transaction list
    } else {
      setError(json.error || 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='modal modal-open'
      aria-labelledby='modalTitle'
      aria-describedby='modalDescription'
    >
      <div className='modal-box'>
        <form onSubmit={handleSubmit} className='form-control'>
          <label className='label'>
            <span className='font-bold label-text'>Transaction Title</span>
            <input
              type='text'
              placeholder='Greggs'
              className='input input-bordered'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </label>
          <label className='label'>
            <span className='font-bold label-text'>Amount Spent</span>
            <input
              type='text'
              placeholder='£10'
              className='input input-bordered'
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </label>
          {error && <div className='error text-red-500'>{error}</div>}
          <div className='modal-action'>
            <button type='submit' className='btn btn-primary'>
              Submit
            </button>
            <button type='button' className='btn' onClick={closeModal}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
