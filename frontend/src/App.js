import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; 

// views
import Account from './components/views/Account';
import Signup from './components/views/Signup';
import Login from './components/views/Login';
import Landing from './components/views/Landing';
import Category from './components/views/Category';
import Transaction from './components/views/Transaction';

// layouts
import Navbar from './components/layout/Navbar';

function App() {
  const { user } = useAuth(); 

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/transaction" element={user ? <Transaction /> : <Navigate to="/login" replace />} />
          <Route path="/account" element={user ? <Account /> : <Navigate to="/login" replace />} />
          <Route path="/category" element={user ? <Category /> : <Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

