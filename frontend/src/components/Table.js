import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ data }) => {
  const rowTransition = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className='overflow-x-auto'>
      <table className='table w-full'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th> {/* Added Category column */}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan='3'>
                <div className='loading loading-spinner loading-sm'></div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <motion.tr
                key={item.id}
                initial='hidden'
                animate='visible'
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                variants={rowTransition}
              >
                <td>{item.title}</td>
                <td>£{item.amount.toFixed(2)}</td>
                <td>{item.category || 'No Category'}</td> {/* Display Category or 'No Category' */}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
