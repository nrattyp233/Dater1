import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, User, DatePost, Message, Badge, LocalEvent, Business, Deal } from './types';
import { CURRENT_USER_ID, colorThemes, ColorTheme, BADGES } from './constants';
import * as api from './services/api';
import { categorizeDatePost, getCityFromCoords, getNearbyMajorCity } from './services/geminiService';
import { useToast, ToastProvider } from './contexts/ToastContext';

import Header from './components/Header';
import SwipeDeck from './components/SwipeDeck';
import DateMarketplace from './components/DateMarketplace';
import CreateDateForm from './components/CreateDateForm';
import MyDatesManager from './components/MyDatesManager';
import ProfileSettings from './components/ProfileSettings';
import MatchesView from './components/MatchesView';
import ChatView from './components/ChatView';
import ProfileModal from './components/ProfileModal';
import IcebreakerModal from './components/IcebreakerModal';
import ProfileFeedbackModal from './components/ProfileFeedbackModal';
import DatePlannerModal from './components/DatePlannerModal';
import MonetizationModal from './components/MonetizationModal';
import Auth from './components/Auth';
import BusinessSignupForm from './components/BusinessSignupForm';
import BusinessDetailModal from './components/BusinessDetailModal';
import LeaderboardView from './components/LeaderboardView';
import LandingPage from './components/LandingPage';

// --- PRE-LAUNCH CONTROL ---
// Set to `true` to show the landing page, `false` to show the full app.
const PRE_LAUNCH_MODE = false;


