import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import apiUrl from '../apiConfig';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: '' }); // type can be 'success' or 'error'
    const [isSubmitting, setIsSubmitting] = useState(false); // New state to manage form submission status

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Begin submission, disable button, show spinner
        try {
            const res = await fetch(`${apiUrl}/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
    
            const data = await res.json(); // Always parse the JSON to get the data
    
            if (res.ok) {
                console.log(data);
                setFeedback({ message: 'Signup successful! Welcome aboard.', type: 'success' });
                // Redirect or handle signup success here
            } else {
                // Use the specific error message from the response if available
                throw new Error(data.error || 'Failed to signup. Please try again.');
            }
        } catch (err) {
            console.log(err);
            setFeedback({ message: err.message, type: 'error' });
        } finally {
            setIsSubmitting(false); // End submission, re-enable button, hide spinner
        }
    };    

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (feedback.message) setFeedback({ message: '', type: '' });
    };

    return (
        <div className="flex items-center justify-center">
            <div className="px-8 py-6 mt-4 text-left">
                <h3 className="text-2xl font-black text-center">SIGNUP</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="email">Email</label>
                            <input type="email" placeholder="email"
                                   className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                   value={email}
                                   onChange={handleInputChange(setEmail)} />
                        </div>
                        <div className="mt-4">
                            <label className="block" htmlFor="password">Password</label>
                            <input type="password" placeholder="password"
                                   className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                   value={password}
                                   onChange={handleInputChange(setPassword)} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button type="submit" disabled={isSubmitting}
                                    className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:bg-blue-300">
                                {isSubmitting ? (
                                    <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full" role="status">
                                    </div>
                                ) : (
                                    'Signup'
                                )}
                            </button>
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
                            className={`mt-4 text-center p-4 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
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