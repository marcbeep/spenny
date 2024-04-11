import React from 'react';
import { useAuth } from '../../context/AuthContext';

const HomeComponent = () => {
  const { user, logoutUser } = useAuth(); // Destructure the user details and logout function

  const handleLogout = () => {
    logoutUser();
    // Redirect to landing page or show a message
  };

  return (
    <div>
      <h1>Home</h1>
      {user && (
        <div>
          <p>Welcome, {user.email}</p>
          {/* Display more user details here as needed */}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default HomeComponent;
