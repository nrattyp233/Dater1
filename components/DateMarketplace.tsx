import React, { useState, useMemo } from 'react';
import { DatePost, User, Gender, DateCategory } from '../types';
import { SkeletonLoader } from './SkeletonLoader';
import { MapPinIcon, AlertTriangleIcon } from '../constants';
import { DATE_CATEGORIES } from '../constants';
import type { ColorTheme } from '../constants';

interface DateCardProps {
    datePost: DatePost;
    allUsers: User[];
    onToggleInterest: (dateId: number) => void;
    isInterested: boolean;
    isCreator: boolean;
    gender?: Gender;
    onViewProfile: (user: User) => void;
}

const DateCard: React.FC<DateCardProps> = ({ datePost, allUsers, onToggleInterest, isInterested, isCreator, gender, onViewProfile }) => {
    const creator = allUsers.find(u => u.id === datePost.createdBy);

    if (!creator) return null;

    const formattedDate = new Date(datePost.dateTime).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
    
    const isMaleTheme = gender === Gender.Male;
    const hoverBorderClass = isMaleTheme ? 'hover:border-green-600' : 'hover:border-brand-pink';
    const titleClass = isMaleTheme ? 'text-white' : 'text-brand-light';
    const creatorTextColor = isMaleTheme ? 'text-lime-400' : 'text-brand-light';
    
    const handleGetDirections = () => {
        if (!datePost.location) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(datePost.location)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`bg-dark-2 rounded-2xl p-6 flex flex-col gap-4 border border-dark-3 ${hoverBorderClass} transition-colors duration-300`}>
            <button 
                onClick={() => onViewProfile(creator)}
                className="flex items-center gap-3 text-left w-full rounded-lg p-1 -ml-1 hover:bg-dark-3/50 transition-colors"
                aria-label={`View profile of ${creator.name}`}
            >
                <img src={creator.photos[0]} alt={creator.name} className="w-12 h-12 rounded-full object-cover"/>
                <div>
                    <p className="font-semibold text-white">{creator.name}, {creator.age}</p>
                    <p className="text-sm text-gray-400">Posted a date idea</p>
                </div>
            </button>
            <div>
                <h3 className={`text-xl font-bold ${titleClass}`}>{datePost.title}</h3>
                <p className="text-gray-300 mt-2">{datePost.description}</p>
            </div>
            {datePost.categories && datePost.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {datePost.categories.map(category => (
                        <div key={category} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${DATE_CATEGORIES[category]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                           {category === 'Adult (18+)' && <AlertTriangleIcon className="w-3 h-3" />}
                           {category}
                        </div>
                    ))}
                </div>
            )}
            <div className="border-t border-dark-3 pt-4 flex flex-col gap-2 text-sm text-gray-400">
                <div className="flex justify-between items-start">
                    <div>
                        <p><span className="font-semibold text-gray-300">Where:</span> {datePost.location}</p>
                        <p><span className="font-semibold text-gray-300">When:</span> {formattedDate}</p>
                    </div>
                    <button 
                        onClick={handleGetDirections}
                        className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors"
                        aria-label="Get directions"
                    >
                        <MapPinIcon className="w-4 h-4" />
                        Directions
                    </button>
                </div>
            </div>
            {!isCreator && (
                 <button 
                    onClick={() => onToggleInterest(datePost.id)} 
                    className={`mt-2 w-full py-2 rounded-lg font-bold transition-all duration-300 ${isInterested ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30'}`}
                 >
                    {isInterested ? "I'm Not Interested" : "I'm Interested!"}
                 </button>
            )}
            {isCreator && (
                <div className={`mt-2 w-full py-2 text-center rounded-lg bg-dark-3 ${creatorTextColor} font-bold`}>This is your date</div>
            )}
        </div>
    );
};


interface DateMarketplaceProps {
    datePosts: DatePost[];
    allUsers: User[];
    onToggleInterest: (dateId: number) => void;
    currentUserId: number;
    gender?: Gender;
    isLoading: boolean;
    onViewProfile: (user: User) => void;
    activeColorTheme: ColorTheme;
}

const DateMarketplace: React.FC<DateMarketplaceProps> = ({ datePosts, allUsers, onToggleInterest, currentUserId, gender, isLoading, onViewProfile, activeColorTheme }) => {
    const [activeCategory, setActiveCategory] = useState<DateCategory | 'All'>('All');

    const filteredDatePosts = useMemo(() => {
        if (activeCategory === 'All') return datePosts;
        return datePosts.filter(post => post.categories.includes(activeCategory));
    }, [datePosts, activeCategory]);

    const allCategories = ['All' as const, ...Object.keys(DATE_CATEGORIES) as DateCategory[]];
    
    const DateCardSkeleton = () => (
        <div className="bg-dark-2 rounded-2xl p-6 border border-dark-3">
            <div className="flex items-center gap-3">
                <SkeletonLoader className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                    <SkeletonLoader className="h-5 w-1/3 rounded" />
                    <SkeletonLoader className="h-4 w-1/2 mt-2 rounded" />
                </div>
            </div>
            <div className="mt-4">
                <SkeletonLoader className="h-6 w-3/4 mb-3 rounded" />
                <SkeletonLoader className="h-4 w-full rounded" />
                <SkeletonLoader className="h-4 w-5/6 mt-2 rounded" />
            </div>
             <div className="border-t border-dark-3 pt-4 mt-4">
                <SkeletonLoader className="h-4 w-1/2 rounded" />
                <SkeletonLoader className="h-4 w-2/3 mt-2 rounded" />
             </div>
             <SkeletonLoader className="h-10 w-full mt-4 rounded-lg" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
             <h2 className={`text-3xl font-bold text-center mb-4 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Date Marketplace</h2>
             
             <div className="flex flex-wrap justify-center gap-2 mb-8">
                {allCategories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 border ${
                            activeCategory === category
                                ? `${activeColorTheme.bg} text-white border-transparent ${activeColorTheme.glow}`
                                : 'bg-dark-3 border-dark-3 text-gray-400 hover:bg-dark-3/80 hover:border-gray-600'
                        }`}
                    >
                        {category}
                    </button>
                ))}
             </div>

             <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <>
                        <DateCardSkeleton />
                        <DateCardSkeleton />
                    </>
                ) : (
                    filteredDatePosts.map(post => {
                        const isInterested = post.applicants.includes(currentUserId);
                        const isCreator = post.createdBy === currentUserId;
                        return (
                            <DateCard 
                                key={post.id} 
                                datePost={post} 
                                allUsers={allUsers}
                                onToggleInterest={onToggleInterest}
                                isInterested={isInterested}
                                isCreator={isCreator}
                                gender={gender}
                                onViewProfile={onViewProfile}
                            />
                        );
                    })
                )}
                {!isLoading && filteredDatePosts.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                        <h3 className="text-xl font-bold text-gray-300">No dates found in this category.</h3>
                        <p className="mt-2">Try a different category or check back later!</p>
                    </div>
                )}
             </div>
        </div>
    );
};

export default DateMarketplace;