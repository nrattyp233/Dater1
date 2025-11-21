
import React from 'react';
import { User } from '../types';
import { MapPinIcon, CheckCircleIcon, UserIcon } from '../constants';
import type { ColorTheme } from '../constants';

interface LocalPeopleViewProps {
    users: User[];
    onViewProfile: (user: User) => void;
    activeColorTheme: ColorTheme;
}

const LocalPeopleView: React.FC<LocalPeopleViewProps> = ({ users, onViewProfile, activeColorTheme }) => {
    // Simulate distance calculation
    const getDistance = (userId: number) => {
        // Deterministic pseudo-random based on ID
        const seed = userId * 9301 + 49297;
        return (seed % 15) + 1; // 1 to 15 miles away
    };

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className={`text-3xl font-bold bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>
                        People Nearby
                    </h2>
                    <p className="text-gray-400 mt-1">Discover singles in your area.</p>
                </div>
                <div className="bg-dark-2 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold text-gray-300 border border-dark-3">
                    <MapPinIcon className="w-4 h-4 text-cyan-400" />
                    <span>Using Current Location</span>
                </div>
            </div>

            {users.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <UserIcon className="w-16 h-16 mx-auto mb-4 text-dark-3" />
                    <h3 className="text-xl font-bold text-gray-300">No one nearby just yet.</h3>
                    <p className="mt-2">Expand your search settings or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {users.map(user => (
                        <button 
                            key={user.id}
                            onClick={() => onViewProfile(user)}
                            className="relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-2 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        >
                            <img 
                                src={user.photos[0]} 
                                alt={user.name} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            
                            {/* Distance Tag */}
                            <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-xs font-medium text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3 text-cyan-400" />
                                {getDistance(user.id)} mi
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-3 text-left">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-white font-bold text-lg truncate">{user.name}, {user.age}</span>
                                    {user.isVerified && <CheckCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-300 truncate">{user.bio}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocalPeopleView;
