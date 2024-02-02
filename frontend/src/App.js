import { BrowserRouter, Routes, Route } from 'react-router-dom';

//pages & components
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Navbar />
        <div className='px-16 py-12'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/landing' element={<LandingPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
