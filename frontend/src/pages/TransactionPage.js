import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTransactionContext } from '../context/TransactionContext';
import { useCategoryContext } from '../context/CategoryContext';
import { useAccountContext } from '../context/AccountContext';
import TransactionModal from '../components/Modals/TransactionModal';
import TransactionCard from '../components/Cards/TransactionCard';
import Pagination from '../components/Pagination';
import backendURL from '../config';

const TransactionPage = () => {
  const { user } = useAuthContext();
  const { transactions, dispatch: transactionDispatch } = useTransactionContext();
  const { categories } = useCategoryContext();
  const { accounts } = useAccountContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Consolidated fetchData method for transactions, categories, and accounts
    const fetchData = async () => {
      if (!user) return;

      try {
        const endpoints = ['transaction', 'category', 'account'];
        const dataFetchers = endpoints.map(async (endpoint) => {
          const response = await fetch(`${backendURL}/${endpoint}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
          return response.json();
        });

        const [transactionsData, categoriesData, accountsData] = await Promise.all(dataFetchers);
        transactionDispatch({ type: 'SET_TRANSACTIONS', payload: transactionsData });
        // Assuming similar dispatch functions for categories and accounts in their respective contexts
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user, transactionDispatch]);

  const handleRowClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openModalForNewTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className='transaction-page'>
      <motion.div className='flex justify-center my-4'>
        <button className='btn btn-primary' onClick={openModalForNewTransaction}>
          <FontAwesomeIcon icon={faPlus} size='sm' /> Add Transaction
        </button>
      </motion.div>
      <TransactionModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        editingTransaction={editingTransaction}
        categories={categories}
        accounts={accounts}
      />
      <TransactionCard
        transactions={currentTransactions}
        categories={categories}
        onRowClick={handleRowClick}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(transactions.length / itemsPerPage)}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TransactionPage;
