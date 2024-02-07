import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useCategoryContext } from '../context/CategoryContext';
import CategoryModal from '../components/CategoryModal';
import backendURL from '../config';

const Category = () => {
  const { user } = useAuthContext();
  const { categories, dispatch: dispatchCategory } = useCategoryContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${backendURL}/category`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const json = await response.json();
        if (response.ok) {
          dispatchCategory({ type: 'SET_CATEGORIES', payload: json });
        } else {
          console.error('Failed to fetch categories:', json.error);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [user, dispatchCategory]);

  const openModalForNewCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <>
      <h1 className='font-semibold'>Categories</h1>
      <div className="flex justify-end">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <button className='btn btn-primary mb-4' onClick={openModalForNewCategory}>
            <FontAwesomeIcon icon={faPlus} size='sm' />
          </button>
        </motion.div>
      </div>
      <CategoryModal 
        isOpen={isModalOpen} 
        closeModal={() => setIsModalOpen(false)} 
        editingCategory={editingCategory}
      />
      <div className="flex flex-wrap justify-center gap-4 p-4 text-base-100">
        {categories.length > 0 ? categories.map((category, index) => (
          <div
            key={category._id}
            onClick={() => openModalForEdit(category)}
            className={`card rounded-xl cursor-pointer w-96 lg:w-1/4 md:w-1/2 sm:w-full m-2 p-4`}
          >
            <div className="card-body">
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
