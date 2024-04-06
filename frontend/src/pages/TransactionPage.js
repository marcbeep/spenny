import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTransactionContext } from '../context/TransactionContext';
import { useCategoryContext } from '../context/CategoryContext';
import { useAccountContext } from '../context/AccountContext';
import TransactionModal from '../components/TransactionModal';
import TransactionCard from '../components/Cards/TransactionCard';
import Pagination from '../components/Pagination';
import backendURL from '../config';

const TransactionPage = () => {
  const { user } = useAuthContext();
  const { transactions, dispatch: transactionDispatch } = useTransactionContext();
  const { categories, dispatch: categoryDispatch } = useCategoryContext();
  const { accounts, dispatch: accountDispatch } = useAccountContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        const response = await fetch(`${backendURL}/transactions`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          transactionDispatch({ type: 'SET_TRANSACTIONS', payload: data });
        }
      }
    };

    fetchTransactions();
  }, [user, transactionDispatch]);

  // Pagination Logic
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Open Modal for New Transaction
  const openModalForNewTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Open Modal for Editing Transaction
  const openModalForEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Calculating Page Data for Pagination
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
