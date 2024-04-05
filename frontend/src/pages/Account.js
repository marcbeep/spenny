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
<div className="max-w-2xl mx-auto">
  <div className="grid grid-cols-2 sm:grid-cols-2 gap-1 justify-items-center mx-auto">
        {accounts.length > 0 ? (
          accounts.map((account, index) => (
            <div
              key={account._id}
              onClick={() => openModalForEdit(account)}
              className={`card rounded-lg cursor-pointer p-4 m-2 border-2 border-black bg-transparent`}
            >
              <div className='card-body'>
                <h2 className='card-title'>{account.title}</h2>
                <h1>£{account.balance}</h1>
                <div className='badge badge-outline'>{account.type}</div>
              </div>
            </div>
          ))
        ) : (
          <div>No accounts available</div>
        )}
  </div>
</div>
    </>
  );
};

export default Account;
