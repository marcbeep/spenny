import { BrowserRouter, Routes, Route } from 'react-router-dom';

//pages
import Transactions from './pages/Transactions';
import About from './pages/About';
import Signup from './pages/Signup';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Navbar />
        <div className='px-16 py-12'>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/transactions' element={<Transactions />} />
            <Route path='/about' element={<About />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
