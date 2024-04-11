import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useAuth(); // Destructure the loginUser function from context

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await loginUser(email, password);
      // Redirect the user or show a success message
    } catch (error) {
      // Handle login error (e.g., show an error message)
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginComponent;
