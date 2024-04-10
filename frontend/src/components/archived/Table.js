import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ data, onRowClick }) => {
  const rowVariants = {
    hover: {
      scale: 1.02,
      backgroundColor: 'rgba(245, 245, 245, 1)',
      transition: { type: 'spring', stiffness: 300 },
    },
    initial: { scale: 1, backgroundColor: 'rgba(255, 255, 255, 0)' },
  };

  return (
    <div className='overflow-x-auto'>
      {data.length === 0 ? (
        <div className='card w-192 bg-primary text-primary-content mb-8'>
          <div className='card-body'>
            <h2 className='card-title'>It's lonely in here!</h2>
            <p>Add your first transaction with the button above.</p>
          </div>
        </div>
      ) : (
        <table className='table w-full mb-8'>
          <thead>
            <tr>
              <th>ITEM</th>
              <th>AMOUNT</th>
              <th>CATEGORY</th>
              <th>ACCOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <motion.tr
                key={item._id}
                initial='initial'
                whileHover='hover'
                variants={rowVariants}
                onClick={() => onRowClick(item)}
                className='cursor-pointer'
              >
                <td>{item.title}</td>
                <td>£{item.amount.toFixed(2)}</td>
                <td>{item.categoryName || 'No Category'}</td>
                <td>{item.accountName || 'No Account'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Table;
