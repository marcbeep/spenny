import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faHome,
  faFunnelDollar,
  faUtensils,
  faPiggyBank,
  faUser,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
const TransactionCard = ({ data }) => {
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

  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case 'Groceries':
        return faShoppingCart;
      case 'Rent':
        return faHome;
      case 'Fun Money':
        return faFunnelDollar;
      case 'Eating Out':
        return faUtensils;
      case 'Savings':
        return faPiggyBank;
      default:
        return faUser; // Default icon if category doesn't match
    }
  };

  return (
    <section className='card col-span-12 overflow-hidden bg-base-100 shadow-sm xl:col-span-7 border-2 border-black rounded-xl'>
      <div className='card-body grow-0'>
        <div className='flex justify-between gap-2'>
          <h2 className='card-title grow'>
            <a href='#' className='link-hover'>
              Recent Transactions
            </a>
          </h2>
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
          <div className='dropdown dropdown-end'>
            <div tabIndex={0} role='button' className='btn btn-sm'>
              Actions
            </div>
            <ul
              tabIndex={0}
              className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
            >
              <li>
                <a>Edit</a>
              </li>
              <li>
                <a>Delete</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className='table table-zebra'>
          <tbody>
            {data.map((transaction, index) => (
              <tr key={index}>
                <td className='w-0'>
                  <input type='checkbox' className='checkbox' />
                </td>
                <td>
                  <div className='flex items-center gap-4'>
                    <FontAwesomeIcon
                      icon={getCategoryIcon(transaction.categoryName)}
                      size='lg'
                      className='text-xl'
                    />
                    <div>
                      <div className='text-sm font-bold'>{transaction.title}</div>
                      <div className='text-xs opacity-50'>
                        {transaction.categoryName || 'No Category'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{transaction.date}</td>
                <td>
                  {getTransactionIcon(transaction.type)}
                  {transaction.amount.toFixed(2)} USD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TransactionCard;
