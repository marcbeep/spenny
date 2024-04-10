import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

// views
import Account from './components/views/Account';
import Signup from './components/views/Signup';
import Login from './components/views/Login';
import Landing from './components/views/Landing';
import Category from './components/views/Category';
import Transaction from './components/views/Transaction';
import Dash from './components/views/Dash';

// layouts
import Navbar from './components/layout/Navbar';

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
        <Routes>
          <Route path='/' element={!user ? <Landing /> : <Navigate to='/' />} />
          <Route path='/signup' element={!user ? <Signup /> : <Navigate to='/' />} />
          <Route path='/login' element={!user ? <Login /> : <Navigate to='/' />} />
          <Route path='/transaction' element={user ? <Transaction /> : <Navigate to='/' />} />
          <Route path='/account' element={user ? <Account /> : <Navigate to='/' />} />
          <Route path='/category' element={user ? <Category /> : <Navigate to='/' />} />
          <Route path='/dash' element={user ? <Dash /> : <Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
