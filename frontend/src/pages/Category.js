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
      <div className='max-w-2xl mx-auto'>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-1 justify-items-center mx-auto'>
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div
                key={category._id}
                className={`card rounded-lg cursor-pointer p-4 m-2 border-2 border-black bg-transparent`}
                onClick={() => openModalForEdit(category)}
              >
                <div className='card-body text-black'>
                  <h2 className='card-title'>{category.title}</h2>
                  <h1>£{category.available}</h1>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openMoveFundsModal(category);
                    }}
                    className='btn'
                  >
                    Move Funds
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No categories yet</p>
          )}
        </div>
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
