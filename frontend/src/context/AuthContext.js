import { createContext, useReducer, useEffect } from 'react';

export const AuthContext = createContext();

const authReducer = (state, action) => {
  console.log('Reducer action type:', action.type);
  switch (action.type) {
    case 'LOGIN':
      console.log('Logging in user:', action.payload);
      return {
        ...state,
        user: action.payload,
        authIsReady: true,
      };
    case 'LOGOUT':
      console.log('Logging out...');
      return {
        ...state,
        user: null,
        authIsReady: true, 
      };
    case 'AUTH_READY':
      console.log('Setting auth ready, user:', action.payload);
      return {
        ...state,
        user: action.payload,
        authIsReady: true,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null, authIsReady: false });

  useEffect(() => {
    console.log('Checking authentication status...');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User from localStorage:', user);
    if (user) {
      console.log('Dispatching LOGIN...');
      dispatch({ type: 'LOGIN', payload: user });
    } else {
      console.log('Dispatching AUTH_READY with no user...');
      dispatch({ type: 'AUTH_READY', payload: null });
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
