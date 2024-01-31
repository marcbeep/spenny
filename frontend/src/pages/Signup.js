import { useState } from 'react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const res = await fetch('https://spenny-api.reeflink.org/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email,
                    email,
                    password,
                }),
            });
            const data = await res.json();
            console.log(data);
            // Redirect or show success message
        } catch (err) {
            console.log(err);
            // Show error message
        }
    }

    return (
        <div className="flex items-center justify-center">
            <div className="px-8 py-6 mt-4 text-left">
                <h3 className="text-2xl font-bold text-center">Signup</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="email">Email</label>
                            <input type="email" placeholder="email" 
                                   className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                   value={email} 
                                   onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="mt-4">
                            <label className="block" htmlFor="password">Password</label>
                            <input type="password" placeholder="password" 
                                   className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                   value={password} 
                                   onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button type="submit" 
                                    className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Signup</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup;
