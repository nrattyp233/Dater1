import React, { useState, useEffect } from 'react';
import { User, Gender } from '../types';
import { getProfileFeedback } from '../services/geminiService';
import { LightbulbIcon, XIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { SkeletonLoader } from './SkeletonLoader';

interface ProfileFeedbackModalProps {
    user: User | null;
    onClose: () => void;
    gender?: Gender;
}

const ProfileFeedbackModal: React.FC<ProfileFeedbackModalProps> = ({ user, onClose, gender }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [tips, setTips] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const isMaleTheme = gender === Gender.Male;
    const gradientTextClass = isMaleTheme ? 'from-green-700 to-lime-400' : 'from-brand-pink to-brand-purple';

    const fetchFeedback = async (currentUser: User) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getProfileFeedback(currentUser);
            setTips(result);
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
            showToast(err.message || 'Failed to get feedback.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFeedback(user);
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <div className="bg-dark-2 rounded-2xl w-full max-w-lg p-6 border border-dark-3 shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="feedback-title" className={`text-2xl font-bold bg-gradient-to-r ${gradientTextClass} text-transparent bg-clip-text`}>
                        AI Profile Feedback
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {isLoading && (
                    <div className="space-y-4 py-4" aria-live="polite">
                        <div className="flex items-start gap-3">
                            <SkeletonLoader className="w-6 h-6 rounded-full flex-shrink-0 mt-1" />
                            <SkeletonLoader className="w-full h-5 rounded" />
                        </div>
                         <div className="flex items-start gap-3">
                            <SkeletonLoader className="w-6 h-6 rounded-full flex-shrink-0 mt-1" />
                            <SkeletonLoader className="w-4/5 h-5 rounded" />
                        </div>
                         <div className="flex items-start gap-3">
                            <SkeletonLoader className="w-6 h-6 rounded-full flex-shrink-0 mt-1" />
                            <SkeletonLoader className="w-full h-5 rounded" />
                        </div>
                    </div>
                )}
                
                {error && (
                     <div className="text-center py-8 text-red-400" role="alert">
                        <p>Oops! Could not generate feedback.</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="space-y-4">
                        {tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3 bg-dark-3 p-4 rounded-lg">
                                <LightbulbIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${isMaleTheme ? 'text-lime-400' : 'text-brand-light'}`} />
                                <p className="text-gray-200 flex-1">{tip}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileFeedbackModal;