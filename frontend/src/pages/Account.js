import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAccountContext } from '../context/AccountContext'; // Ensure this import is correct
import backendURL from '../config';

const Account = () => {
  const { user } = useAuthContext();
  const { accounts, dispatch: dispatchAccount } = useAccountContext(); // Correctly extract dispatchAccount here
  const [isLoading, setIsLoading] = useState(false);

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
    <div>
      {accounts.length > 0 ? (
        <ul>
          {accounts.map(account => (
            <li key={account.id}>{account.name}</li>
          ))}
        </ul>
      ) : (
        <div>No accounts available</div>
      )}
    </div>
  );
};

export default Account;
