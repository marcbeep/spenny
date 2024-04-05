import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';

const Navbar = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const logout = useLogout();
  const isActive = (path) => (location.pathname === path ? 'font-bold' : '');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className={`drawer drawer-left ${isDrawerOpen ? 'active' : ''}`}>
      <input
        id='my-drawer'
        type='checkbox'
        className='drawer-toggle'
        checked={isDrawerOpen}
        readOnly
      />
      <div className='drawer-content flex flex-col'>
        <header className='bg-primary text-primary-content px-8 py-8 flex justify-between items-center'>
          {user && (
            <button onClick={toggleDrawer} className='btn btn-ghost'>
              <span className='text-xl'>☰</span> {/* You can also use an icon here */}
            </button>
          )}

          <div className='flex-grow'>
            <Link to='/' className='text-3xl font-bold ml-4'>
              spenny
            </Link>
          </div>

          {user ? (
            <button onClick={logout} className='btn btn-ghost'>
              Logout
            </button>
          ) : (
            <div className='py-2 px-4'></div>
          )}
        </header>
      </div>
      <div className='drawer-side'>
        <label
          htmlFor='my-drawer'
          className='drawer-overlay'
          aria-label='close sidebar'
          onClick={closeDrawer}
        ></label>
        <ul className='menu py-32 overflow-y-auto w-80 h-full bg-primary text-primary-content'>
          <li>
            <Link
              to='/transaction'
              className={`p-2 ${isActive('/transaction')}`}
              onClick={closeDrawer}
            >
              Transactions
            </Link>
          </li>
          <li>
            <Link to='/account' className={`p-2 ${isActive('/account')}`} onClick={closeDrawer}>
              Accounts
            </Link>
          </li>
          <li>
            <Link to='/category' className={`p-2 ${isActive('/category')}`} onClick={closeDrawer}>
              Categories
            </Link>
          </li>
          {/* <li>
            <Link to='/chart' className={`p-2 ${isActive('/chart')}`} onClick={closeDrawer}>
              Chart
            </Link>
          </li> */}
          <li>
            <Link to='/dev' className={`p-2 ${isActive('/dev')}`} onClick={closeDrawer}>
              Dev
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
