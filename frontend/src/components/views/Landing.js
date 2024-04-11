import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Landing = () => {
  return (
    <div>
      <h1>Welcome to Our Application</h1>
      <p>Your finances, simplified.</p>
      <div>
        <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default Landing;
