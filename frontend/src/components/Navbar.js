import React, { useState } from 'react';
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

  // State to control the drawer's open/closed state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Function to toggle the drawer's state
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Function to close the drawer when a link is clicked
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className={`drawer drawer-left ${isDrawerOpen ? 'active' : ''}`}>
      <input id='my-drawer' type='checkbox' className='drawer-toggle' checked={isDrawerOpen} />
      <div className='drawer-content flex flex-col'>
        <header className='bg-primary text-primary-content px-8 py-8 flex justify-between items-center'>
          {user && ( // Display the toggle button only if the user is logged in
            <div>
              <label htmlFor='my-drawer' className='btn btn-ghost'>
                <FontAwesomeIcon icon={faBars} onClick={toggleDrawer} />
              </label>
            </div>
          )}

          <div className='flex-grow'>
            <Link to='/' className= 'text-3xl font-bold ml-4'>
              Spenny 💸
            </Link>
          </div>

          {user ? (
            <button onClick={logout} className= 'btn btn-ghost'>
              Logout
            </button>
          ) : (
            <div className='py-2 px-4'></div>
          )}
        </header>
      </div>
      <div className='drawer-side'>
        <label htmlFor='my-drawer' className='drawer-overlay' aria-label='close sidebar' onClick={closeDrawer}></label>
        <ul className='menu py-32 overflow-y-auto w-80 h-full bg-primary text-primary-content'>
          <li>
            <Link to='/transaction' className={`p-2 ${isActive('/')}`} onClick={closeDrawer}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to='/account' className={`p-2 ${isActive('/about')}`} onClick={closeDrawer}>
              Accounts
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;






