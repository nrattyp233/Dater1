import { useState } from 'react';

interface AuthProps {
  onSuccess: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Create user profile in JSONBin
            const response = await fetch('/.netlify/functions/data-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateUser',
                    payload: {
                        id: email,
                        name: email.split('@')[0],
                        age: 25,
                        bio: 'Hey there! I just joined Create-A-Date.',
                        photos: [],
                        interests: [],
                        gender: 'male',
                        isPremium: false,
                        preferences: {
                            interestedIn: ['female'],
                            ageRange: { min: 18, max: 50 }
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create user profile');
            }

            // Store user session in local storage
            const session = {
                email,
                name: email.split('@')[0],
                createdAt: new Date().toISOString(),
                isNewUser: true
            };
            localStorage.setItem('user_session', JSON.stringify(session));
            onSuccess();
        } catch (err) {
            console.error('Sign up error:', err);
            localStorage.removeItem('user_session'); // Clean up if profile creation failed
            setError('An error occurred during sign up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Fetch user profile from JSONBin
            const response = await fetch('/.netlify/functions/data-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getUser',
                    payload: { id: email }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userProfile = await response.json();

            // Store user session in local storage
            const session = {
                email,
                name: userProfile.name || email.split('@')[0],
                createdAt: new Date().toISOString(),
                isNewUser: false
            };
            localStorage.setItem('user_session', JSON.stringify(session));
            onSuccess();
        } catch (err) {
            console.error('Login error:', err);
            localStorage.removeItem('user_session'); // Clean up if login failed
            setError('Failed to login. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            
            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                {isSignUp && (
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                )}

                {error && (
                    <div className="mb-4 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                >
                    {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
            </form>

            <div className="mt-4 text-center text-sm">
                <button
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                    }}
                    className="text-purple-500 hover:text-purple-700"
                >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
            </div>
        </div>
    );
}