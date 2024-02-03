import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTransactionContext } from '../context/TransactionContext'; 
import TransactionModal from '../components/TransactionModal';
import Table from '../components/Table';
import Pagination from '../components/Pagination';

const Transactions = () => {
  const { user } = useAuthContext();
  const { transactions, dispatch } = useTransactionContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        const response = await fetch('https://spenny-api.reeflink.org/transaction', {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const json = await response.json();
  
        if (response.ok) {
          dispatch({ type: 'SET_TRANSACTIONS', payload: json });
        }
      }
    };

    fetchTransactions();
  }, [user, dispatch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openModal = () => setIsModalOpen(true);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <div className='home'>
      <h1 className='font-black'>Transactions</h1>
      <div className="flex justify-end">
        <motion.div>
          <button className='btn btn-primary mb-4' onClick={openModal}>
            <FontAwesomeIcon icon={faPlus} size='sm' />
          </button>
        </motion.div>
      </div>
      <TransactionModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
      <Table data={currentTransactions} />
      <Pagination currentPage={currentPage} totalPages={Math.ceil(transactions.length / itemsPerPage)} onPageChange={handlePageChange} />
      
    </div>
  );
};

export default Transactions;
