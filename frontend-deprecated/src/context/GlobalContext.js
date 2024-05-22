// /src/context/GlobalContext.js
import React, { createContext, useContext, useReducer } from 'react';

const GlobalContext = createContext();

const globalReducer = (state, action) => {
  switch (action.type) {
    // TODO: Define actions that trigger global updates
    default:
      return state;
  }
};

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, {});

  // Function to trigger updates
  const triggerGlobalUpdates = () => {
    // TODO: Implement logic to update global state or notify other contexts
  };

  return (
    <GlobalContext.Provider value={{ ...state, triggerGlobalUpdates }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use global context
export const useGlobal = () => useContext(GlobalContext);
