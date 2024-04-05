import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCreditCard, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAccountContext } from '../context/AccountContext';
import { useBudgetContext } from '../context/BudgetContext';
import AccountModal from '../components/AccountModal';
import Card from '../components/Card';

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
        <div className="stats shadow">
  
  <div className="stat">
    <div className="stat-figure text-primary">
    <FontAwesomeIcon icon={faCreditCard} size='xl' />
    </div>
    <div className="stat-title">Total Balance</div>
    <div className="stat-value text-primary">£{totalBalance}</div>
  </div>
  
  <div className="stat">
    <div className="stat-figure text-secondary">
    <FontAwesomeIcon icon={faPlusCircle} size='xl' />
    </div>
    <div className="stat-title">Ready to Assign</div>
    <div className="stat-value text-secondary">£{readyToAssign}</div>
  </div>
  
</div>
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
      <div
        className={`max-w-2xl mx-auto grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center items-start`}
      >
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <Card
              key={account._id}
              onClick={() => openModalForEdit(account)}
              title={account.title}
              subtitle={`£${account.balance}`}
              badgeText={account.type}
            />
          ))
        ) : (
          <div>No accounts available</div>
        )}
      </div>
    </>
  );
};

export default Account;
