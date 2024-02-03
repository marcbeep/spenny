import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

//pages
import Transaction from './pages/Transaction';
import Account from './pages/Account';
import Signup from './pages/Signup';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// components
import Navbar from './components/Navbar';

function App() {
  const { user } = useAuthContext();
  return (
    <div className='App'>
      <BrowserRouter>
        <Navbar />
        <div className='px-16 py-12'>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/transaction' element={user ? <Transaction /> : <Navigate to="/" />} />
            <Route path='/account' element={user ? <Account /> : <Navigate to="/" />} />
            <Route path='/signup' element={!user ? <Signup /> : <Navigate to="/transaction" />} />
            <Route path='/login' element={!user ? <Login /> : <Navigate to="/transaction" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
