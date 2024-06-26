import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useTransactionContext } from '../../context/TransactionContext';
import { useCategoryContext } from '../../context/CategoryContext';
import { useAccountContext } from '../../context/AccountContext';
import TransactionModal from '../../components/Modals/TransactionModal';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import backendURL from '../../config';

const Transaction = () => {
  const { user } = useAuthContext();
  const { transactions, dispatch } = useTransactionContext();
  const { categories } = useCategoryContext();
  const { accounts } = useAccountContext();
  const { dispatch: categoryDispatch } = useCategoryContext();
  const { dispatch: accountDispatch } = useAccountContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        const response = await fetch(`${backendURL}/transaction`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: 'SET_TRANSACTIONS', payload: json });
        }
      }
    };

    fetchTransactions();
  }, [user, dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (user) {
        const response = await fetch(`${backendURL}/category`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const json = await response.json();

        if (response.ok) {
          categoryDispatch({ type: 'SET_CATEGORIES', payload: json });
        }
      }
    };

    fetchCategories();
  }, [user, categoryDispatch]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        const response = await fetch(`${backendURL}/account`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const json = await response.json();

        if (response.ok) {
          accountDispatch({ type: 'SET_ACCOUNTS', payload: json });
        }
      }
    };

    fetchAccounts();
  }, [user, accountDispatch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openModalForNewTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const transactionData = currentTransactions.map((transaction) => {
    const category = categories.find((c) => c._id === transaction.category);
    const account = accounts.find((a) => a._id === transaction.account);
    return {
      ...transaction,
      categoryName: category ? category.title : 'No Category',
      accountName: account ? account.title : 'No Account',
    };
  });

  return (
    <div className='home'>
      <div className='flex justify-center my-4'>
        <motion.div>
          <button className='btn btn-primary' onClick={openModalForNewTransaction}>
            <FontAwesomeIcon icon={faPlus} size='sm' /> Add Transaction
          </button>
        </motion.div>
      </div>
      <TransactionModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        editingTransaction={editingTransaction}
      />
      <div className='flex justify-center'>
        <Table data={transactionData} onRowClick={openModalForEdit} />
      </div>
      <div className='flex justify-center'>
        {transactions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(transactions.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Transaction;
