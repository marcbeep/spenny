import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // Ensure you have this icon imported

const Navbar = () => {
  return (
    <div className="drawer drawer-left">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <header className='bg-black px-16 py-8 flex justify-between items-center'>
          <div className="">
            <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
              {/* FontAwesome Hamburger Icon */}
              <FontAwesomeIcon icon={faBars} className="text-white" />
            </label>
          </div>
          <div className='mr-4'>
            <Link to='/' className='text-white text-3xl'>Spenny 💸</Link>
          </div>
        </header>
        {/* Page content here */}
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay" aria-label="close sidebar"></label>
        <ul className="menu p-16 overflow-y-auto w-80 h-full bg-black text-white">
          {/* Sidebar content here */}
          <li><a href="/">Home</a></li>
          <li><a href="/">Accounts</a></li>
          <li><a href="/">Transactions</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
