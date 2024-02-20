import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

//pages
import Transaction from './pages/Transaction';
import Account from './pages/Account';
import Signup from './pages/Signup';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Category from './pages/Category';

// components
import Navbar from './components/Navbar';

function App() {

  const { user } = useAuthContext();

  // const { user, authIsReady } = useAuthContext();
  // if (!authIsReady) {
  //   return <div>Loading...</div>;
  // };

  return (
    <div className='App'>
      <BrowserRouter>
        <Navbar />
        <div className='px-16 py-12 bg-base-100'>
          <Routes>
            <Route path='/' element={!user ? <LandingPage /> : <Navigate to="/transaction" />} />
            <Route path='/transaction' element={user ? <Transaction /> : <Navigate to="/" />} />
            <Route path='/account' element={user ? <Account /> : <Navigate to="/" />} />
            <Route path='/category' element={user ? <Category /> : <Navigate to="/" />} />
            <Route path='/signup' element={!user ? <Signup /> : <Navigate to="/transaction" />} />
            <Route path='/login' element={!user ? <Login /> : <Navigate to="/transaction" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
