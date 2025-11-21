
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { ChatIcon, XIcon, HeartIcon } from '../constants';
import type { ColorTheme } from '../constants';

interface MatchOverlayProps {
    currentUser: User;
    matchedUser: User;
    onClose: () => void;
    onSendMessage: (message: string) => void;
    activeColorTheme: ColorTheme;
}

const MatchOverlay: React.FC<MatchOverlayProps> = ({ currentUser, matchedUser, onClose, onSendMessage, activeColorTheme }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Trigger entrance animation
        setIsVisible(true);
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-1/95 backdrop-blur-md p-6 overflow-hidden">
            {/* Background Effects */}
            <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${activeColorTheme.gradientFrom} to-transparent opacity-20 blur-[100px] animate-pulse`}></div>
            
            <div className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                
                {/* Match Text */}
                <div className="mb-8 relative">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-600 animate-text-gradient-flow drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        IT'S A MATCH!
                    </h1>
                    <div className="absolute -top-6 -right-6 text-yellow-400 animate-bounce delay-100">
                        <HeartIcon className="w-12 h-12 fill-current" />
                    </div>
                </div>

                <p className="text-gray-300 text-lg mb-10 max-w-md">
                    You and <span className="font-bold text-white">{matchedUser.name}</span> like each other.
                </p>

                {/* Avatars */}
                <div className="flex items-center justify-center gap-4 mb-12 relative">
                    {/* User Avatar */}
                    <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden transform transition-transform duration-700 ${isVisible ? 'translate-x-4 rotate-[-10deg]' : '-translate-x-full'}`}>
                        <img src={currentUser.photos[0]} alt="You" className="w-full h-full object-cover" />
                    </div>

                    {/* Heart Icon Center */}
                    <div className="absolute z-20 bg-white text-brand-pink p-3 rounded-full shadow-lg animate-ping-slow">
                        <HeartIcon className="w-8 h-8 fill-current" />
                    </div>

                    {/* Matched Avatar */}
                    <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden transform transition-transform duration-700 ${isVisible ? '-translate-x-4 rotate-[10deg]' : 'translate-x-full'}`}>
                        <img src={matchedUser.photos[0]} alt={matchedUser.name} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-sm space-y-4">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Say hello..."
                            className="flex-grow bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink backdrop-blur-sm"
                        />
                        <button 
                            type="submit"
                            disabled={!message.trim()}
                            className={`p-3 rounded-full ${activeColorTheme.bg} text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform`}
                        >
                            <ChatIcon className="w-6 h-6" />
                        </button>
                    </form>

                    <button 
                        onClick={onClose}
                        className="w-full py-3 text-gray-400 font-semibold hover:text-white transition-colors border border-transparent hover:border-white/20 rounded-full"
                    >
                        Keep Swiping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchOverlay;
