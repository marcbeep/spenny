import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? 'bg-gray-800' : '');

  return (
    <div className='drawer drawer-left'>
      <input id='my-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content flex flex-col'>
        {/* Navbar */}
        <header className='bg-black px-8 py-8 flex justify-between items-center'>
          <div>
            <label htmlFor='my-drawer' className='btn btn-square btn-ghost'>
              <FontAwesomeIcon icon={faBars} className='text-white' />
            </label>
          </div>
          <div>
            <Link to='/' className='text-white text-3xl'>
              Spenny 💸
            </Link>
          </div>
          <div> {/* Placeholder to balance the flexbox */} </div>
        </header>
        {/* Page content here */}
      </div>
      <div className='drawer-side'>
        <label htmlFor='my-drawer' className='drawer-overlay' aria-label='close sidebar'></label>
        <ul className='menu p-16 overflow-y-auto w-80 h-full bg-black text-white'>
          {/* Sidebar content here */}
          <li>
            <Link to='/' className={`${isActive('/')} p-2`}>
              Home
            </Link>
          </li>
          <li>
            <Link to='/about' className={`${isActive('/about')} p-2`}>
              About
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
