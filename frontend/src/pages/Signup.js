import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: '' }); // type can be 'success' or 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://spenny-api.reeflink.org/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email, // Assuming username is needed
                    email,
                    password,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log(data);
                setFeedback({ message: 'Signup successful! Welcome aboard.', type: 'success' });
                // Redirect or handle signup success
            } else {
                throw new Error('Signup failed');
            }
        } catch (err) {
            console.log(err);
            setFeedback({ message: 'Failed to signup. Please try again.', type: 'error' });
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
                            <button type="submit" 
                                    className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Signup</button>
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
