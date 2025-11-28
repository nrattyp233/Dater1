import React, { useState } from 'react';
import { DatePost, User, Gender } from '../types';
import { MapPinIcon, StarIcon, CheckCircleIcon, PencilIcon } from '../constants';
import type { ColorTheme } from '../constants';

interface ApplicantCardProps {
    user: User;
    onChoose: () => void;
    isChosen: boolean;
    hasChosenSomeoneElse: boolean;
    isMaleTheme: boolean;
    onViewProfile: (user: User) => void;
    isPriority: boolean;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ user, onChoose, isChosen, hasChosenSomeoneElse, isMaleTheme, onViewProfile, isPriority }) => {
    const chooseButtonClass = isMaleTheme ? 'bg-green-700' : 'bg-brand-pink';

    return (
        <div className={`flex items-center justify-between bg-dark-3 p-3 rounded-lg transition-all duration-300 ${isPriority ? 'border-2 border-yellow-400/50' : ''}`}>
            <button
                onClick={() => onViewProfile(user)}
                className="flex items-center gap-3 text-left flex-1 min-w-0 rounded-lg p-1 -ml-1 hover:bg-dark-2/50 transition-colors"
                aria-label={`View profile of ${user.name}`}
            >
                {isPriority && <StarIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />}
                <img src={user.photos[0]} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate flex items-center gap-1.5">
                        {user.name}, {user.age}
                        {user.isVerified && <CheckCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{user.bio}</p>
                </div>
            </button>
            <div className="pl-3 flex-shrink-0">
                {!isChosen && !hasChosenSomeoneElse && (
                    <button onClick={onChoose} className={`${chooseButtonClass} text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-80 transition`}>
                        Choose
                    </button>
                )}
                {isChosen && (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Chosen!
                    </div>
                )}
                {!isChosen && hasChosenSomeoneElse && (
                    <div className="text-gray-500 px-4 py-2 font-semibold">
                        -
                    </div>
                )}
            </div>
        </div>
    );
};


interface MyDatesManagerProps {
    myDates: DatePost[];
    allUsers: User[];
    onChooseApplicant: (dateId: number, applicantId: number) => void;
    onDeleteDate: (dateId: number) => void;
    onEditDate: (date: DatePost) => void;
    gender?: Gender;
    onViewProfile: (user: User) => void;
    activeColorTheme: ColorTheme;
}

const MyDatesManager: React.FC<MyDatesManagerProps> = ({ myDates, allUsers, onChooseApplicant, onDeleteDate, onEditDate, gender, onViewProfile, activeColorTheme }) => {
    const [selectedDateId, setSelectedDateId] = useState<number | null>(myDates.length > 0 ? myDates[0].id : null);
    const [sortBy, setSortBy] = useState<'priority' | 'name' | 'age'>('priority');

    const selectedDate = myDates.find(d => d.id === selectedDateId);
    
    const isMaleTheme = gender === Gender.Male;
    const activeClass = isMaleTheme ? 'bg-green-700 text-white' : 'bg-brand-pink text-white';
    const titleClass = isMaleTheme ? 'text-white' : 'text-brand-light';
    
    // Set selectedDateId to the first date if the current one is deleted/no longer exists
    React.useEffect(() => {
        if (myDates.length > 0 && !myDates.find(d => d.id === selectedDateId)) {
            setSelectedDateId(myDates[0].id);
        } else if (myDates.length === 0) {
            setSelectedDateId(null);
        }
    }, [myDates, selectedDateId]);

    const handleGetDirections = () => {
        if (!selectedDate?.location) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedDate.location)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleDeleteClick = () => {
        if (selectedDate) {
            if (window.confirm('Are you sure you want to permanently delete this date post? This action cannot be undone.')) {
                onDeleteDate(selectedDate.id);
            }
        }
    };

    const handleEditDate = () => {
        if (selectedDate) {
            onEditDate(selectedDate);
        }
    };

    // Mock additional applicants for demonstration
    const mockApplicants = React.useMemo(() => {
        if (!selectedDate || selectedDate.applicants.length === 0) return [];
        
        // Create mock users for demonstration
        const mockUsers: User[] = [
            {
                id: 1001,
                name: "Sarah Chen",
                age: 28,
                location: "Denver, CO",
                bio: "Love outdoor adventures and trying new restaurants!",
                photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"],
                interests: ["hiking", "food", "travel"],
                gender: Gender.Female,
                isPremium: false,
                isVerified: true,
                preferences: {
                    interestedIn: [Gender.Male],
                    ageRange: { min: 25, max: 35 },
                    relationshipIntent: 'Exploring',
                    communicationStyle: 'Texting',
                    activityLevel: 'Bit of both'
                },
                earnedBadgeIds: []
            },
            {
                id: 1002,
                name: "Emily Rodriguez",
                age: 26,
                location: "Denver, CO",
                bio: "Coffee enthusiast and dog lover looking for fun dates!",
                photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"],
                interests: ["coffee", "dogs", "music"],
                gender: Gender.Female,
                isPremium: true,
                isVerified: false,
                preferences: {
                    interestedIn: [Gender.Male],
                    ageRange: { min: 24, max: 32 },
                    relationshipIntent: 'Serious',
                    communicationStyle: 'Texting',
                    activityLevel: 'Bit of both'
                },
                earnedBadgeIds: []
            },
            {
                id: 1003,
                name: "Jessica Taylor",
                age: 30,
                location: "Denver, CO",
                bio: "Yoga instructor who loves healthy living and deep conversations.",
                photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"],
                interests: ["yoga", "wellness", "reading"],
                gender: Gender.Female,
                isPremium: false,
                isVerified: true,
                preferences: {
                    interestedIn: [Gender.Male],
                    ageRange: { min: 28, max: 38 },
                    relationshipIntent: 'Serious',
                    communicationStyle: 'Texting',
                    activityLevel: 'Active'
                },
                earnedBadgeIds: []
            }
        ];

        // Combine real applicants with mock ones
        const allApplicantIds = [...selectedDate.applicants];
        if (allApplicantIds.length < 4) {
            const remainingSlots = 4 - allApplicantIds.length;
            for (let i = 0; i < remainingSlots && i < mockUsers.length; i++) {
                allApplicantIds.push(mockUsers[i].id);
            }
        }

        return allApplicantIds;
    }, [selectedDate]);

    const sortedApplicants = React.useMemo(() => {
        if (!selectedDate) return [];
        
        const applicants = mockApplicants.map(applicantId => {
            const user = allUsers.find(u => u.id === applicantId);
            // If not found in real users, check if it's one of our mock users
            if (!user && applicantId >= 1000 && applicantId <= 1003) {
                const mockUsers: User[] = [
                    {
                        id: 1001,
                        name: "Sarah Chen",
                        age: 28,
                        location: "Denver, CO",
                        bio: "Love outdoor adventures and trying new restaurants!",
                        photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"],
                        interests: ["hiking", "food", "travel"],
                        gender: Gender.Female,
                        isPremium: false,
                        isVerified: true,
                        preferences: {
                            interestedIn: [Gender.Male],
                            ageRange: { min: 25, max: 35 },
                            relationshipIntent: 'Exploring',
                            communicationStyle: 'Texting',
                            activityLevel: 'Bit of both'
                        },
                        earnedBadgeIds: []
                    },
                    {
                        id: 1002,
                        name: "Emily Rodriguez",
                        age: 26,
                        location: "Denver, CO",
                        bio: "Coffee enthusiast and dog lover looking for fun dates!",
                        photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"],
                        interests: ["coffee", "dogs", "music"],
                        gender: Gender.Female,
                        isPremium: true,
                        isVerified: false,
                        preferences: {
                            interestedIn: [Gender.Male],
                            ageRange: { min: 24, max: 32 },
                            relationshipIntent: 'Serious',
                            communicationStyle: 'Texting',
                            activityLevel: 'Bit of both'
                        },
                        earnedBadgeIds: []
                    },
                    {
                        id: 1003,
                        name: "Jessica Taylor",
                        age: 30,
                        location: "Denver, CO",
                        bio: "Yoga instructor who loves healthy living and deep conversations.",
                        photos: ["https://ionicframework.com/docs/img/demos/avatar.svg"],
                        interests: ["yoga", "wellness", "reading"],
                        gender: Gender.Female,
                        isPremium: false,
                        isVerified: true,
                        preferences: {
                            interestedIn: [Gender.Male],
                            ageRange: { min: 28, max: 38 },
                            relationshipIntent: 'Serious',
                            communicationStyle: 'Texting',
                            activityLevel: 'Active'
                        },
                        earnedBadgeIds: []
                    }
                ];
                return mockUsers.find(u => u.id === applicantId) || null;
            }
            return user;
        }).filter(Boolean) as User[];

        return [...applicants].sort((a, b) => {
            if (sortBy === 'priority') {
                const aIsPriority = selectedDate.priorityApplicants?.includes(a.id) ?? false;
                const bIsPriority = selectedDate.priorityApplicants?.includes(b.id) ?? false;
                if (aIsPriority && !bIsPriority) return -1;
                if (!aIsPriority && bIsPriority) return 1;
                return 0;
            } else if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'age') {
                return a.age - b.age;
            return 0;
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'age') {
            return a.age - b.age;
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-3">You haven't created any dates yet.</h2>
            <p className="text-gray-400">Go to the "Create-A-Date" tab to post your first idea!</p>
        </div>
    );
}

return (
    <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className={`text-xl font-bold text-center mb-4 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Manage Your Dates</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - My Dates List (1/3 width) */}
            <div className="lg:col-span-1">
                <div className="bg-dark-2 rounded-xl p-4">
                    <h3 className="text-base font-semibold text-white mb-3">My Dates</h3>
                    <div className="space-y-2">
                        {myDates.map(date => (
                            <button 
                                key={date.id} 
                                onClick={() => setSelectedDateId(date.id)} 
                                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${selectedDateId === date.id ? activeClass : 'bg-dark-3 hover:bg-dark-4'}`}
                            >
                               <p className="font-semibold text-sm">{date.title}</p>
                               <p className="text-xs opacity-80">{date.applicants.length} applicant(s)</p>
                               <p className="text-xs opacity-60 mt-1 truncate">{date.location}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Date Details View (2/3 width) */}
            <div className="lg:col-span-2">
                {selectedDate ? (
                    <div className="bg-dark-2 rounded-xl p-6">
                        {/* Header with Edit Button */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <h3 className={`text-xl font-bold ${titleClass}`}>{selectedDate.title}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-sm text-gray-400">Location: {selectedDate.location}</p>
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
                            <button
                                onClick={handleEditDate}
                                className="p-2 rounded-lg bg-dark-3 hover:bg-dark-4 text-gray-400 hover:text-white transition-colors"
                                aria-label="Edit date"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Applicants Section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-white">Applicants ({sortedApplicants.length})</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'priority' | 'name' | 'age')}
                                    className="bg-dark-3 text-white text-sm rounded-lg px-3 py-1.5 border border-dark-4 focus:border-brand-pink focus:outline-none"
                                >
                                    <option value="priority">Sort by Priority</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="age">Sort by Age</option>
                                </select>
                            </div>
                            
                            {/* Scrollable Applicant Container */}
                            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {sortedApplicants.length > 0 ? (
                                    sortedApplicants.map(user => {
                                        const isPriority = selectedDate.priorityApplicants?.includes(user.id) ?? false;
                                        return (
                                            <ApplicantCard
                                                key={user.id}
                                                user={user}
                                                onChoose={() => onChooseApplicant(selectedDate.id, user.id)}
                                                isChosen={selectedDate.chosenApplicantId === user.id}
                                                hasChosenSomeoneElse={selectedDate.chosenApplicantId !== null && selectedDate.chosenApplicantId !== user.id}
                                                isMaleTheme={isMaleTheme}
                                                onViewProfile={onViewProfile}
                                                isPriority={isPriority}
                                            />
                                        )
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No one has expressed interest yet. Check back soon!</p>
                                )}
                            </div>
                        </div>

                        {/* Delete Button */}
                        <div className="border-t border-dark-3 pt-4">
                            <button 
                                onClick={handleDeleteClick}
                                className="w-full py-2.5 rounded-lg font-semibold bg-red-800/80 text-red-200 hover:bg-red-800 transition-colors"
                            >
                                Delete This Date
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-dark-2 rounded-xl p-6 text-center">
                        <p className="text-gray-500">Select a date to see applicants.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default MyDatesManager;