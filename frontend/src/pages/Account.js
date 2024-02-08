import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAccountContext } from '../context/AccountContext';
import AccountModal from '../components/AccountModal';
import backendURL from '../config';

const Account = () => {
  const { user } = useAuthContext();
  const { accounts, dispatch: dispatchAccount } = useAccountContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400'];
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${backendURL}/account`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const json = await response.json();
        if (response.ok) {
          dispatchAccount({ type: 'SET_ACCOUNTS', payload: json });
        } else {
          console.error('Failed to fetch accounts:', json.error);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalBalance = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${backendURL}/account/totalBalance`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const json = await response.json();
        if (response.ok) {
          setTotalBalance(json.totalBalance);
        } else {
          console.error('Failed to fetch total balance:', json.error);
        }
      } catch (error) {
        console.error('Error fetching total balance:', error);
      }
    };

    fetchAccounts();
    fetchTotalBalance();
  }, [user, accounts.length, dispatchAccount]);

  const openModalForNewAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (account) => {
    console.log(account); // This should include an 'id'
    setEditingAccount(account);
    setIsModalOpen(true);
  };
  

  if (isLoading) return <div>Loading accounts...</div>;

  return (
    <>
      <div className="flex justify-center">Total Balance: £{totalBalance}</div>
      <div className="flex justify-center my-4">
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
      />
      <div className="flex flex-wrap justify-center gap-4 p-4 text-base-100">
        {accounts.length > 0 ? accounts.map((account, index) => (
          <div
            key={account._id}
            onClick={() => openModalForEdit(account)}
            className={`card rounded-xl cursor-pointer w-96 ${colors[index % colors.length]} lg:w-1/4 md:w-1/2 sm:w-full m-2 p-4`}
          >
            <div className="card-body">
              <h2 className="card-title">{account.name}</h2>
              <p>Balance: £{account.balance}</p>
              <div className="badge badge-outline">{account.type}</div>
            </div>
          </div>
        )) : <div>No accounts available</div>}
      </div>
    </>
  );
};

export default Account;



