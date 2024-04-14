import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? 'font-bold' : '');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className={`navbar bg-base-100 drawer drawer-left ${isDrawerOpen ? 'active' : ''}`}>
      <input
        id='my-drawer'
        type='checkbox'
        className='drawer-toggle'
        checked={isDrawerOpen}
        readOnly
      />
      <div className='drawer-content flex flex-col'>
        {/* Navbar content */}
        <div className='flex-1'>
          <a className='btn btn-ghost text-2xl'>spenny</a>
          {user && <p className='text-xs text-center'>{user.email}</p>}
        </div>
        <div className='flex-none'>
          {user && (
            <div className='dropdown dropdown-end'>
              <div tabIndex={0} role='button' className='btn btn-ghost btn-circle avatar'>
                <div className='w-10 rounded-full'>
                  <img alt='User Avatar' src={user.profilePictureUrl} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52'
              >
                <li>
                  <button onClick={() => logout()} className='justify-between'>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className='drawer-side'>
        <label
          htmlFor='my-drawer'
          className='drawer-overlay'
          aria-label='close sidebar'
          onClick={closeDrawer}
        ></label>
        <ul className='menu py-32 overflow-y-auto w-80 bg-base-100'>
          {/* Other links */}
          <li>
            <Link
              to='/placeholder'
              className={`p-2 ${isActive('/placeholder')}`}
              onClick={closeDrawer}
            >
              Placeholder
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
