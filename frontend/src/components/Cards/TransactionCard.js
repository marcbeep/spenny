import { React, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { getCategoryDetails } from '../../utils/getCategoryDetails';
import { formatDate } from '../../utils/formatDate';

const TransactionCard = ({ transactions, categories, onRowClick }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return <FontAwesomeIcon icon={faArrowUp} className='text-success' />;
      case 'debit':
        return <FontAwesomeIcon icon={faArrowDown} className='text-error' />;
      default:
        return null;
    }
  };

  return (
    <section className='card col-span-12 overflow-hidden bg-base-100 shadow-sm xl:col-span-7 border-2 border-black rounded-xl'>
      <div className='card-body grow-0'>
        <div className='flex justify-between gap-2'>
          <h2 className='card-title grow'>Recent Transactions</h2>
          <div className='dropdown dropdown-end'>
            <div tabIndex={0} role='button' className='btn btn-sm'>
              Filter
            </div>
            <ul
              tabIndex={0}
              className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
            >
              <li>
                <a>Last Week</a>
              </li>
              <li>
                <a>Last Month</a>
              </li>
              <li>
                <a>All Time</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className='table table-zebra'>
          <tbody>
            {transactions.map((transaction, index) => {
              const { categoryName, icon } = getCategoryDetails(transaction.category, categories);
              return (
                <tr
                  key={index}
                  onClick={() => onRowClick(transaction)}
                  className='cursor-pointer hover:bg-gray-100'
                >
                  <td>
                    <FontAwesomeIcon icon={icon} size='lg' className='text-xl' />
                    <div>
                      <div className='text-sm font-bold'>{transaction.title}</div>
                      <div className='text-xs opacity-50'>{categoryName}</div>
                    </div>
                  </td>
                  <td>
                    {getTransactionIcon(transaction.type)}
                    {`${transaction.amount.toFixed(2)}`}
                  </td>
                  <td>{formatDate(transaction.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TransactionCard;
