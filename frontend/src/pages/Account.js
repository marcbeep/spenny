import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAccountContext } from '../context/AccountContext';
import { useBudgetContext } from '../context/BudgetContext';
import AccountModal from '../components/AccountModal';

const Account = () => {
  const { user } = useAuthContext();
  const { accounts, totalBalance, fetchTotalBalance } = useAccountContext();
  const { readyToAssign, fetchReadyToAssign } = useBudgetContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const colors = ['bg-neutral'];

  useEffect(() => {
    if (user) {
      fetchReadyToAssign(); 
      fetchTotalBalance(); 
    }
  }, [user, fetchReadyToAssign, fetchTotalBalance]);

  const openModalForNewAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchTotalBalance();
    fetchReadyToAssign();
  };

  return (
    <>
      <div className='flex justify-around'>
        <div>Total Balance: £{totalBalance}</div>
        <div>Ready to Assign: £{readyToAssign}</div>
      </div>
      <div className='flex justify-center my-4'>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <button className='btn btn-primary' onClick={openModalForNewAccount}>
            <FontAwesomeIcon icon={faPlus} size='sm' /> Add Account
          </button>
        </motion.div>
      </div>
      <AccountModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        editingAccount={editingAccount}
        onSuccess={handleSuccess}
      />
      <div className='flex flex-wrap justify-center gap-4 p-4 text-base-100'>
        {accounts.length > 0 ? (
          accounts.map((account, index) => (
            <div
              key={account._id}
              onClick={() => openModalForEdit(account)}
              className={`card rounded-xl cursor-pointer w-96 ${
                colors[index % colors.length]
              } lg:w-1/4 md:w-1/2 sm:w-full m-2 p-4`}
            >
              <div className='card-body'>
                <h2 className='card-title'>{account.title}</h2>
                <p>Balance: £{account.balance}</p>
                <div className='badge badge-outline'>{account.type}</div>
              </div>
            </div>
          ))
        ) : (
          <div>No accounts available</div>
        )}
      </div>
    </>
  );
};

export default Account;
