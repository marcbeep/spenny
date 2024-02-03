import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext'; 
import { useLogout } from '../hooks/useLogout';

const Navbar = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const logout = useLogout();
  const isActive = (path) => (location.pathname === path ? 'bg-gray-800' : '');

  return (
    <div className='drawer drawer-left'>
      <input id='my-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content flex flex-col'>
        <header className='bg-black px-8 py-8 flex justify-between items-center'>
          {/* Conditionally render the hamburger menu based on user login status */}
          {user ? (
            <div>
              <label htmlFor='my-drawer' className='btn btn-square btn-ghost'>
                <FontAwesomeIcon icon={faBars} className='text-white' />
              </label>
            </div>
          ) : (
            // Placeholder to maintain center alignment of the logo when the user is not logged in
            <div className='py-2 px-4'></div>
          )}
          
          <div className='flex-grow'>
            <Link to='/' className='text-white text-3xl font-black'>
              Spenny 💸
            </Link>
          </div>
          
          {/* Logout button or placeholder to keep logo centered */}
          {user ? (
            <button onClick={logout} className='text-white py-2 px-4 rounded hover:bg-gray-800'>
              Logout
            </button>
          ) : (
            <div className='py-2 px-4'></div>
          )}
        </header>
      </div>
      <div className='drawer-side'>
        <label htmlFor='my-drawer' className='drawer-overlay' aria-label='close sidebar'></label>
        <ul className='menu py-32 overflow-y-auto w-80 h-full bg-black text-white'>
          <li>
            <Link to='/transactions' className={`p-2 ${isActive('/')}`}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to='/about' className={`p-2 ${isActive('/about')}`}>
              About
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;

