import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, User, DatePost } from './types';
import { CURRENT_USER_ID, colorThemes, ColorTheme } from './constants';
import * as api from './services/api';
import { useToast, ToastProvider } from './contexts/ToastContext';

import Header from './components/Header';
import SwipeDeck from './components/SwipeDeck';
import DateMarketplace from './components/DateMarketplace';
import CreateDateForm from './components/CreateDateForm';
import MyDatesManager from './components/MyDatesManager';
import ProfileSettings from './components/ProfileSettings';
import MatchesView from './components/MatchesView';
import ProfileModal from './components/ProfileModal';
import IcebreakerModal from './components/IcebreakerModal';
import ProfileFeedbackModal from './components/ProfileFeedbackModal';
import DatePlannerModal from './components/DatePlannerModal';
import MonetizationModal from './components/MonetizationModal';

const MainApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.Swipe);
    const [users, setUsers] = useState<User[]>([]);
    const [datePosts, setDatePosts] = useState<DatePost[]>([]);
    const [matches, setMatches] = useState<number[]>([4, 6, 2, 5]); // Pre-populate with matches for demo
    const [swipedLeftIds, setSwipedLeftIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSwipedUserId, setLastSwipedUserId] = useState<number | null>(null);
    const { showToast } = useToast();
    
    // State for dynamic color theme
    const [activeColorTheme, setActiveColorTheme] = useState<ColorTheme>(colorThemes[0]);
    const lastColorIndex = useRef(0);

    // State for modals, centralized here
    const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isIcebreakerModalOpen, setIsIcebreakerModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isDatePlannerModalOpen, setIsDatePlannerModalOpen] = useState(false);
    const [usersForDatePlanning, setUsersForDatePlanning] = useState<[User, User] | null>(null);
    const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const [fetchedUsers, fetchedDatePosts] = await Promise.all([
                    api.getUsers(),
                    api.getDatePosts()
                ]);
                setUsers(fetchedUsers);
                setDatePosts(fetchedDatePosts);
            } catch (error) {
                showToast('Failed to load app data. Please refresh.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [showToast]);

    useEffect(() => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * colorThemes.length);
        } while (colorThemes.length > 1 && newIndex === lastColorIndex.current);

        lastColorIndex.current = newIndex;
        setActiveColorTheme(colorThemes[newIndex]);
    }, [currentView]);


    const currentUser = useMemo(() => users.find(u => u.id === CURRENT_USER_ID), [users]);

    const matchedUsers = useMemo(() => {
        return users.filter(user => matches.includes(user.id));
    }, [users, matches]);

    const usersForSwiping = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => {
            const isNotCurrentUser = u.id !== CURRENT_USER_ID;
            const isNotMatched = !matches.includes(u.id);
            const isNotSwipedLeft = !swipedLeftIds.includes(u.id);
            if (!currentUser.preferences) return isNotCurrentUser && isNotMatched && isNotSwipedLeft;
            
            const matchesGenderPref = currentUser.preferences.interestedIn.includes(u.gender);
            const matchesAgePref = u.age >= currentUser.preferences.ageRange.min && u.age <= currentUser.preferences.ageRange.max;
            
            return isNotCurrentUser && isNotMatched && isNotSwipedLeft && matchesGenderPref && matchesAgePref;
        });
    }, [users, matches, swipedLeftIds, currentUser]);
    
    const myDates = datePosts.filter(d => d.createdBy === CURRENT_USER_ID);

    const handleSwipe = (userId: number, direction: 'left' | 'right') => {
        setLastSwipedUserId(userId);
        if (direction === 'right') {
            setMatches(prev => [...prev, userId]);
            const matchedUser = users.find(u => u.id === userId);
            showToast(`You matched with ${matchedUser?.name}!`, 'success');
        } else {
            setSwipedLeftIds(prev => [...prev, userId]);
        }
    };
    
    const handleRecall = () => {
        if (!lastSwipedUserId) return;
        
        // Remove the user from whichever list they were added to
        setMatches(prev => prev.filter(id => id !== lastSwipedUserId));
        setSwipedLeftIds(prev => prev.filter(id => id !== lastSwipedUserId));

        const recalledUser = users.find(u => u.id === lastSwipedUserId);
        showToast(`Recalled ${recalledUser?.name || 'profile'}.`, 'info');
        setLastSwipedUserId(null);
    };

    const handleExpressInterest = (dateId: number) => {
        setDatePosts(prevPosts => prevPosts.map(post => {
            if (post.id === dateId && !post.applicants.includes(CURRENT_USER_ID)) {
                return { ...post, applicants: [...post.applicants, CURRENT_USER_ID] };
            }
            return post;
        }));
    };

    const handleCreateDate = (newDateData: Omit<DatePost, 'id' | 'createdBy' | 'applicants' | 'chosenApplicantId'>) => {
        const newDate = api.createDate(newDateData, CURRENT_USER_ID);
        setDatePosts(prev => [newDate, ...prev]);
        showToast('Your date has been posted!', 'success');
        setCurrentView(View.Dates);
    };

    const handleChooseApplicant = (dateId: number, applicantId: number) => {
        setDatePosts(prevPosts => prevPosts.map(post => {
            if (post.id === dateId) {
                return { ...post, chosenApplicantId: applicantId };
            }
            return post;
        }));
        const applicant = users.find(u => u.id === applicantId);
        showToast(`You've chosen ${applicant?.name} for your date!`, 'success');
    };

    const handleUpdateProfile = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        showToast('Profile saved successfully!', 'success');
    };

    // Modal Handlers
    const handleViewProfile = (user: User) => {
        setSelectedUserForModal(user);
        setIsProfileModalOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileModalOpen(false);
        setTimeout(() => setSelectedUserForModal(null), 300);
    };

    const handleGenerateIcebreakersFromProfile = (user: User) => {
        setIsProfileModalOpen(false);
        setSelectedUserForModal(user);
        setIsIcebreakerModalOpen(true);
    };

    const handleCloseIcebreakers = () => {
        setIsIcebreakerModalOpen(false);
        setTimeout(() => setSelectedUserForModal(null), 300);
    };

    const handleGetProfileFeedback = () => setIsFeedbackModalOpen(true);
    const handleCloseProfileFeedback = () => setIsFeedbackModalOpen(false);

    const handlePlanDate = (matchedUser: User) => {
        if (currentUser) {
            setUsersForDatePlanning([currentUser, matchedUser]);
            setIsDatePlannerModalOpen(true);
        }
    };
    const handleCloseDatePlanner = () => {
        setIsDatePlannerModalOpen(false);
        setTimeout(() => setUsersForDatePlanning(null), 300);
    };

    // Monetization Handlers
    const handleOpenMonetizationModal = () => setIsMonetizationModalOpen(true);
    const handleCloseMonetizationModal = () => setIsMonetizationModalOpen(false);
    const handleUpgradeToPremium = () => {
        if (currentUser) {
            const updatedUser = { ...currentUser, isPremium: true };
            setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
            handleCloseMonetizationModal();
            showToast('Congratulations! You are now a Dater Premium member.', 'success');
        }
    };

    const renderView = () => {
        if (!currentUser && isLoading) {
            return <div className="text-center">Loading Dater...</div>;
        }
        if (!currentUser && !isLoading) {
            return <div className="text-center text-red-500">Error: Could not load current user data.</div>;
        }

        switch (currentView) {
            case View.Swipe:
                return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.Dates:
                return <DateMarketplace datePosts={datePosts} allUsers={users} onExpressInterest={handleExpressInterest} currentUserId={CURRENT_USER_ID} gender={currentUser?.gender} isLoading={isLoading} onViewProfile={handleViewProfile} activeColorTheme={activeColorTheme} />;
            case View.Create:
                return <CreateDateForm onCreateDate={handleCreateDate} currentUser={currentUser!} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.Matches:
                return <MatchesView matchedUsers={matchedUsers} currentUser={currentUser!} onViewProfile={handleViewProfile} onPlanDate={handlePlanDate} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.MyDates:
                return <MyDatesManager myDates={myDates} allUsers={users} onChooseApplicant={handleChooseApplicant} gender={currentUser?.gender} onViewProfile={handleViewProfile} activeColorTheme={activeColorTheme} />;
            case View.Profile:
                return <ProfileSettings currentUser={currentUser!} onSave={handleUpdateProfile} onGetFeedback={handleGetProfileFeedback} activeColorTheme={activeColorTheme} />;
            default:
                return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} />;
        }
    };

    return (
        <div className="min-h-screen bg-dark-1 font-sans">
            <Header currentView={currentView} setCurrentView={setCurrentView} activeColorTheme={activeColorTheme} />
            <main className="pt-28 pb-10 px-4 container mx-auto">
                {renderView()}
            </main>

            {isProfileModalOpen && <ProfileModal user={selectedUserForModal} onClose={handleCloseProfile} onGenerateIcebreakers={handleGenerateIcebreakersFromProfile} gender={currentUser?.gender} />}
            {isIcebreakerModalOpen && <IcebreakerModal user={selectedUserForModal} onClose={handleCloseIcebreakers} gender={currentUser?.gender} />}
            {isFeedbackModalOpen && <ProfileFeedbackModal user={currentUser!} onClose={handleCloseProfileFeedback} gender={currentUser?.gender}/>}
            {isDatePlannerModalOpen && <DatePlannerModal users={usersForDatePlanning} onClose={handleCloseDatePlanner} gender={currentUser?.gender}/>}
            {isMonetizationModalOpen && <MonetizationModal onClose={handleCloseMonetizationModal} onUpgrade={handleUpgradeToPremium} />}
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <MainApp />
    </ToastProvider>
);

export default App;