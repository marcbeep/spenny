import React from 'react';
import OCRUpload from '../components/OCRUpload';
import TransactionForm from '../components/Forms/TransactionForm';
import TransactionCard from '../components/Cards/TransactionCard'; 

const Dev = () => {
  // Sample fake data
  const transactions = [
    {
      title: 'Grocery Shopping',
      amount: 120.5,
      categoryName: 'Groceries',
      date: 'Apr 4th',
      type: 'debit',
    },
    {
      title: 'Salary',
      amount: 3000,
      categoryName: 'Income',
      date: 'Apr 1st',
      type: 'credit',
    },
    {
      title: 'Electric Bill',
      amount: 85.75,
      categoryName: 'Rent',
      date: 'Apr 3rd',
      type: 'debit',
    },
    {
      title: 'Gym Membership',
      amount: 25.99,
      categoryName: 'Fun Money',
      date: 'Apr 2nd',
      type: 'debit',
    },
  ];

  const categories = ['Groceries', 'Rent', 'Fun Money', 'Eating Out', 'Savings'];
  const accounts = ['Checking', 'Savings', 'Credit Card'];

  const handleFormSubmit = (formData) => {
    console.log('Form Data:', formData);
    // Add logic to process form data here
  };

  return (
    <div className='container mx-auto px-4'>
      <h1 className='text-2xl font-bold text-center my-8'>Dev Page</h1>
      <div className='mb-4'>
        <OCRUpload />
      </div>
      <div className='mb-4'>
        <TransactionForm categories={categories} accounts={accounts} onSubmit={handleFormSubmit}/>
      </div>
      <div className='mb-8'>
      <TransactionCard data={transactions} />
      </div>
    </div>
  );
};

export default Dev;
