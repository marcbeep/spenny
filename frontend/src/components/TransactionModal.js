import React, { useState } from 'react';

const TransactionModal = ({ isOpen, closeModal, onAddTransaction }) => {
  const [formData, setFormData] = useState({ title: '', amount: '' });
  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'title') setTitleError('');
    if (field === 'amount') setAmountError('');
  };

  const validateForm = () => {
    let isValid = true;
    if (!formData.title) {
      setTitleError('Title is required');
      isValid = false;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
      setAmountError('Amount must be a valid number');
      isValid = false;
    } else if (parseFloat(formData.amount) > 1000000) {
      setAmountError('Amount must be less than or equal to £1,000,000.00');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
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
    <div
      className='modal modal-open'
      aria-labelledby='modalTitle'
      aria-describedby='modalDescription'
    >
      <div className='modal-box'>
        <form onSubmit={handleSubmit} className='form-control'>
          <Field
            type='text'
            placeholder='Greggs'
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            error={titleError}
          />
          <Field
            type='number'
            placeholder='1.50'
            value={formData.amount}
            onChange={(e) => updateFormData('amount', e.target.value)}
            error={amountError}
          />
          <div className='modal-action'>
            {isSubmitting ? (
              <button type='button' className='btn loading'>
                loading
              </button>
            ) : (
              <button type='submit' className='btn btn-primary'>
                Submit
              </button>
            )}
            <button type='button' className='btn' onClick={closeModal}>
              Close
            </button>
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
      className='input input-bordered w-full'
      value={value}
      onChange={onChange}
    />
    {error && (
      <div role='alert' className='alert alert-error mt-2'>
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default TransactionModal;
