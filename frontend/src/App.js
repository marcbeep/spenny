import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './components/views/Landing';
import LoginComponent from './components/views/Login';
import SignupComponent from './components/views/Signup';
import HomeComponent from './components/views/Home';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<LoginComponent />} />
          <Route path='/signup' element={<SignupComponent />} />
          <Route path='/home' element={<HomeComponent />} />
          {/* Add more routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
