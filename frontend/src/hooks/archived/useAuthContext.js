import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

export const useAuthContext = () => {
  const { user, dispatch } = useContext(AuthContext);

  return { user, dispatch };
};
