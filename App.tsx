import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, User, DatePost, Message, Badge, LocalEvent, Business, Deal, DateCategory } from './types';
import { colorThemes, ColorTheme, BADGES, TicketIcon, PlusIcon, CATEGORY_IMAGE_FALLBACKS, PLACEHOLDER_IMAGE_URL } from './constants';
import * as api from './services/api';
import { categorizeDatePost, getCityFromCoords, getNearbyMajorCity } from './services/geminiService';
import { useToast, ToastProvider } from './contexts/ToastContext';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';

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

const PRE_LAUNCH_MODE = false;

// --- NEW COMPONENT: AllEventsView ---
interface AllEventsViewProps {
    events: LocalEvent[];
    location: string;
    onCreateDateFromEvent: (event: LocalEvent) => void;
    onBack: () => void;
    activeColorTheme: ColorTheme;
}

const AllEventsView: React.FC<AllEventsViewProps> = ({ events, location, onCreateDateFromEvent, onBack, activeColorTheme }) => {
    // Re-defining LocalEventCard here to avoid massive refactoring or prop drilling.
    const LocalEventCard: React.FC<{ event: LocalEvent; onCreate: (event: LocalEvent) => void; }> = ({ event, onCreate }) => {
        const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.currentTarget;
            const fallbackSrc = CATEGORY_IMAGE_FALLBACKS[event.category] || PLACEHOLDER_IMAGE_URL;
            if (target.src !== fallbackSrc) {
                target.src = fallbackSrc;
            }
        };

        return (
            <div className="bg-dark-2 rounded-2xl overflow-hidden border border-dark-3 shadow-lg group relative">
                <img 
                    src={event.imageUrl?.trim() || CATEGORY_IMAGE_FALLBACKS[event.category] || PLACEHOLDER_IMAGE_URL} 
                    onError={handleImageError}
                    alt={event.title} 
                    className="w-full h-40 object-cover" 
                />
                <div className="p-4">
                    <h4 className="font-bold text-lg text-white truncate">{event.title}</h4>
                    <p className="text-sm text-gray-300 truncate">{event.location}</p>
                    <button 
                        onClick={() => onCreate(event)}
                        className="mt-3 w-full py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                        aria-label={`Create a date from ${event.title}`}
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Create Date
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="text-gray-300 hover:text-white">&larr; Back to Marketplace</button>
                <h2 className={`text-3xl font-bold bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>
                    All Events in {location}
                </h2>
            </div>
            {events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <LocalEventCard key={event.id} event={event} onCreate={onCreateDateFromEvent} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400">No events found for this location.</p>
            )}
        </div>
    );
};


const MainApp: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
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
    
    const [activeColorTheme, setActiveColorTheme] = useState<ColorTheme>(colorThemes[0]);
    const lastColorIndex = useRef(0);

    const [appBackground, setAppBackground] = useState<string | null>(null);

    const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
    const [searchLocation, setSearchLocation] = useState('');
    const [effectiveSearchLocation, setEffectiveSearchLocation] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isEventsLoading, setIsEventsLoading] = useState(false);
    const [eventForDate, setEventForDate] = useState<LocalEvent | null>(null);
    
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isBusinessLoading, setIsBusinessLoading] = useState(true);
    const [businessForDate, setBusinessForDate] = useState<{ business: Business; deal?: Deal } | null>(null);

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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!session) {
                setCurrentUser(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setIsBusinessLoading(true);
                const savedBackground = localStorage.getItem('appBackground');
                if (savedBackground) setAppBackground(savedBackground);
                
                const userProfile = await api.getCurrentUserProfile();
                if (userProfile) {
                    setCurrentUser(userProfile);
                    // Now fetch data that depends on the current user
                    const [
                        fetchedUsers, 
                        fetchedDatePosts, 
                        fetchedMessages, 
                        fetchedMatches,
                        fetchedSwipedLeftIds,
                        fetchedBusinesses,
                        fetchedDeals
                    ] = await Promise.all([
                        api.getUsers(), 
                        api.getDatePosts(), 
                        api.getMessages(),
                        api.getMatches(userProfile.id),
                        api.getSwipedLeftIds(userProfile.id),
                        api.getBusinesses(),
                        api.getDealsForBusiness(0),
                    ]);
                    setUsers(fetchedUsers);
                    setDatePosts(fetchedDatePosts);
                    setMessages(fetchedMessages);
                    setMatches(fetchedMatches);
                    setSwipedLeftIds(fetchedSwipedLeftIds);
                    setBusinesses(fetchedBusinesses);
                    setDeals(fetchedDeals);
                } else {
                     showToast('Could not load your profile.', 'error');
                }
            } catch (error: any) {
                showToast(error.message || 'Failed to load app data. Please refresh.', 'error');
                // If profile loading/creation fails critically, log the user out to return to a stable state.
                await supabase.auth.signOut();
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
                setIsBusinessLoading(false);
            }
        };

        fetchInitialData();
    }, [session, showToast]);
    
    // FIX: Added useEffect for automatic geolocation on app startup.
    useEffect(() => {
        // This effect should only run once when the user is logged in and has no location set.
        if (session && !searchLocation) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const city = await getCityFromCoords(position.coords.latitude, position.coords.longitude);
                            setSearchLocation(city);
                            showToast(`Location automatically set to ${city}`, 'info');
                        } catch (error) {
                            showToast('Could not automatically determine your city. Please search manually.', 'error');
                        }
                    },
                    (error) => {
                        console.warn(`Geolocation error: ${error.message}`);
                        showToast('Location access was denied. Please search for a city to find events.', 'info');
                    }
                );
            } else {
                showToast('Geolocation is not supported by your browser. Please search for a city.', 'info');
            }
        }
    }, [session, searchLocation, showToast]);


    // Effect for fetching local events and expanding search if necessary
    useEffect(() => {
        const fetchAndExpandSearch = async () => {
            if (!session || !searchLocation) {
                setLocalEvents([]);
                setEffectiveSearchLocation('');
                setIsSearchExpanded(false);
                return;
            }
            
            setIsEventsLoading(true);
            try {
                const initialEvents = await api.getLocalEvents(searchLocation);
                const initialPostsCount = datePosts.filter(p => p.location.toLowerCase().includes(searchLocation.toLowerCase())).length;
                const totalResults = initialEvents.length + initialPostsCount;

                const MIN_RESULTS_THRESHOLD = 5;
                if (totalResults < MIN_RESULTS_THRESHOLD) {
                    showToast('Not many results. Expanding search to nearby areas...', 'info');
                    const majorCity = await getNearbyMajorCity(searchLocation);
                    
                    if (majorCity && majorCity.toLowerCase() !== searchLocation.toLowerCase()) {
                        const expandedEvents = await api.getLocalEvents(majorCity);
                        setLocalEvents(expandedEvents);
                        setEffectiveSearchLocation(majorCity);
                        setIsSearchExpanded(true);
                    } else {
                        setLocalEvents(initialEvents);
                        setEffectiveSearchLocation(searchLocation);
                        setIsSearchExpanded(false);
                    }
                } else {
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
    }, [searchLocation, session, showToast, datePosts]);


    useEffect(() => {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * colorThemes.length); } 
        while (colorThemes.length > 1 && newIndex === lastColorIndex.current);
        lastColorIndex.current = newIndex;
        setActiveColorTheme(colorThemes[newIndex]);
    }, [currentView]);

    const matchedUsers = useMemo(() => {
        return users.filter(user => matches.includes(user.id));
    }, [users, matches]);
    
    const sentMessageCount = useMemo(() => {
        if (!currentUser || currentUser.isPremium) return 0;
        return messages.filter(m => m.senderId === currentUser.id).length;
    }, [messages, currentUser]);
    
    const FREE_MESSAGE_LIMIT = 20;

    const usersForSwiping = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => {
            const isNotCurrentUser = u.id !== currentUser.id;
            const isNotMatched = !matches.includes(u.id);
            const isNotSwipedLeft = !swipedLeftIds.includes(u.id);
            const isNotSwipedRight = !swipedRightIds.includes(u.id);
            if (!currentUser.preferences) return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight;
            
            const matchesGenderPref = currentUser.preferences.interestedIn.includes(u.gender);
            const matchesAgePref = u.age >= currentUser.preferences.ageRange.min && u.age <= currentUser.preferences.ageRange.max;
            
            return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight && matchesGenderPref && matchesAgePref;
        });
    }, [users, matches, swipedLeftIds, swipedRightIds, currentUser]);
    
    const myDates = datePosts.filter(d => currentUser && d.createdBy === currentUser.id);
    
    const earnBadge = (badgeId: Badge['id']) => {
        if (!currentUser || currentUser.earnedBadgeIds?.includes(badgeId)) return;

        showToast(`Badge Unlocked: ${BADGES[badgeId].name}!`, 'success');
        const updatedUser = { ...currentUser, earnedBadgeIds: [...(currentUser.earnedBadgeIds || []), badgeId] };
        api.updateUser(updatedUser).then(savedUser => {
            setCurrentUser(savedUser);
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
            setCurrentUser(savedUser);
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
            const newMessage = await api.sendMessage(currentUser.id, receiverId, text);
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
    const handleCreateDateFromEvent = (event: LocalEvent) => { setEventForDate(event); setCurrentView(View.Create); showToast('Pre-filled date from event!', 'info'); };
    const clearEventForDate = () => setEventForDate(null);
    const handleCreateDateFromBusiness = (business: Business, deal?: Deal) => { setBusinessForDate({ business, deal }); setCurrentView(View.Create); showToast(`Planning a date at ${business.name}!`, 'info'); };
    const clearBusinessForDate = () => setBusinessForDate(null);
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
    const handleSignOut = async () => { await supabase.auth.signOut(); setCurrentUser(null); setCurrentView(View.Swipe); showToast("You've been signed out.", "info"); };

    const renderView = () => {
        if (isLoading || (session && !currentUser)) return <div className="text-center pt-20 text-xl font-semibold">Loading Your Profile...</div>;
        if (!currentUser) return <div className="text-center text-red-500">Error: Could not load user data.</div>;

        switch (currentView) {
            case View.Swipe: return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onSuperLike={handleSuperLike} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.Dates: return <DateMarketplace datePosts={datePosts} allUsers={users} businesses={businesses} deals={deals} onToggleInterest={handleToggleInterest} onPriorityInterest={handlePriorityInterest} currentUserId={currentUser.id} gender={currentUser?.gender} isLoading={isLoading} onViewProfile={handleViewProfile} onViewBusiness={handleViewBusiness} activeColorTheme={activeColorTheme} localEvents={localEvents} onCreateDateFromEvent={handleCreateDateFromEvent} isEventsLoading={isEventsLoading} searchLocation={searchLocation} effectiveSearchLocation={effectiveSearchLocation} isSearchExpanded={isSearchExpanded} onSearchLocationChange={setSearchLocation} onPremiumFeatureClick={handleOpenMonetizationModal} onSeeAll={() => setCurrentView(View.AllEvents)} />;
            case View.Create: return <CreateDateForm onCreateDate={handleCreateDate} currentUser={currentUser} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} eventForDate={eventForDate} onClearEventForDate={clearEventForDate} businessForDate={businessForDate} onClearBusinessForDate={clearBusinessForDate} />;
            case View.Matches: return <MatchesView matchedUsers={matchedUsers} currentUser={currentUser} onViewProfile={handleViewProfile} onPlanDate={handlePlanDate} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.Chat: return <ChatView currentUser={currentUser} matchedUsers={matchedUsers} allUsers={users} messages={messages} onSendMessage={handleSendMessage} onViewProfile={handleViewProfile} isChatDisabled={!currentUser?.isPremium && sentMessageCount >= FREE_MESSAGE_LIMIT} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.MyDates: return <MyDatesManager myDates={myDates} allUsers={users} onChooseApplicant={handleChooseApplicant} onDeleteDate={handleDeleteDate} gender={currentUser?.gender} onViewProfile={handleViewProfile} activeColorTheme={activeColorTheme} />;
            case View.BusinessSignup: return <BusinessSignupForm activeColorTheme={activeColorTheme} />;
            case View.Leaderboard: return <LeaderboardView activeColorTheme={activeColorTheme} onViewProfile={handleViewProfile} />;
            case View.Profile: return <ProfileSettings currentUser={currentUser} onSave={handleUpdateProfile} onGetFeedback={handleGetProfileFeedback} activeColorTheme={activeColorTheme} onSignOut={handleSignOut} onPremiumFeatureClick={handleOpenMonetizationModal} onSetAppBackground={handleSetAppBackground} />;
            case View.AllEvents: return <AllEventsView events={localEvents} location={effectiveSearchLocation} onCreateDateFromEvent={handleCreateDateFromEvent} onBack={() => setCurrentView(View.Dates)} activeColorTheme={activeColorTheme} />;
            default: return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onSuperLike={handleSuperLike} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} />;
        }
    };

    if (!session) {
        return <Auth onAuthSuccess={() => {}} />;
    }

    return (
        <div className="min-h-screen font-sans bg-cover bg-center bg-fixed" style={{ backgroundImage: appBackground ? `linear-gradient(rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 0.7)), url(${appBackground})` : 'none', backgroundColor: '#121212' }}>
            <Header currentView={currentView} setCurrentView={setCurrentView} activeColorTheme={activeColorTheme} />
            <main className="pt-28 pb-10 px-4 container mx-auto">
                {renderView()}
            </main>
            {isProfileModalOpen && <ProfileModal user={selectedUserForModal} onClose={handleCloseProfile} onGenerateIcebreakers={handleGenerateIcebreakersFromProfile} gender={currentUser?.gender} />}
            {isBusinessModalOpen && <BusinessDetailModal business={selectedBusinessForModal} allDeals={deals} onClose={handleCloseBusiness} onCreateDate={handleCreateDateFromBusiness} />}
            {isIcebreakerModalOpen && <IcebreakerModal user={selectedUserForModal} onClose={handleCloseIcebreakers} gender={currentUser?.gender} onSendIcebreaker={(message) => { if(selectedUserForModal && currentUser) { handleSendMessage(selectedUserForModal.id, message); handleCloseIcebreakers(); setCurrentView(View.Chat); } }} />}
            {isFeedbackModalOpen && currentUser && <ProfileFeedbackModal user={currentUser} onClose={handleCloseProfileFeedback} gender={currentUser?.gender}/>}
            {/* FIX: Corrected typo from handleClosePlanner to handleCloseDatePlanner */}
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