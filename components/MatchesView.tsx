import React from 'react';
import { User, Gender } from '../types';
import { SparklesIcon, CrownIcon } from '../constants';
import type { ColorTheme } from '../constants';

interface MatchesViewProps {
    matchedUsers: User[];
    currentUser: User;
    onViewProfile: (user: User) => void;
    onPlanDate: (user: User) => void;
    activeColorTheme: ColorTheme;
    onPremiumFeatureClick: () => void;
}

const MatchCard: React.FC<{
    user: User;
    onViewProfile: () => void;
    onPlanDate: () => void;
    isMaleTheme: boolean;
    isPremium: boolean;
    onPremiumFeatureClick: () => void;
}> = ({ user, onViewProfile, onPlanDate, isMaleTheme, isPremium, onPremiumFeatureClick }) => {
    const planButtonClass = isMaleTheme
        ? 'bg-green-700/80 hover:bg-green-700/100'
        : 'bg-brand-purple/80 hover:bg-brand-purple/100';

    const handlePlanDateClick = () => {
        if (isPremium) {
            onPlanDate();
        } else {
            onPremiumFeatureClick();
        }
    };

    return (
        <div className="bg-dark-2 rounded-2xl overflow-hidden shadow-lg border border-dark-3 flex flex-col group transition-all duration-300 hover:shadow-xl">
            <div className="relative cursor-pointer" onClick={onViewProfile}>
                <img src={user.photos[0]} alt={user.name} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-xl font-bold text-white">{user.name}, {user.age}</h3>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 <p className="text-gray-400 text-sm h-10 overflow-hidden text-ellipsis mt-1 flex-grow">{user.bio}</p>
                 <button
                    onClick={handlePlanDateClick}
                    className={`relative mt-4 w-full py-2.5 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${planButtonClass} shadow-lg group-hover:scale-105 group-hover:shadow-xl`}
                 >
                    {!isPremium && (
                        <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                           <CrownIcon className="w-3 h-3" />
                       </div>
                    )}
                    <SparklesIcon className="w-5 h-5"/>
                    Plan Date with AI
                 </button>
            </div>
        </div>
    );
};

const LockedMatchCard: React.FC<{ onPremiumFeatureClick: () => void }> = ({ onPremiumFeatureClick }) => {
    return (
        <div className="bg-dark-2 rounded-2xl overflow-hidden shadow-lg border border-dark-3 flex flex-col group">
            <div className="relative cursor-pointer flex-grow" onClick={onPremiumFeatureClick}>
                <div className="absolute inset-0 bg-dark-3 blur-sm" />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
                    <CrownIcon className="w-10 h-10 text-yellow-400 mb-2" />
                    <h3 className="text-lg font-bold text-white">Unlock More Matches</h3>
                    <p className="text-sm text-gray-300">Upgrade to Premium to see who liked you.</p>
                </div>
            </div>
        </div>
    );
};


const MatchesView: React.FC<MatchesViewProps> = ({ matchedUsers, currentUser, onViewProfile, onPlanDate, activeColorTheme, onPremiumFeatureClick }) => {
    const FREE_MATCH_LIMIT = 2;
    if (matchedUsers.length === 0) {
        return (
            <div className="text-center text-gray-400">
                <h2 className="text-2xl font-bold text-gray-300">No matches yet.</h2>
                <p className="mt-2">Keep swiping to find your match!</p>
            </div>
        );
    }

    const isPremium = currentUser.isPremium;
    const isMaleTheme = currentUser.gender === Gender.Male;

    const visibleMatches = isPremium ? matchedUsers : matchedUsers.slice(0, FREE_MATCH_LIMIT);
    const hiddenMatchCount = isPremium ? 0 : Math.max(0, matchedUsers.length - FREE_MATCH_LIMIT);

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-8 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Your Matches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleMatches.map(user => (
                    <MatchCard
                        key={user.id}
                        user={user}
                        onViewProfile={() => onViewProfile(user)}
                        onPlanDate={() => onPlanDate(user)}
                        isMaleTheme={isMaleTheme}
                        isPremium={isPremium}
                        onPremiumFeatureClick={onPremiumFeatureClick}
                    />
                ))}
                {hiddenMatchCount > 0 && Array.from({ length: hiddenMatchCount }).map((_, index) => (
                    <LockedMatchCard
                        key={`locked-${index}`}
                        onPremiumFeatureClick={onPremiumFeatureClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default MatchesView;