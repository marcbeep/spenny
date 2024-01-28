// Home.js

import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import TransactionModal from '../components/TransactionModal'; // Import the modal component

const Home = () => {
  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('https://cash-api.reeflink.org/trans/');
      const data = await res.json();

      if (res.ok) {
        setData(data);
      }
    }
    fetchData();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="home">
      <button className="btn btn-primary mb-4" onClick={openModal}>+ New Transaction</button>
      
      <TransactionModal isOpen={isModalOpen} closeModal={closeModal} />

      <Table data={data} />
    </div>
  );
};

export default Home;

