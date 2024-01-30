import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import TransactionModal from '../components/TransactionModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const controls = useAnimation();
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch('https://spenny-api.reeflink.org/transaction/');
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const deleteTransaction = async (id) => {

    console.log('Attempting to delete transaction with ID:', id); // Debugging statement

    const deleteUrl = `https://spenny-api.reeflink.org/transaction/${id}`;
    console.log('Delete URL:', deleteUrl); // Debugging statement

    try {
      const res = await fetch(`https://spenny-api.reeflink.org/transaction/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      refreshData(); // Refresh data to reflect the deletion
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
    setEditingTransaction(null);
  };

  const openModal = () => {
    controls.start({ rotate: 180 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    controls.start({ rotate: 0 });
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data ? data.slice(indexOfFirstItem, indexOfLastItem) : [];

  return (
    <div className='home'>
      <div className="flex justify-end">
        <motion.div animate={controls}>
          <button className='btn btn-primary mb-4' onClick={openModal}>
            <FontAwesomeIcon icon={faPlus} size='sm' />
          </button>
        </motion.div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        onAddTransaction={refreshData}
      />

<Table data={currentData} onRowClick={openEditModal} />
      <TransactionModal 
        isOpen={isModalOpen}
        closeModal={closeModal}
        onAddTransaction={refreshData}
        onDeleteTransaction={deleteTransaction} // Pass the delete function
        editingTransaction={editingTransaction}
      />
      
      {data && (
        <Pagination
          className='mt-4'
          currentPage={currentPage}
          totalPages={Math.ceil(data.length / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Home;
