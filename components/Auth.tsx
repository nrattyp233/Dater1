import React, { useState } from 'react';

interface AuthProps {
    onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd call your auth service here.
        // For now, we just simulate success.
        onAuthSuccess();
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
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input type="email" id="email" name="email" required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input type="password" id="password" name="password" required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" placeholder="••••••••" />
                    </div>
                    {!isLogin && (
                        <div>
                            <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                            <input type="password" id="confirm-password" name="confirm-password" required className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" placeholder="••••••••" />
                        </div>
                    )}
                     <button type="submit" className="w-full py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90 hover:shadow-glow-pink">
                        {isLogin ? 'Sign In' : 'Sign Up'}
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