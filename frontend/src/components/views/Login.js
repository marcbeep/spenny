import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth'; 
import { Link } from 'react-router-dom'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth(); 

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (feedback.message) setFeedback({ message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password); // Using login from useAuth
    } catch (err) {
      setFeedback({ message: err.message || 'Failed to log in. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='card w-96 bg-base-100 shadow-xl'>
        <div className='card-body'>
          <h2 className='card-title justify-center'>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Email</span>
              </label>
              <input
                type='email'
                placeholder='m@example.com'
                className='input input-bordered'
                value={email}
                onChange={handleInputChange(setEmail)}
              />
            </div>
            <div className='form-control mt-4'>
              <label className='label'>
                <span className='label-text'>Password</span>
              </label>
              <input
                type='password'
                placeholder=''
                className='input input-bordered'
                value={password}
                onChange={handleInputChange(setPassword)}
              />
            </div>
            <div className='form-control mt-6'>
              <button type='submit' disabled={isSubmitting} className='btn btn-primary'>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
            <div className='form-control mt-4 text-center'>
              <Link to='/signup' className='link link-secondary'>
                Need an account? Sign up
              </Link>
            </div>
          </form>
          <AnimatePresence>
            {feedback.message && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5 }}
                className={`alert ${
                  feedback.type === 'success' ? 'alert-success' : 'alert-error'
                } mt-4`}
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
    </div>
  );
};

export default Login;


