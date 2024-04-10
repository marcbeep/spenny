import React, { useState, useEffect } from 'react';
import { loadMockData } from '../../utils/mockDataLoader';
import TransactionForm from '../../components/Forms/TransactionForm';
import OCRUpload from '../../components/Forms/OCRUpload';
import TransactionCard from '../../components/Cards/TransactionCard';

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
      <OCRUpload />
      {/* <TransactionForm categories={categories} accounts={accounts} onSubmit={handleFormSubmit}/> */}
      <TransactionCard transactions={transactions} categories={categories} />
    </div>
  );
};

export default Dev;
