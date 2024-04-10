import { createContext, useContext, useReducer, useEffect } from 'react';
import { setAuthToken } from '../utils/axiosConfig';

// Create AuthContext
export const AuthContext = createContext();

// Reducer function for handling auth state changes
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      // Optionally, handle token setting here if it makes sense for your use case
      return { ...state, user: action.payload, authIsReady: true };
    case 'LOGOUT':
      setAuthToken(null); // Clear Axios Authorization header on logout
      return { ...state, user: null, authIsReady: true };
    default:
      return state;
  }
};

// AuthContext provider component
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null, authIsReady: false });

  useEffect(() => {
    // Initialize auth state from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (user && token) {
      setAuthToken(token); // Set Axios Authorization header if token exists
      dispatch({ type: 'LOGIN', payload: user }); // Consider using 'LOGIN' for consistency if it fits your use case
    } else {
      dispatch({ type: 'LOGOUT' }); // Ensures state is clean if no valid user/token is found
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
