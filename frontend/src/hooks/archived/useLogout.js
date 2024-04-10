import { useAuthContext } from './useAuthContext';
import { useTransactionContext } from '../context/TransactionContext';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const { dispatch: dispatchTransaction } = useTransactionContext();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    dispatchTransaction({ type: 'SET_TRANSACTIONS', payload: [] });
    navigate('/');
  };

  return logout;
};
