import React from 'react';
import { User, Gender } from '../types';
import ProfileDetailCard from './ProfileDetailCard';
import { SparklesIcon, XIcon } from '../constants';

interface ProfileModalProps {
    user: User | null;
    onClose: () => void;
    onGenerateIcebreakers: (user: User) => void;
    gender?: Gender;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onGenerateIcebreakers, gender }) => {
    if (!user) return null;

    const isMaleTheme = gender === Gender.Male;
    const generateButtonClass = isMaleTheme ? 'bg-green-700 hover:bg-green-600' : 'bg-brand-purple hover:bg-brand-purple/90';

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="profile-modal-title"
        >
            <div 
                className="bg-dark-2 rounded-2xl w-full max-w-md h-[85vh] flex flex-col border border-dark-3 shadow-lg" 
                onClick={e => e.stopPropagation()}
            >
                <div className="relative flex-grow">
                    <ProfileDetailCard user={user} />
                </div>
                <div className="p-4 border-t border-dark-3">
                    <button 
                        onClick={() => onGenerateIcebreakers(user)} 
                        className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${generateButtonClass}`}
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        Generate Icebreakers
                    </button>
                </div>
                <button 
                    onClick={onClose} 
                    className="absolute -top-3 -right-3 bg-dark-3 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-dark-3/80"
                    aria-label="Close profile"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ProfileModal;