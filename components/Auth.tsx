import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
    onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError(null);
    };

    const handleSignUp = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    }
                }
            });

            if (error) throw error;

            if (data.user && !data.session) {
                setError('Please check your email and click the confirmation link to complete registration.');
            } else {
                onAuthSuccess();
            }
        } catch (error: any) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setError('🚨 Database connection failed. Please check that your Supabase project is active and not paused. Visit your Supabase dashboard to resume the project.');
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;
            onAuthSuccess();
        } catch (error: any) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setError('🚨 Database connection failed. Please check that your Supabase project is active and not paused. Visit your Supabase dashboard to resume the project.');
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            handleSignIn();
        } else {
            handleSignUp();
        }
    };

    return (
        <div className="min-h-screen bg-dark-1 flex flex-col items-center justify-center p-4 font-sans">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 text-transparent bg-clip-text mb-2">
                    Create-A-Date
                </h1>
                <p className="text-xl italic text-brand-light/90 tracking-wide">Beyond the swipe.</p>
            </div>

            <div className="w-full max-w-sm bg-dark-2 p-8 rounded-2xl shadow-lg border border-dark-3">
                <h2 className="text-2xl font-bold text-center text-white mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                id="fullName" 
                                name="fullName" 
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required={!isLogin}
                                className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" 
                                placeholder="Enter your full name" 
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            required 
                            className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" 
                            placeholder="you@example.com" 
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={formData.password}
                            onChange={handleInputChange}
                            required 
                            className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" 
                            placeholder="••••••••" 
                        />
                    </div>
                    {!isLogin && (
                        <div>
                            <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required={!isLogin}
                                className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" 
                                placeholder="••••••••" 
                            />
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90 hover:shadow-glow-pink disabled:opacity-50"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
                        }} 
                        className="text-sm text-gray-400 hover:text-white transition"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;