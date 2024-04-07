import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useCategoryContext } from '../context/CategoryContext';
import { useBudgetContext } from '../context/BudgetContext';
import CategoryModal from '../components/CategoryModal';
import AssignFundsModal from '../components/AssignFundsModal';
import MoveFundsModal from '../components/MoveFundsModal';
import backendURL from '../config';
import Card from '../components/Card';

const Category = () => {
  const { user } = useAuthContext();
  const { categories, dispatch: dispatchCategory, fetchCategories } = useCategoryContext();
  const { readyToAssign } = useBudgetContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMoveFundsModalOpen, setIsMoveFundsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryForMoving, setSelectedCategoryForMoving] = useState(null);

  // Fetch categories on component mount or user change
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const fetchCategories = async () => {
      const response = await fetch(`${backendURL}/category`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const json = await response.json();
      response.ok
        ? dispatchCategory({ type: 'SET_CATEGORIES', payload: json })
        : console.error('Failed to fetch categories:', json.error);
      setIsLoading(false);
    };
    fetchCategories();
  }, [user, dispatchCategory]);

  // Handlers for opening modals
  const openModalForNewCategory = () => setIsModalOpen(true);
  const openModalForEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };
  const openMoveFundsModal = (category) => {
    setSelectedCategoryForMoving(category);
    setIsMoveFundsModalOpen(true);
  };

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <>
      <div className='flex justify-center my-4'>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <button onClick={openModalForNewCategory} className='btn btn-primary'>
            <FontAwesomeIcon icon={faPlus} size='sm' /> Add Category
          </button>
        </motion.div>
        <div className='ml-4'>
          <button onClick={() => setIsAssignModalOpen(true)} className='btn btn-secondary'>
            £{readyToAssign} to Assign
          </button>
          <AssignFundsModal
            isOpen={isAssignModalOpen}
            closeModal={() => setIsAssignModalOpen(false)}
            readyToAssign={readyToAssign}
            fetchCategories={fetchCategories}
          />
        </div>
      </div>
      <CategoryModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
      />
      <div
        className={`max-w-2xl mx-auto grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center items-start'}`}
      >
        {categories.length > 0 ? (
          categories.map((category) => (
            <Card
              key={category._id}
              onClick={() => openModalForEdit(category)}
              title={category.title}
              subtitle={`£${category.available}`}
              buttonText='Move Funds'
              onButtonClick={() => openMoveFundsModal(category)}
            />
          ))
        ) : (
          <p>No categories yet</p>
        )}
      </div>
      <MoveFundsModal
        isOpen={isMoveFundsModalOpen}
        closeModal={() => setIsMoveFundsModalOpen(false)}
        category={selectedCategoryForMoving}
        refreshCategories={fetchCategories}
      />
    </>
  );
};

export default Category;
