import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useSignup } from './hooks/useSignup'; // Adjust the import path as necessary

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, error, isLoading } = useSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        signup(email, password);
    };

    return (
        <div className="flex items-center justify-center">
            <div className="px-8 py-6 mt-4 text-left">
                <h3 className="text-2xl font-black text-center">SIGNUP</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block" htmlFor="email">Email</label>
                        <input
                            type="email"
                            placeholder="email"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block" htmlFor="password">Password</label>
                        <input
                            type="password"
                            placeholder="password"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-baseline justify-between mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:bg-blue-300"
                        >
                            {isLoading ? 'Processing...' : 'Signup'}
                        </button>
                    </div>
                </form>
                <AnimatePresence>
                    {(error || isLoading) && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.5 }}
                            className={`mt-4 text-center p-4 ${error ? 'text-red-600' : 'text-green-600'}`}
                        >
                            <FontAwesomeIcon icon={error ? faTimesCircle : faCheckCircle} className="mr-2" />
                            {error || 'Signing you up...'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Signup;
