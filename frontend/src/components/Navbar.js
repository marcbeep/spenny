import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className='bg-black px-16 py-8'>
      <div className=''>
        <Link to='/' className='text-white text-3xl'>
          Cash 💸
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
