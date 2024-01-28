import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://cash-api.reeflink.org/trans/');
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchData();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data ? data.slice(indexOfFirstItem, indexOfLastItem) : [];

  return (
    <div className="home">
      <button className="btn btn-primary mb-4" onClick={openModal}><FontAwesomeIcon icon={faPlus} size="sm" /> New Transaction</button>

      <TransactionModal isOpen={isModalOpen} closeModal={closeModal} />

      <Table data={currentData} currentPage={currentPage} itemsPerPage={itemsPerPage} />

      {data && (
        <Pagination
          className="mt-4"  // Added margin-top class here
          currentPage={currentPage}
          totalPages={Math.ceil(data.length / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Home;

