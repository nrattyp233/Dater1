import React, { useState, useEffect } from 'react';
import { User, Gender } from '../types';
import { generateIcebreakers } from '../services/geminiService';
import { SparklesIcon, XIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';

interface IcebreakerModalProps {
    user: User | null;
    onClose: () => void;
    gender?: Gender;
    onSendIcebreaker: (message: string) => void;
}

const IcebreakerModal: React.FC<IcebreakerModalProps> = ({ user, onClose, gender, onSendIcebreaker }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [icebreakers, setIcebreakers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const isMaleTheme = gender === Gender.Male;
    const gradientTextClass = isMaleTheme ? 'from-green-700 to-lime-400' : 'from-brand-pink to-brand-purple';

    const fetchIcebreakers = async (currentUser: User) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateIcebreakers(currentUser);
            setIcebreakers(result);
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchIcebreakers(user);
        }
    }, [user]);

    const handleRegenerate = () => {
        if (user) {
            fetchIcebreakers(user);
        }
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Icebreaker copied to clipboard!', 'success');
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="icebreaker-title">
            <div className="bg-dark-2 rounded-2xl w-full max-w-md p-6 border border-dark-3 shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="icebreaker-title" className={`text-2xl font-bold bg-gradient-to-r ${gradientTextClass} text-transparent bg-clip-text`}>
                        Icebreakers for {user.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {isLoading && (
                    <div className="text-center py-8" aria-live="polite">
                        <SparklesIcon className="w-10 h-10 text-brand-purple animate-pulse mx-auto" />
                        <p className="mt-3 text-gray-300">Crafting some clever openers...</p>
                    </div>
                )}
                
                {error && (
                     <div className="text-center py-8 text-red-400" role="alert">
                        <p>Oops! Could not generate icebreakers.</p>
                        <p className="text-sm">{error}</p>
                        <button onClick={handleRegenerate} className="mt-4 bg-brand-pink text-white px-4 py-2 rounded-lg font-semibold">Try Again</button>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="space-y-3">
                        {icebreakers.map((icebreaker, index) => (
                            <div key={index} className="bg-dark-3 p-4 rounded-lg flex justify-between items-center gap-2">
                                <p className="text-gray-200 flex-1">{icebreaker}</p>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleCopy(icebreaker)} className="bg-gray-600 text-white text-sm px-3 py-1 rounded-md font-semibold hover:bg-gray-500 transition">
                                        Copy
                                    </button>
                                    <button 
                                        onClick={() => onSendIcebreaker(icebreaker)} 
                                        className={`text-white text-sm px-3 py-1 rounded-md font-semibold transition ${isMaleTheme ? 'bg-green-700 hover:bg-green-600' : 'bg-brand-pink hover:bg-brand-pink/80'}`}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && (
                     <div className="mt-6 text-center">
                        <button onClick={handleRegenerate} className={`bg-transparent border ${isMaleTheme ? 'border-lime-500 text-lime-500 hover:bg-lime-500/10' : 'border-brand-pink text-brand-pink hover:bg-brand-pink/10'} px-5 py-2 rounded-lg font-semibold transition flex items-center gap-2 mx-auto`}>
                           <SparklesIcon className="w-5 h-5" />
                           Generate New Ideas
                        </button>
                     </div>
                )}
            </div>
        </div>
    );
};

export default IcebreakerModal;