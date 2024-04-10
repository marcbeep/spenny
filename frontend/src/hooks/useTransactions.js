//useTransactions.js: Manage transactions, including adding, updating, and deleting transactions.

import { useCallback } from 'react';
import { useTransactionsContext } from '../contexts/TransactionsContext';
import * as transactionService from '../api/transactionService';

export const useTransactions = () => {
  const { transactions, dispatch, loadTransactions } = useTransactionsContext();

  const addTransaction = useCallback(async (transactionData) => {
    try {
      const newTransaction = await transactionService.createTransaction(transactionData);
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error; // Re-throw to let calling components handle it
    }
  }, [dispatch]);

  const updateTransaction = useCallback(async (transactionId, updateData) => {
    try {
      const updatedTransaction = await transactionService.updateTransaction(transactionId, updateData);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }, [dispatch]);

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      await transactionService.deleteTransaction(transactionId);
      dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }, [dispatch]);

  // Optionally, if transactions are related to receipts and we have the analyzeReceipt endpoint:
  const analyzeReceipt = useCallback(async (receiptData) => {
    try {
      const transactionDetails = await transactionService.analyzeReceipt(receiptData);
      return transactionDetails; 
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      throw error;
    }
  }, []);

  return {
    transactions,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    analyzeReceipt, // Only include if related backend endpoint is available
  };
};
