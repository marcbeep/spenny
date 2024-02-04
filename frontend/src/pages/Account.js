import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAccountContext } from '../context/AccountContext'; // Ensure this import is correct
import backendURL from '../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Account = () => {
  const { user } = useAuthContext();
  const { accounts, dispatch: dispatchAccount } = useAccountContext(); // Correctly extract dispatchAccount here
  const [isLoading, setIsLoading] = useState(false);
  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400'];

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const response = await fetch(`${backendURL}/account`, {
            headers: { 'Authorization': `Bearer ${user.token}` },
          });
          const json = await response.json();
    
          if (response.ok) {
            // Use dispatchAccount to update the context with the fetched accounts
            dispatchAccount({ type: 'SET_ACCOUNTS', payload: json });
          } else {
            console.error('Failed to fetch accounts', json.error);
          }
        } catch (error) {
          console.error('Error fetching accounts', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAccounts();
  }, [user, dispatchAccount]); // Make sure to include dispatchAccount in the dependency array

  if (isLoading) {
    return <div>Loading accounts...</div>;
  }

  return (
    <>
    <h1 className='font-semibold'>Accounts</h1>
    <div className="flex justify-end">
          <button className='btn btn-primary mb-4' onClick={console.log("hello")}>
            <FontAwesomeIcon icon={faPlus} size='sm' />
          </button>
      </div>
    <div className="flex flex-wrap justify-center gap-4 p-4 text-base-100">
      {accounts.length > 0 ? (
        accounts.map((account, index) => (
          <div
            key={account.id}
            className={`card rounded-xl w-48 ${colors[index % colors.length]} lg:w-1/4 md:w-1/2 sm:w-full`}
          >
            <div className="card-body">
              <h2 className="card-title">{account.name}</h2>
              <p>Balance: £{account.balance}</p>
              <div className="badge badge-outline">{account.type}</div>
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
