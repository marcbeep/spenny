import {createContext, useReducer, useEffect} from 'react';

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'LOGIN':
          return {
            ...state,
            user: action.payload,
          };
        case 'LOGOUT':
          return {
            ...state,
            user: null,
          };
        default:
          return state;
      }
    },
    {
      user: null,
    },
  );

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      dispatch({type: 'LOGIN', payload: user});
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        dispatch,
      }}>
      {children}
    </AuthContext.Provider>
  );
}