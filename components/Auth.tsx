import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { Gender } from '../types';

interface AuthProps {
    onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.Female);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    age: parseInt(age),
                    gender,
                },
            },
        });
        setLoading(false);
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Success! Please check your email to confirm your account.', 'success');
            setIsLogin(true); // Switch to login view after signup
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        if (error) {
            showToast(error.message, 'error');
        } else {
            // onAuthSuccess is now handled by the onAuthStateChange listener in App.tsx
            showToast('Signed in successfully!', 'success');
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
                <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
                    {!isLogin && (
                        <>
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                                    <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" />
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)} required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink">
                                        <option value={Gender.Female}>Female</option>
                                        <option value={Gender.Male}>Male</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" placeholder="••••••••" />
                    </div>
                    {!isLogin && (
                        <div>
                            <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                            <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink" placeholder="••••••••" />
                        </div>
                    )}
                     <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90 hover:shadow-glow-pink disabled:opacity-60">
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-400 hover:text-white transition">
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;