const MainApp: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [currentView, setCurrentView] = useState<View>(View.Swipe);
    const [users, setUsers] = useState<User[]>([]);
    const [datePosts, setDatePosts] = useState<DatePost[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [matches, setMatches] = useState<number[]>([]);
    const [swipedLeftIds, setSwipedLeftIds] = useState<number[]>([]);
    const [swipedRightIds, setSwipedRightIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSwipedUserId, setLastSwipedUserId] = useState<number | null>(null);
    const { showToast } = useToast();
    
    // State for dynamic color theme
    const [activeColorTheme, setActiveColorTheme] = useState<ColorTheme>(colorThemes[0]);
    const lastColorIndex = useRef(0);

    // State for customizable app background
    const [appBackground, setAppBackground] = useState<string | null>(null);

    // State for local events and location search
    const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
    const [searchLocation, setSearchLocation] = useState('');
    const [effectiveSearchLocation, setEffectiveSearchLocation] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isEventsLoading, setIsEventsLoading] = useState(false);
    const [eventForDate, setEventForDate] = useState<LocalEvent | null>(null);
    
    // State for business features
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]); // Assuming we might fetch all deals at once
    const [isBusinessLoading, setIsBusinessLoading] = useState(true);
    const [businessForDate, setBusinessForDate] = useState<{ business: Business; deal?: Deal } | null>(null);

    // State for modals, centralized here
    const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isIcebreakerModalOpen, setIsIcebreakerModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isDatePlannerModalOpen, setIsDatePlannerModalOpen] = useState(false);
    const [usersForDatePlanning, setUsersForDatePlanning] = useState<[User, User] | null>(null);
    const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);
    const [selectedBusinessForModal, setSelectedBusinessForModal] = useState<Business | null>(null);
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                setIsBusinessLoading(true);
                const savedBackground = localStorage.getItem('appBackground');
                if (savedBackground) setAppBackground(savedBackground);

                // Attempt to get user's location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            try {
                                const city = await getCityFromCoords(
                                    position.coords.latitude,
                                    position.coords.longitude
                                );
                                showToast(`Location found! Showing local dates for ${city}.`, 'info');
                                setSearchLocation(city);
                            } catch (geoError) {
                                console.error("Reverse geocoding failed:", geoError);
                                showToast("Could not determine city from your location. Please search manually.", 'info');
                            }
                        },
                        (error) => {
                            console.warn(`Geolocation error: ${error.message}`);
                            showToast("Could not get your location. Please search for a city.", 'info');
                        }
                    );
                } else {
                    showToast("Geolocation is not supported by your browser. Please search for a city.", 'info');
                }

                const [
                    fetchedUsers, 
                    fetchedDatePosts, 
                    fetchedMessages, 
                    fetchedMatches,
                    fetchedSwipedLeftIds,
                    fetchedBusinesses,
                    // In a real app, you might fetch deals per business, but for mock it's ok
                    fetchedDeals
                ] = await Promise.all([
                    api.getUsers(), 
                    api.getDatePosts(), 
                    api.getMessages(),
                    api.getMatches(CURRENT_USER_ID),
                    api.getSwipedLeftIds(CURRENT_USER_ID),
                    api.getBusinesses(),
                    api.getDealsForBusiness(0), // Dummy call to get all deals
                ]);
                setUsers(fetchedUsers);
                setDatePosts(fetchedDatePosts);
                setMessages(fetchedMessages);
                setMatches(fetchedMatches);
                setSwipedLeftIds(fetchedSwipedLeftIds);
                setBusinesses(fetchedBusinesses);
                setDeals(fetchedDeals);

            } catch (error) {
                showToast('Failed to load app data. Please refresh.', 'error');
            } finally {
                setIsLoading(false);
                setIsBusinessLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchInitialData();
        }
    }, [showToast, isAuthenticated]);

    // Effect for fetching local events and expanding search if necessary
    useEffect(() => {
        const fetchAndExpandSearch = async () => {
            if (!isAuthenticated || !searchLocation) {
                setLocalEvents([]);
                setEffectiveSearchLocation('');
                setIsSearchExpanded(false);
                return;
            }
            
            setIsEventsLoading(true);
            try {
                // 1. Initial Search
                const initialEvents = await api.getLocalEvents(searchLocation);
                const initialPostsCount = datePosts.filter(p => p.location.toLowerCase().includes(searchLocation.toLowerCase())).length;
                const totalResults = initialEvents.length + initialPostsCount;

                // 2. Check Threshold
                const MIN_RESULTS_THRESHOLD = 5;
                if (totalResults < MIN_RESULTS_THRESHOLD) {
                    showToast('Not many results. Expanding search to nearby areas...', 'info');
                    
                    // 3. Find Nearby Major City
                    const majorCity = await getNearbyMajorCity(searchLocation);
                    
                    if (majorCity && majorCity.toLowerCase() !== searchLocation.toLowerCase()) {
                        // 4. Expanded Search
                        const expandedEvents = await api.getLocalEvents(majorCity);
                        setLocalEvents(expandedEvents);
                        setEffectiveSearchLocation(majorCity);
                        setIsSearchExpanded(true);
                    } else {
                        // No major city found or it's the same, use initial results
                        setLocalEvents(initialEvents);
                        setEffectiveSearchLocation(searchLocation);
                        setIsSearchExpanded(false);
                    }
                } else {
                    // 5. Sufficient Results, No Expansion Needed
                    setLocalEvents(initialEvents);
                    setEffectiveSearchLocation(searchLocation);
                    setIsSearchExpanded(false);
                }
            } catch (error) {
                showToast('Failed to load local data. Please try another location.', 'error');
                setLocalEvents([]);
                setEffectiveSearchLocation(searchLocation);
                setIsSearchExpanded(false);
            } finally {
                setIsEventsLoading(false);
            }
        };

        fetchAndExpandSearch();
    }, [searchLocation, isAuthenticated, showToast, datePosts]);


    useEffect(() => {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * colorThemes.length); } 
        while (colorThemes.length > 1 && newIndex === lastColorIndex.current);
        lastColorIndex.current = newIndex;
        setActiveColorTheme(colorThemes[newIndex]);
    }, [currentView]);


    const currentUser = useMemo(() => users.find(u => u.id === CURRENT_USER_ID), [users]);

    const matchedUsers = useMemo(() => {
        return users.filter(user => matches.includes(user.id));
    }, [users, matches]);
    
    const sentMessageCount = useMemo(() => {
        if (!currentUser || currentUser.isPremium) return 0;
        return messages.filter(m => m.senderId === CURRENT_USER_ID).length;
    }, [messages, currentUser]);
    
    const FREE_MESSAGE_LIMIT = 20;

    const usersForSwiping = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => {
            const isNotCurrentUser = u.id !== CURRENT_USER_ID;
            const isNotMatched = !matches.includes(u.id);
            const isNotSwipedLeft = !swipedLeftIds.includes(u.id);
            const isNotSwipedRight = !swipedRightIds.includes(u.id);
            if (!currentUser.preferences) return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight;
            
            const matchesGenderPref = currentUser.preferences.interestedIn.includes(u.gender);
            const matchesAgePref = u.age >= currentUser.preferences.ageRange.min && u.age <= currentUser.preferences.ageRange.max;
            
            return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight && matchesGenderPref && matchesAgePref;
        });
    }, [users, matches, swipedLeftIds, swipedRightIds, currentUser]);
    
    const myDates = datePosts.filter(d => d.createdBy === CURRENT_USER_ID);
    
    const earnBadge = (badgeId: Badge['id']) => {
        const user = users.find(u => u.id === CURRENT_USER_ID);
        if (!user || user.earnedBadgeIds?.includes(badgeId)) {
            return;
        }

        showToast(`Badge Unlocked: ${BADGES[badgeId].name}!`, 'success');
        const updatedUser = { ...user, earnedBadgeIds: [...(user.earnedBadgeIds || []), badgeId] };
        api.updateUser(updatedUser).then(savedUser => {
            setUsers(prevUsers => prevUsers.map(u => u.id === CURRENT_USER_ID ? savedUser : u));
        });
    };

    const handleSwipe = async (userId: number, direction: 'left' | 'right') => {
        if (!currentUser) return;
        setLastSwipedUserId(userId);
        try {
            const { isMatch } = await api.recordSwipe(currentUser.id, userId, direction);
            if (direction === 'right') {
                setSwipedRightIds(prev => [...prev, userId]);
                if (isMatch) {
                    setMatches(prev => [...prev, userId]);
                    const matchedUser = users.find(u => u.id === userId);
                    showToast(`You matched with ${matchedUser?.name}!`, 'success');
                }
            } else {
                setSwipedLeftIds(prev => [...prev, userId]);
            }
        } catch (error) {
            showToast('Something went wrong with your swipe.', 'error');
        }
    };
    
    const handleSuperLike = async (userId: number) => {
        if (!currentUser) return;
        setLastSwipedUserId(userId);
        try {
            const { isMatch } = await api.recordSuperLike(currentUser.id, userId);
            setSwipedRightIds(prev => [...prev, userId]);
            // In our mock API, a super like behaves like a normal swipe, but we give a special toast.
            // A real backend would handle the special notification.
            if (isMatch) {
                setMatches(prev => [...prev, userId]);
                const matchedUser = users.find(u => u.id === userId);
                showToast(`It's a Super Match with ${matchedUser?.name}!`, 'success');
            } else {
                 showToast(`You Super Liked ${users.find(u => u.id === userId)?.name}!`, 'info');
            }
        } catch (error) {
            showToast('Something went wrong with your super like.', 'error');
        }
    };

    const handleRecall = async () => {
        if (!lastSwipedUserId || !currentUser) return;
        try {
            await api.recallSwipe(currentUser.id, lastSwipedUserId);
            setMatches(prev => prev.filter(id => id !== lastSwipedUserId));
            setSwipedLeftIds(prev => prev.filter(id => id !== lastSwipedUserId));
            setSwipedRightIds(prev => prev.filter(id => id !== lastSwipedUserId));
            const recalledUser = users.find(u => u.id === lastSwipedUserId);
            showToast(`Recalled ${recalledUser?.name || 'profile'}.`, 'info');
            setLastSwipedUserId(null);
        } catch (error) {
             showToast(`Failed to recall swipe.`, 'error');
        }
    };

    const handleToggleInterest = async (dateId: number) => {
        const post = datePosts.find(p => p.id === dateId);
        if (!post || !currentUser) return;
        
        const isInterested = post.applicants.includes(currentUser.id);
        const newApplicants = isInterested 
            ? post.applicants.filter(id => id !== currentUser.id)
            : [...post.applicants, currentUser.id];
            
        try {
            const updatedPost = await api.updateDatePost({ ...post, applicants: newApplicants });
            setDatePosts(prev => prev.map(p => p.id === dateId ? updatedPost : p));
            const message = isInterested ? "You are no longer interested in this date." : "You've expressed interest in this date!";
            showToast(message, isInterested ? 'info' : 'success');
        } catch(error) {
            showToast('Failed to update interest.', 'error');
        }
    };

    const handlePriorityInterest = async (dateId: number) => {
        if (!currentUser) return;
        try {
            const updatedPost = await api.expressPriorityInterest(currentUser.id, dateId);
            setDatePosts(prev => prev.map(p => p.id === dateId ? updatedPost : p));
            showToast("You've shown priority interest! The creator will be notified.", 'success');
        } catch (error) {
            showToast('Failed to show priority interest.', 'error');
        }
    };

    const handleCreateDate = async (newDateData: Omit<DatePost, 'id' | 'createdBy' | 'applicants' | 'chosenApplicantId' | 'categories'>) => {
        if (!currentUser) return;

        showToast('AI is categorizing your date...', 'info');
        try {
            const categories = await categorizeDatePost(newDateData.title, newDateData.description);
            const newDate = await api.createDate({ 
                ...newDateData,
                categories,
                createdBy: currentUser.id,
                applicants: [],
                chosenApplicantId: null
            });

            setDatePosts(prev => [newDate, ...prev]);
            showToast('Your date has been posted!', 'success');
            setCurrentView(View.Dates);

            // Badge Logic
            if (myDates.length === 0) earnBadge('first_date');
            if (myDates.length === 2) earnBadge('prolific_planner');
            const adventurousKeywords = ['hike', 'outdoor', 'adventure', 'explore', 'nature', 'mountain'];
            const dateText = `${newDateData.title.toLowerCase()} ${newDateData.description.toLowerCase()}`;
            if (adventurousKeywords.some(keyword => dateText.includes(keyword))) earnBadge('adventurous');
        } catch (error: any) {
            showToast(error.message || 'Failed to post date.', 'error');
        }
    };

    const handleDeleteDate = async (dateId: number) => {
        try {
            await api.deleteDatePost(dateId);
            setDatePosts(prevPosts => prevPosts.filter(post => post.id !== dateId));
            showToast('Date post has been deleted.', 'info');
        } catch (error) {
            showToast('Failed to delete date.', 'error');
        }
    };

    const handleChooseApplicant = async (dateId: number, applicantId: number) => {
        const post = datePosts.find(p => p.id === dateId);
        if (!post) return;
        try {
            const updatedPost = await api.updateDatePost({ ...post, chosenApplicantId: applicantId });
            setDatePosts(prevPosts => prevPosts.map(p => p.id === dateId ? updatedPost : p));
            const applicant = users.find(u => u.id === applicantId);
            showToast(`You've chosen ${applicant?.name} for your date!`, 'success');
        } catch(error) {
            showToast('Failed to choose applicant.', 'error');
        }
    };

    const handleUpdateProfile = async (updatedUser: User) => {
        try {
            const savedUser = await api.updateUser(updatedUser);
            setUsers(prevUsers => prevUsers.map(u => u.id === savedUser.id ? savedUser : u));
            showToast('Profile saved successfully!', 'success');
        } catch(error) {
            showToast('Failed to save profile.', 'error');
        }
    };

    const handleSendMessage = async (receiverId: number, text: string) => {
        if (!currentUser) return;
        if (!currentUser.isPremium && sentMessageCount >= FREE_MESSAGE_LIMIT) {
            handleOpenMonetizationModal();
            showToast(`You've used your ${FREE_MESSAGE_LIMIT} free messages. Upgrade to Premium for unlimited chat!`, 'info');
            return;
        }

        if (messages.filter(m => m.senderId === currentUser.id).length === 4) earnBadge('starter');
        
        try {
            const newMessage = await api.sendMessage(CURRENT_USER_ID, receiverId, text);
            setMessages(prev => [...prev, newMessage]);
        } catch (error) {
            showToast('Failed to send message.', 'error');
        }
    };
    
    const handleSetAppBackground = (background: string | null) => {
        setAppBackground(background);
        if (background) localStorage.setItem('appBackground', background);
        else localStorage.removeItem('appBackground');
    };

    const handleCreateDateFromEvent = (event: LocalEvent) => {
        setEventForDate(event);
        setCurrentView(View.Create);
        showToast('Pre-filled date from event!', 'info');
    };
    const clearEventForDate = () => setEventForDate(null);

    const handleCreateDateFromBusiness = (business: Business, deal?: Deal) => {
        setBusinessForDate({ business, deal });
        setCurrentView(View.Create);
        showToast(`Planning a date at ${business.name}!`, 'info');
    };
    const clearBusinessForDate = () => setBusinessForDate(null);


    // Modal Handlers
    const handleViewProfile = (user: User) => { setSelectedUserForModal(user); setIsProfileModalOpen(true); };
    const handleCloseProfile = () => { setIsProfileModalOpen(false); setTimeout(() => setSelectedUserForModal(null), 300); };
    const handleViewBusiness = (business: Business) => { setSelectedBusinessForModal(business); setIsBusinessModalOpen(true); };
    const handleCloseBusiness = () => { setIsBusinessModalOpen(false); setTimeout(() => setSelectedBusinessForModal(null), 300); };
    const handleGenerateIcebreakersFromProfile = (user: User) => { setIsProfileModalOpen(false); setSelectedUserForModal(user); setIsIcebreakerModalOpen(true); };
    const handleCloseIcebreakers = () => { setIsIcebreakerModalOpen(false); setTimeout(() => setSelectedUserForModal(null), 300); };
    const handleGetProfileFeedback = () => setIsFeedbackModalOpen(true);
    const handleCloseProfileFeedback = () => setIsFeedbackModalOpen(false);
    const handlePlanDate = (matchedUser: User) => { if (currentUser) { setUsersForDatePlanning([currentUser, matchedUser]); setIsDatePlannerModalOpen(true); } };
    const handleCloseDatePlanner = () => { setIsDatePlannerModalOpen(false); setTimeout(() => setUsersForDatePlanning(null), 300); };
    const handleOpenMonetizationModal = () => setIsMonetizationModalOpen(true);
    const handleCloseMonetizationModal = () => setIsMonetizationModalOpen(false);
    const handleUpgradeToPremium = () => { if (currentUser) { handleUpdateProfile({ ...currentUser, isPremium: true }); handleCloseMonetizationModal(); showToast('Congratulations! You are now a Create-A-Date Premium member.', 'success'); } };

    const handleSignOut = () => { setIsAuthenticated(false); setCurrentView(View.Swipe); showToast("You've been signed out.", "info"); };

    const renderView = () => {
        if (isLoading && isEventsLoading && isBusinessLoading) return <div className="text-center pt-20 text-xl font-semibold">Loading Create-A-Date...</div>;
        if (!currentUser && !isLoading) return <div className="text-center text-red-500">Error: Could not load current user data. Please check your Supabase connection and ensure user with ID 1 exists.</div>;

        switch (currentView) {
            case View.Swipe:
                return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onSuperLike={handleSuperLike} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.Dates:
                return <DateMarketplace 
                            datePosts={datePosts} 
                            allUsers={users} 
                            businesses={businesses} 
                            deals={deals} 
                            onToggleInterest={handleToggleInterest} 
                            onPriorityInterest={handlePriorityInterest} 
                            currentUserId={CURRENT_USER_ID} 
                            gender={currentUser?.gender} 
                            isLoading={isLoading} 
                            onViewProfile={handleViewProfile} 
                            onViewBusiness={handleViewBusiness} 
                            activeColorTheme={activeColorTheme} 
                            localEvents={localEvents} 
                            onCreateDateFromEvent={handleCreateDateFromEvent} 
                            isEventsLoading={isEventsLoading} 
                            searchLocation={searchLocation}
                            effectiveSearchLocation={effectiveSearchLocation}
                            isSearchExpanded={isSearchExpanded}
                            onSearchLocationChange={setSearchLocation} 
                            onPremiumFeatureClick={handleOpenMonetizationModal} 
                        />;
            case View.Create:
                return <CreateDateForm onCreateDate={handleCreateDate} currentUser={currentUser!} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} eventForDate={eventForDate} onClearEventForDate={clearEventForDate} businessForDate={businessForDate} onClearBusinessForDate={clearBusinessForDate} />;
            case View.Matches:
                return <MatchesView matchedUsers={matchedUsers} currentUser={currentUser!} onViewProfile={handleViewProfile} onPlanDate={handlePlanDate} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
             case View.Chat:
                return <ChatView currentUser={currentUser!} matchedUsers={matchedUsers} allUsers={users} messages={messages} onSendMessage={handleSendMessage} onViewProfile={handleViewProfile} isChatDisabled={!currentUser?.isPremium && sentMessageCount >= FREE_MESSAGE_LIMIT} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.MyDates:
                return <MyDatesManager myDates={myDates} allUsers={users} onChooseApplicant={handleChooseApplicant} onDeleteDate={handleDeleteDate} gender={currentUser?.gender} onViewProfile={handleViewProfile} activeColorTheme={activeColorTheme} />;
            case View.BusinessSignup:
                return <BusinessSignupForm activeColorTheme={activeColorTheme} />;
            case View.Leaderboard:
                return <LeaderboardView activeColorTheme={activeColorTheme} onViewProfile={handleViewProfile} />;
            case View.Profile:
                return <ProfileSettings currentUser={currentUser!} onSave={handleUpdateProfile} onGetFeedback={handleGetProfileFeedback} activeColorTheme={activeColorTheme} onSignOut={handleSignOut} onPremiumFeatureClick={handleOpenMonetizationModal} onSetAppBackground={handleSetAppBackground} />;
            default:
                return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onSuperLike={handleSuperLike} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} />;
        }
    };

    if (!isAuthenticated) {
        return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div 
             className="min-h-screen font-sans bg-cover bg-center bg-fixed" 
             style={{ backgroundImage: appBackground ? `linear-gradient(rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 0.7)), url(${appBackground})` : 'none', backgroundColor: '#121212' }}
        >
            <Header currentView={currentView} setCurrentView={setCurrentView} activeColorTheme={activeColorTheme} />
            <main className="pt-28 pb-10 px-4 container mx-auto">
                {renderView()}
            </main>
            {isProfileModalOpen && <ProfileModal user={selectedUserForModal} onClose={handleCloseProfile} onGenerateIcebreakers={handleGenerateIcebreakersFromProfile} gender={currentUser?.gender} />}
            {isBusinessModalOpen && <BusinessDetailModal business={selectedBusinessForModal} allDeals={deals} onClose={handleCloseBusiness} onCreateDate={handleCreateDateFromBusiness} />}
            {isIcebreakerModalOpen && <IcebreakerModal user={selectedUserForModal} onClose={handleCloseIcebreakers} gender={currentUser?.gender} onSendIcebreaker={(message) => { if(selectedUserForModal) { handleSendMessage(selectedUserForModal.id, message); handleCloseIcebreakers(); setCurrentView(View.Chat); } }} />}
            {isFeedbackModalOpen && <ProfileFeedbackModal user={currentUser!} onClose={handleCloseProfileFeedback} gender={currentUser?.gender}/>}
            {isDatePlannerModalOpen && <DatePlannerModal users={usersForDatePlanning} onClose={handleCloseDatePlanner} gender={currentUser?.gender}/>}
            {isMonetizationModalOpen && <MonetizationModal onClose={handleCloseMonetizationModal} onUpgrade={handleUpgradeToPremium} />}
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        {PRE_LAUNCH_MODE ? <LandingPage /> : <MainApp />}
    </ToastProvider>
);

export default App;
