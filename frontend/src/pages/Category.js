import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useCategoryContext } from '../context/CategoryContext';
import CategoryModal from '../components/CategoryModal';
import AssignFundsModal from '../components/AssignFundsModal';
import backendURL from '../config';

const Category = () => {
  const { user } = useAuthContext();
  const { categories, dispatch: dispatchCategory } = useCategoryContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [availableFunds, setAvailableFunds] = useState(0); // State for tracking available funds to assign
  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400'];

  useEffect(() => {
    const fetchCategoriesAndFunds = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch categories
        const catResponse = await fetch(`${backendURL}/category`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const catJson = await catResponse.json();
        if (catResponse.ok) {
          dispatchCategory({ type: 'SET_CATEGORIES', payload: catJson });
        } else {
          console.error('Failed to fetch categories:', catJson.error);
        }
        
        // Fetch available funds
        const fundsResponse = await fetch(`${backendURL}/budget/available-funds`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const fundsJson = await fundsResponse.json();
        if (fundsResponse.ok) {
          setAvailableFunds(fundsJson.availableToAssign);
        } else {
          console.error('Failed to fetch available funds:', fundsJson.error);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndFunds();
  }, [user, dispatchCategory]);

  const openModalForNewCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Refresh available funds after assigning funds
  const refreshAvailableFunds = async () => {
    const fundsResponse = await fetch(`${backendURL}/budget/available-funds`, {
      headers: { 'Authorization': `Bearer ${user.token}` },
    });
    const fundsJson = await fundsResponse.json();
    if (fundsResponse.ok) {
      setAvailableFunds(fundsJson.availableToAssign);
    }
  };

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <>
      <div className="flex justify-center my-4">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <button className='btn btn-primary' onClick={openModalForNewCategory}>
            <FontAwesomeIcon icon={faPlus} size='sm' /> Add Category
          </button>
        </motion.div>
        <div className='ml-4'>
          <button className="btn btn-secondary" onClick={() => { setIsAssignModalOpen(true); refreshAvailableFunds(); }}>
            £{availableFunds} to Assign
          </button>
          <AssignFundsModal isOpen={isAssignModalOpen} closeModal={() => { setIsAssignModalOpen(false); refreshAvailableFunds(); }} />
        </div>
      </div>
      <CategoryModal 
        isOpen={isModalOpen} 
        closeModal={() => setIsModalOpen(false)} 
        editingCategory={editingCategory}
      />
      <div className="flex flex-wrap justify-center gap-4">
        {categories.length > 0 ? categories.map((category, index) => (
          <div
            key={category._id}
            className={`card rounded-lg cursor-pointer w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 m-2 ${colors[index % colors.length]}`}
            onClick={() => openModalForEdit(category)}
          >
            <div className="card-body text-black">
              <h2 className="card-title">{category.name}</h2>
              <p>Available: £{category.available}</p>
            </div>
          </div>
        )) : <div>No categories available</div>}
      </div>
    </>
  );
};

export default Category;

