import React from 'react';
import TransactionCard from '../components/Cards/TransactionCard'; // Adjust the import path as necessary

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

  return (
    <div className='container mx-auto px-4'>
      <h1 className='text-2xl font-bold text-center my-8'>Dev Page</h1>
      <TransactionCard data={transactions} />
    </div>
  );
};

export default Dev;
