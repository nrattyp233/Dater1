import React, { useState } from 'react';
import { DatePost, User, Gender } from '../types';
import { MapPinIcon } from '../constants';
import type { ColorTheme } from '../constants';

interface ApplicantCardProps {
    user: User;
    onChoose: () => void;
    isChosen: boolean;
    hasChosenSomeoneElse: boolean;
    isMaleTheme: boolean;
    onViewProfile: (user: User) => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ user, onChoose, isChosen, hasChosenSomeoneElse, isMaleTheme, onViewProfile }) => {
    const chooseButtonClass = isMaleTheme ? 'bg-green-700' : 'bg-brand-pink';

    return (
        <div className="flex items-center justify-between bg-dark-3 p-3 rounded-lg">
            <button
                onClick={() => onViewProfile(user)}
                className="flex items-center gap-3 text-left flex-1 min-w-0 rounded-lg p-1 -ml-1 hover:bg-dark-2/50 transition-colors"
                aria-label={`View profile of ${user.name}`}
            >
                <img src={user.photos[0]} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user.name}, {user.age}</p>
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
    gender?: Gender;
    onViewProfile: (user: User) => void;
    activeColorTheme: ColorTheme;
}

const MyDatesManager: React.FC<MyDatesManagerProps> = ({ myDates, allUsers, onChooseApplicant, onDeleteDate, gender, onViewProfile, activeColorTheme }) => {
    const [selectedDateId, setSelectedDateId] = useState<number | null>(myDates.length > 0 ? myDates[0].id : null);

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

    if (myDates.length === 0) {
        return (
            <div className="text-center text-gray-400">
                <h2 className="text-2xl font-bold text-gray-300">You haven't created any dates yet.</h2>
                <p className="mt-2">Go to the "Create-A-Date" tab to post your first idea!</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-8 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Manage Your Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col gap-3">
                    {myDates.map(date => (
                        <button key={date.id} onClick={() => setSelectedDateId(date.id)} className={`p-4 rounded-lg text-left transition ${selectedDateId === date.id ? activeClass : 'bg-dark-2 hover:bg-dark-3'}`}>
                           <p className="font-bold">{date.title}</p>
                           <p className="text-sm">{date.applicants.length} applicant(s)</p>
                        </button>
                    ))}
                </div>
                <div className="md:col-span-2 bg-dark-2 p-6 rounded-2xl min-h-[300px] flex flex-col">
                    {selectedDate ? (
                        <div className="flex flex-col flex-grow">
                            <h3 className={`text-2xl font-bold ${titleClass}`}>{selectedDate.title}</h3>
                            <div className="flex justify-between items-center mt-1 mb-6">
                                <p className="text-gray-400">Location: {selectedDate.location}</p>
                                <button 
                                    onClick={handleGetDirections}
                                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors"
                                    aria-label="Get directions"
                                >
                                    <MapPinIcon className="w-4 h-4" />
                                    Directions
                                </button>
                            </div>
                            
                            <h4 className="font-semibold mb-4">Applicants:</h4>
                            <div className="flex-grow">
                                {selectedDate.applicants.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedDate.applicants.map(applicantId => {
                                            const user = allUsers.find(u => u.id === applicantId);
                                            if (!user) return null;
                                            return (
                                                <ApplicantCard
                                                    key={user.id}
                                                    user={user}
                                                    onChoose={() => onChooseApplicant(selectedDate.id, user.id)}
                                                    isChosen={selectedDate.chosenApplicantId === user.id}
                                                    hasChosenSomeoneElse={selectedDate.chosenApplicantId !== null && selectedDate.chosenApplicantId !== user.id}
                                                    isMaleTheme={isMaleTheme}
                                                    onViewProfile={onViewProfile}
                                                />
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No one has expressed interest yet. Check back soon!</p>
                                )}
                            </div>
                            <div className="border-t border-dark-3 mt-6 pt-6">
                                <button 
                                    onClick={handleDeleteClick}
                                    className="w-full py-2 rounded-lg font-bold bg-red-800/80 text-red-200 hover:bg-red-800 transition-colors"
                                >
                                    Delete This Date
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 m-auto">Select a date to see applicants.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyDatesManager;