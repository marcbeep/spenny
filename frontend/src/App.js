import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; 

// views
import Signup from './components/views/Signup';
import Login from './components/views/Login';
import Landing from './components/views/Landing';
import Placeholder from './components/views/Placeholder';

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
          <Route path="/placeholder" element={user ? <Placeholder /> : <Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

