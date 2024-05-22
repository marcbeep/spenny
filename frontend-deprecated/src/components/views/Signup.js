import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SignupComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signupUser } = useAuth(); // Destructure the signupUser function from context

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signupUser(email, password);
      // Redirect the user or show a success message
    } catch (error) {
      // Handle signup error (e.g., show an error message)
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Email'
        required
      />
      <input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Password'
        required
      />
      <button type='submit'>Sign Up</button>
    </form>
  );
};

export default SignupComponent;
