import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ data, onRowClick }) => {
  const rowVariants = {
    hover: { scale: 1.02, backgroundColor: "rgba(245, 245, 245, 1)", transition: { type: "spring", stiffness: 300 } },
    initial: { scale: 1, backgroundColor: "rgba(255, 255, 255, 0)" }, 
  };
  
  return (
    <div className='overflow-x-auto'>
      <table className='table w-full'>
        <thead>
          <tr>
            <th>ITEM</th>
            <th>AMOUNT</th>
            <th>CATEGORY</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan='3' className='text-center'>No data available</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <motion.tr
                key={item._id}
                initial="initial"
                whileHover="hover"
                variants={rowVariants}
                onClick={() => onRowClick(item)}
                className="cursor-pointer"
              >
                <td>{item.title}</td>
                <td>£{item.amount.toFixed(2)}</td>
                <td>{item.category || 'No Category'}</td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
