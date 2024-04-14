//useAccounts.js: Handle fetching, updating, and archiving accounts. It could also include moving money between accounts.

import { useCallback } from 'react';
import { useAccountContext } from '../contexts/AccountsContext';
import {
  fetchAccounts,
  fetchAccountById,
  addAccount,
  updateAccount,
  archiveAccount,
  moveMoneyBetweenAccounts,
  fetchTotalBalanceAPI,
} from '../api/accountService';

export const useAccounts = () => {
  const { dispatch } = useAccountContext();

  const fetchTotalBalance = useCallback(
    async (token) => {
      try {
        const { totalBalance } = await fetchTotalBalanceAPI(token);
        dispatch({ type: 'SET_TOTAL_BALANCE', payload: totalBalance });
      } catch (error) {
        console.error('Error fetching total balance:', error);
      }
    },
    [dispatch],
  );

  const loadAccounts = useCallback(async () => {
    try {
      const accounts = await fetchAccounts();
      dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, [dispatch]);

  const createAccount = useCallback(
    async (accountData) => {
      try {
        const newAccount = await addAccount(accountData);
        dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
      } catch (error) {
        console.error('Error adding account:', error);
      }
    },
    [dispatch],
  );

  const modifyAccount = useCallback(
    async (accountId, updateData) => {
      try {
        const updatedAccount = await updateAccount(accountId, updateData);
        dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
      } catch (error) {
        console.error('Error updating account:', error);
      }
    },
    [dispatch],
  );

  const removeAccount = useCallback(
    async (accountId) => {
      try {
        await archiveAccount(accountId);
        dispatch({ type: 'ARCHIVE_ACCOUNT', payload: accountId });
      } catch (error) {
        console.error('Error archiving account:', error);
      }
    },
    [dispatch],
  );

  const transferFunds = useCallback(
    async (fromAccountId, toAccountId, amount) => {
      try {
        await moveMoneyBetweenAccounts(fromAccountId, toAccountId, amount);
        // If the backend returns the updated accounts, refresh them here.
        // For now, this does not dispatch an action, but we might
        // need to fetch accounts again or handle this update in a more nuanced way.
        console.log('Money moved successfully'); // Placeholder action
      } catch (error) {
        console.error('Error moving money between accounts:', error);
      }
    },
    [dispatch],
  );

  return {
    fetchTotalBalance,
    loadAccounts,
    createAccount,
    modifyAccount,
    removeAccount,
    transferFunds,
  };
};
