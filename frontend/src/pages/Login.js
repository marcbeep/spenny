import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import backendURL from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (feedback.message) setFeedback({ message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendURL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ message: 'Successful login. Welcome back!', type: 'success' });
        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: 'LOGIN', payload: data });
        navigate('/transaction');
      } else {
        throw new Error('Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      // Custom user-friendly error message instead of using `err.message`
      setFeedback({ message: 'Something went wrong. Please try again later.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='p-6 m-4 bg-white rounded-lg shadow-md w-96'>
        <h3 className='text-2xl font-semibold text-center'>Welcome back</h3>
        <form onSubmit={handleSubmit}>
          <div className='mt-4'>
            <input
              type='email'
              placeholder='Email'
              className='input input-bordered w-full max-w-xs'
              value={email}
              onChange={handleInputChange(setEmail)}
            />
            <input
              type='password'
              placeholder='Password'
              className='input input-bordered w-full max-w-xs mt-4'
              value={password}
              onChange={handleInputChange(setPassword)}
            />
            <button type='submit' disabled={isSubmitting} className='btn btn-primary w-full mt-4'>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
            <div className='mt-4 text-center'>
              <Link to='/signup' className='link'>
                <p>No account?</p>
              </Link>
            </div>
          </div>
        </form>
        <AnimatePresence>
          {feedback.message && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className={`mt-4 alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}
            >
              <FontAwesomeIcon
                icon={feedback.type === 'success' ? faCheckCircle : faTimesCircle}
                className='mr-2'
              />
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
