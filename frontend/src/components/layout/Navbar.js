import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth(); 
  const location = useLocation();
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
      <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={isDrawerOpen} readOnly />
      <div className='drawer-content flex flex-col'>
        {/* Navbar content */}
        {user ? (
          <button onClick={() => logout()} className='btn btn-ghost'>
            Logout
          </button>
        ) : (
          <div className='py-2 px-4'></div>
        )}
      </div>
      <div className='drawer-side'>
        <label htmlFor="my-drawer" className="drawer-overlay" aria-label="close sidebar" onClick={closeDrawer}></label>
        <ul className='menu py-32 overflow-y-auto w-80 bg-base-100'>
          {/* Other links */}
          <li><Link to='/placeholder' className={`p-2 ${isActive('/placeholder')}`} onClick={closeDrawer}>Placeholder</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;

