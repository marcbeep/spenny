// import React from 'react';
// import OCRUpload from '../components/Forms/OCRUpload';
// import TransactionForm from '../components/Forms/TransactionForm';
// import TransactionCard from '../components/Cards/TransactionCard';

// const Dev = () => {
//   // Sample fake data
//   const transactions = [
//     {
//       title: 'Grocery Shopping',
//       amount: 120.5,
//       categoryName: 'Groceries',
//       date: 'Apr 4th',
//       type: 'debit',
//     },
//     {
//       title: 'Salary',
//       amount: 3000,
//       categoryName: 'Income',
//       date: 'Apr 1st',
//       type: 'credit',
//     },
//     {
//       title: 'Electric Bill',
//       amount: 85.75,
//       categoryName: 'Rent',
//       date: 'Apr 3rd',
//       type: 'debit',
//     },
//     {
//       title: 'Gym Membership',
//       amount: 25.99,
//       categoryName: 'Fun Money',
//       date: 'Apr 2nd',
//       type: 'debit',
//     },
//   ];

//   const categories = ['Groceries', 'Rent', 'Fun Money', 'Eating Out', 'Savings'];
//   const accounts = ['Checking', 'Savings', 'Credit Card'];

//   const handleFormSubmit = (formData) => {
//     console.log('Form Data:', formData);
//     // Add logic to process form data here
//   };

//   return (
//     <div className='container mx-auto px-4'>
//       <h1 className='text-2xl font-bold text-center my-8'>Dev Page</h1>
//       <div className='mb-4'>
//         <OCRUpload />
//       </div>
//       <div className='mb-4'>
//         <TransactionForm categories={categories} accounts={accounts} onSubmit={handleFormSubmit}/>
//       </div>
//       <div className='mb-8'>
//       <TransactionCard data={transactions} />
//       </div>
//     </div>
//   );
// };

// export default Dev;

import React, { useState, useEffect } from 'react';
import { loadMockData } from '../utils/mockDataLoader';
import TransactionCard from '../components/Cards/TransactionCard'; // Adjust the path as necessary

const Dev = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // Add state for categories

  useEffect(() => {
    const loadData = async () => {
      const accountsData = await loadMockData('accounts');
      const transactionsData = await loadMockData('transactions');
      const categoriesData = await loadMockData('categories'); // Load categories data
      setAccounts(accountsData);
      setTransactions(transactionsData);
      setCategories(categoriesData); // Set categories state
    };

    loadData();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div>
      <h1>Development Testing Page</h1>
      {/* Displaying accounts and transactions in a preformatted block is optional now
          since we will display transactions using the TransactionCard component */}
      <h2>Transactions</h2>
      {/* Render the TransactionCard component with transactions and categories props */}
      <TransactionCard transactions={transactions} categories={categories} />
    </div>
  );
};

export default Dev;
