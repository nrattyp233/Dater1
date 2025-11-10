import React, { useState } from 'react';
import { signIn, signUp } from '../services/supabaseClient';
import { useToast } from '../contexts/ToastContext';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onBusinessSignup: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBusinessSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (isLogin) {
        // Handle sign in
        response = await signIn(email, password);
      } else {
        // Handle sign up
        response = await signUp(email, password);
      }
      
      if (response.error) throw response.error;
      
      // If we get here, authentication was successful
      const user = response.data.user || response.data.session?.user;
      if (user) {
        showToast(
          isLogin ? 'Successfully signed in!' : 'Account created successfully!',
          'success'
        );
        onAuthSuccess(user);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = error.message || 'An error occurred during authentication';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" 
              placeholder="you@example.com" 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" 
              placeholder="••••••••" 
              disabled={isLoading}
            />
          </div>
          
          {!isLogin && (
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input 
                type="password" 
                id="confirm-password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition" 
                placeholder="••••••••" 
                disabled={isLoading}
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
              isLoading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-brand-pink to-brand-purple hover:opacity-90 hover:shadow-glow-pink'
            } text-white`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-4">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-gray-400 hover:text-white transition block w-full"
            disabled={isLoading}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
          
          {isLogin && (
            <button 
              onClick={onBusinessSignup}
              className="text-sm text-brand-pink hover:underline"
              disabled={isLoading}
            >
              Business Owner? Sign up here
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;