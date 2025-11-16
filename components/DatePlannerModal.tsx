import React, { useState, useEffect } from 'react';
import { User, Gender, DateIdea } from '../types';
import { generateDateIdeas } from '../services/geminiService';
import { SparklesIcon, XIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { SkeletonLoader } from './SkeletonLoader';

interface DatePlannerModalProps {
    users: [User, User] | null;
    onClose: () => void;
    gender?: Gender;
}

const DatePlannerModal: React.FC<DatePlannerModalProps> = ({ users, onClose, gender }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [ideas, setIdeas] = useState<DateIdea[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const isMaleTheme = gender === Gender.Male;
    const gradientTextClass = isMaleTheme ? 'from-green-700 to-lime-400' : 'from-brand-pink to-brand-purple';

    const fetchIdeas = async (user1: User, user2: User) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateDateIdeas(user1, user2);
            setIdeas(result);
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
            showToast(err.message || 'Failed to get ideas.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (users) {
            fetchIdeas(users[0], users[1]);
        }
    }, [users]);

    if (!users) return null;

    const [, user2] = users;

    const IdeaSkeleton = () => (
        <div className="bg-dark-3 p-4 rounded-lg">
            <SkeletonLoader className="h-6 w-3/4 mb-3 rounded" />
            <SkeletonLoader className="h-4 w-1/2 mb-4 rounded" />
            <SkeletonLoader className="h-4 w-full rounded" />
            <SkeletonLoader className="h-4 w-5/6 mt-2 rounded" />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="planner-title">
            <div className="bg-dark-2 rounded-2xl w-full max-w-lg p-6 border border-dark-3 shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="planner-title" className={`text-2xl font-bold bg-gradient-to-r ${gradientTextClass} text-transparent bg-clip-text`}>
                        Date Ideas for {user2.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {isLoading && (
                    <div className="space-y-4 py-4" aria-live="polite">
                        <IdeaSkeleton />
                        <IdeaSkeleton />
                        <IdeaSkeleton />
                    </div>
                )}
                
                {error && (
                     <div className="text-center py-8 text-red-400" role="alert">
                        <p>Oops! Could not generate date ideas.</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {ideas.map((idea, index) => (
                           <div key={index} className="bg-dark-3 p-4 rounded-lg animate-fade-in group transition-all duration-300 hover:bg-dark-3/80">
                               <div className="flex items-start gap-4">
                                   <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isMaleTheme ? 'bg-green-700' : 'bg-brand-pink'}`}>
                                       {index + 1}
                                   </div>
                                   <div className="flex-1">
                                       <h3 className="text-lg font-bold text-white">{idea.title}</h3>
                                       <p className="text-sm text-gray-400 font-semibold mb-2 italic">Location: {idea.location}</p>
                                       <p className="text-gray-300">{idea.description}</p>
                                   </div>
                               </div>
                           </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatePlannerModal;