import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import apiUrl from '../apiConfig';
import { useAuthContext } from '../hooks/useAuthContext';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { dispatch } = useAuthContext();

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (feedback.message) setFeedback({ message: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${apiUrl}/user/signup`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setFeedback({ message: 'Signup successful! Welcome aboard.', type: 'success' });
                localStorage.setItem('user', JSON.stringify(data));
                dispatch({type: 'LOGIN', payload: data});
            } else {
                throw new Error(data.error || 'Failed to signup. Please try again.');
            }
        } catch (err) {
            setFeedback({ message: err.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="px-8 py-6 mt-4 text-left">
                <h3 className="text-2xl font-black text-center">SIGNUP</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <label htmlFor="email" className="block">Email</label>
                        <input 
                            type="email" 
                            placeholder="email"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={email}
                            onChange={handleInputChange(setEmail)} 
                        />
                        <label htmlFor="password" className="block mt-4">Password</label>
                        <input 
                            type="password" 
                            placeholder="password"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={password}
                            onChange={handleInputChange(setPassword)} 
                        />
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn btn-primary w-full mt-4"
                        >
                            {isSubmitting ? 'Signing up...' : 'Signup'}
                        </button>
                    </div>
                </form>
                <AnimatePresence>
                    {feedback.message && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.5 }}
                            className={`mt-4 text-center p-4 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                        >
                            <FontAwesomeIcon icon={feedback.type === 'success' ? faCheckCircle : faTimesCircle} className="mr-2" />
                            {feedback.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Signup;
