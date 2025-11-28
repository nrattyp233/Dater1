
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, User, DatePost, Message, Badge, LocalEvent, Business, Deal, DateCategory, DateIdea } from './types';
import { colorThemes, ColorTheme, BADGES, TicketIcon, PlusIcon, CATEGORY_IMAGE_FALLBACKS, PLACEHOLDER_IMAGE_URL } from './constants';
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
import LocalPeopleView from './components/LocalPeopleView';
import MatchOverlay from './components/MatchOverlay';
import ReportModal from './components/ReportModal';

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    
    // NEW: State for Match Overlay
    const [matchOverlayUser, setMatchOverlayUser] = useState<User | null>(null);
    
    // NEW: State for Report Modal
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [userToReport, setUserToReport] = useState<User | null>(null);

    // NEW: State for target chat user
    const [selectedChatUserId, setSelectedChatUserId] = useState<number | null>(null);

    // NEW: State for editing dates
    const [editingDate, setEditingDate] = useState<DatePost | null>(null);

    // Clear editingDate when navigating away from Create view
    React.useEffect(() => {
        if (currentView !== View.Create) {
            setEditingDate(null);
        }
    }, [currentView]);

    // --- PULL TO REFRESH STATE ---
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [pullY, setPullY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pullStartY = useRef(0);
    const pullStartX = useRef(0);

    const fetchInitialData = async () => {
        const userProfile = await api.getCurrentUserProfile();

        if (!userProfile) {
            setIsAuthenticated(false);
            setCurrentUser(null);
            setIsLoading(false);
            return;
        }

        setIsAuthenticated(true);

        try {
            setIsLoading(true);
            setIsBusinessLoading(true);
            const savedBackground = localStorage.getItem('appBackground');
            if (savedBackground) setAppBackground(savedBackground);
            
            setCurrentUser(userProfile);
            // Force fresh reload of users
            const [
                fetchedUsers, 
                fetchedDatePosts, 
                fetchedMessages, 
                fetchedMatches, 
                fetchedSwipedLeftIds,
                fetchedSwipedRightIds,
                fetchedBusinesses,
                fetchedDeals
            ] = await Promise.all([
                api.getUsers(), 
                api.getDatePosts(), 
                api.getMessages(),
                api.getMatches(userProfile.id),
                api.getSwipedLeftIds(userProfile.id),
                api.getSwipedRightIds(userProfile.id),
                api.getBusinesses(),
                api.getDealsForBusiness(0),
            ]);
            setUsers(fetchedUsers);
            setDatePosts(fetchedDatePosts);
            setMessages(fetchedMessages);
            setMatches(fetchedMatches);
            setSwipedLeftIds(fetchedSwipedLeftIds);
            setSwipedRightIds(fetchedSwipedRightIds);
            setBusinesses(fetchedBusinesses);
            setDeals(fetchedDeals);
            
        } catch (error: any) {
            showToast(error.message || 'Failed to load app data. Please refresh.', 'error');
            setCurrentUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
            setIsBusinessLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [isAuthenticated]);
    
    // --- AUTONOMOUS SIMULATION HOOK ---
    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;
        
        // Refresh data every 10 seconds to pick up new simulation events
        const interval = setInterval(async () => {
             api.simulateNetworkActivity(currentUser.id, (msg) => showToast(msg, 'info'));
             
             // Reload volatile data
             const [newUsers, newMessages, newMatches, newPosts] = await Promise.all([
                 api.getUsers(), // Fetch new users (respecting blocks)
                 api.getMessages(),
                 api.getMatches(currentUser.id),
                 api.getDatePosts()
             ]);
             setUsers(newUsers); 
             setMessages(newMessages);
             setMatches(newMatches);
             setDatePosts(newPosts);
             
        }, 10000);

        return () => clearInterval(interval);
    }, [isAuthenticated, currentUser, showToast]);


    useEffect(() => {
        if (isAuthenticated && !searchLocation) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const city = await getCityFromCoords(position.coords.latitude, position.coords.longitude);
                            setSearchLocation(city);
                            showToast(`Location automatically set to ${city}`, 'info');
                        } catch (error) {
                            // Silently fail
                        }
                    },
                    (error) => {
                        console.warn(`Geolocation error: ${error.message}`);
                    }
                );
            }
        }
    }, [isAuthenticated, searchLocation, showToast]);


    const fetchAndExpandSearch = async (location: string) => {
        if (!isAuthenticated || !location) {
            setLocalEvents([]);
            setEffectiveSearchLocation('');
            setIsSearchExpanded(false);
            return;
        }
        
        setIsEventsLoading(true);
        try {
            const initialEvents = await api.getLocalEvents(location);
            const initialPostsCount = datePosts.filter(p => p.location.toLowerCase().includes(location.toLowerCase())).length;
            const totalResults = initialEvents.length + initialPostsCount;

            const MIN_RESULTS_THRESHOLD = 5;
            if (totalResults < MIN_RESULTS_THRESHOLD) {
                const majorCity = await getNearbyMajorCity(location);
                
                if (majorCity && majorCity.toLowerCase() !== location.toLowerCase()) {
                    const expandedEvents = await api.getLocalEvents(majorCity);
                    setLocalEvents(expandedEvents);
                    setEffectiveSearchLocation(majorCity);
                    setIsSearchExpanded(true);
                } else {
                    setLocalEvents(initialEvents);
                    setEffectiveSearchLocation(location);
                    setIsSearchExpanded(false);
                }
            } else {
                setLocalEvents(initialEvents);
                setEffectiveSearchLocation(location);
                setIsSearchExpanded(false);
            }
        } catch (error) {
            setLocalEvents([]);
            setEffectiveSearchLocation(location);
            setIsSearchExpanded(false);
        } finally {
            setIsEventsLoading(false);
        }
    };

    useEffect(() => {
        fetchAndExpandSearch(searchLocation);
    }, [searchLocation, isAuthenticated]);


    useEffect(() => {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * colorThemes.length); } 
        while (colorThemes.length > 1 && newIndex === lastColorIndex.current);
        lastColorIndex.current = newIndex;
        setActiveColorTheme(colorThemes[newIndex]);
    }, [currentView]);

    // --- PULL TO REFRESH LOGIC ---
    const handleManualRefresh = async () => {
        if (!currentUser) return;
        setIsRefreshing(true);
        try {
            // Refresh all dynamic data
            const [fetchedUsers, fetchedDatePosts, fetchedMessages, fetchedMatches, fetchedSwipedLeftIds, fetchedSwipedRightIds, fetchedEvents] = await Promise.all([
                api.getUsers(), 
                api.getDatePosts(), 
                api.getMessages(),
                api.getMatches(currentUser.id),
                api.getSwipedLeftIds(currentUser.id),
                api.getSwipedRightIds(currentUser.id),
                api.getLocalEvents(searchLocation) // Also refresh events
            ]);
            setUsers(fetchedUsers);
            setDatePosts(fetchedDatePosts);
            setMessages(fetchedMessages);
            setMatches(fetchedMatches);
            setSwipedLeftIds(fetchedSwipedLeftIds);
            setSwipedRightIds(fetchedSwipedRightIds);
            setLocalEvents(fetchedEvents);
            showToast('Everything is up to date!', 'success');
        } catch (error) {
            showToast('Refresh failed.', 'error');
        } finally {
            // Add a small delay for smoother UI
            setTimeout(() => {
                setIsRefreshing(false);
                setPullY(0);
            }, 500);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
            pullStartY.current = e.touches[0].clientY;
            pullStartX.current = e.touches[0].clientX;
        } else {
            pullStartY.current = 0;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (pullStartY.current === 0 || isRefreshing) return;
        
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        
        if (Math.abs(touchX - pullStartX.current) > Math.abs(touchY - pullStartY.current) + 10) {
             pullStartY.current = 0; // Prioritize horizontal scroll
            return;
        }

        const diff = touchY - pullStartY.current;
        
        if (diff > 0) {
            e.preventDefault(); // Prevent browser's native pull-to-refresh
            const dampening = 0.4;
            setPullY(Math.min(diff * dampening, 150));
        }
    };

    const handleTouchEnd = () => {
        if (isRefreshing || pullY === 0) return;
        
        const REFRESH_THRESHOLD = 80;
        if (pullY > REFRESH_THRESHOLD) {
            setPullY(60);
            handleManualRefresh();
        } else {
            setPullY(0);
        }
        pullStartY.current = 0;
    };


    const matchedUsers = useMemo(() => {
        return users.filter(user => matches.includes(user.id));
    }, [users, matches]);
    
    const sentMessageCount = useMemo(() => {
        if (!currentUser || currentUser.isPremium) return 0;
        return messages.filter(m => m.senderId === currentUser.id).length;
    }, [messages, currentUser]);
    
    const FREE_MESSAGE_LIMIT = 20;

    // Filter users for the SWIPE DECK
    const usersForSwiping = useMemo(() => {
        if (!currentUser) return [];
        
        // 1. Base Filter
        const filtered = users.filter(u => {
            const isNotCurrentUser = u.id !== currentUser.id;
            const isNotMatched = !matches.includes(u.id);
            const isNotSwipedLeft = !swipedLeftIds.includes(u.id);
            const isNotSwipedRight = !swipedRightIds.includes(u.id);
            
            if (!currentUser.preferences) return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight;
            
            const matchesGenderPref = currentUser.preferences.interestedIn.includes(u.gender);
            const matchesAgePref = u.age >= currentUser.preferences.ageRange.min && u.age <= currentUser.preferences.ageRange.max;
            
            return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight && matchesGenderPref && matchesAgePref;
        });

        // 2. Priority Sorting
        if (searchLocation) {
            const normalizedSearch = searchLocation.toLowerCase();
            return filtered.sort((a, b) => {
                const aLoc = a.location ? a.location.toLowerCase() : '';
                const bLoc = b.location ? b.location.toLowerCase() : '';
                const aMatch = aLoc.includes(normalizedSearch);
                const bMatch = bLoc.includes(normalizedSearch);

                if (aMatch && !bMatch) return 1; 
                if (!aMatch && bMatch) return -1;
                return 0;
            });
        }

        return filtered;
    }, [users, matches, swipedLeftIds, swipedRightIds, currentUser, searchLocation]);

    // Filter users for the LOCAL PEOPLE VIEW
    const usersForLocalView = useMemo(() => {
        if (!currentUser) return [];
        
        const filtered = users.filter(u => {
            const isNotCurrentUser = u.id !== currentUser.id;
            return isNotCurrentUser;
        });

        if (searchLocation) {
             const normalizedSearch = searchLocation.toLowerCase();
             return filtered.sort((a, b) => {
                const aLoc = a.location ? a.location.toLowerCase() : '';
                const bLoc = b.location ? b.location.toLowerCase() : '';
                const aMatch = aLoc.includes(normalizedSearch);
                const bMatch = bLoc.includes(normalizedSearch);

                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
        }

        return filtered;
    }, [users, currentUser, searchLocation]);
    
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
                    // Triggers the overlay instead of just a toast
                    if (matchedUser) {
                        setMatchOverlayUser(matchedUser);
                    }
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
                if (matchedUser) {
                    setMatchOverlayUser(matchedUser);
                }
            } else {
                 showToast(`You Super Liked ${users.find(u => u.id === userId)?.name}!`, 'info');
            }
        } catch (error) {
            showToast('Something went wrong with your super like.', 'error');
        }
    };
    
    const handleCloseMatchOverlay = () => {
        setMatchOverlayUser(null);
    };

    const handleSendMessageFromOverlay = async (text: string) => {
        if (matchOverlayUser) {
            await handleSendMessage(matchOverlayUser.id, text);
            setSelectedChatUserId(matchOverlayUser.id);
            setMatchOverlayUser(null);
            setCurrentView(View.Chat);
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

    const handleUpdateDate = async (updatedDate: DatePost) => {
        try {
            const updatedPost = await api.updateDatePost(updatedDate);
            setDatePosts(prevPosts => prevPosts.map(post => post.id === updatedDate.id ? updatedPost : post));
            showToast('Date updated successfully!', 'success');
            setEditingDate(null);
            setCurrentView(View.MyDates);
        } catch (error: any) {
            showToast(error.message || 'Failed to update date.', 'error');
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
    
    // --- Reporting Logic ---
    const handleOpenReportModal = (user: User) => {
        setUserToReport(user);
        setIsReportModalOpen(true);
    };

    const handleReportSubmit = (reason: string, block: boolean) => {
        if (currentUser && userToReport) {
            api.reportUser(currentUser.id, userToReport.id, reason);
            if (block) {
                api.blockUser(currentUser.id, userToReport.id);
                // Refresh data to remove user from view
                const refresh = async () => {
                     const [newUsers, newMatches, newMessages] = await Promise.all([
                         api.getUsers(),
                         api.getMatches(currentUser.id),
                         api.getMessages()
                     ]);
                     setUsers(newUsers);
                     setMatches(newMatches);
                     setMessages(newMessages);
                };
                refresh();
                showToast(`${userToReport.name} has been blocked.`, 'info');
            } else {
                showToast("Report submitted.", 'success');
            }
        }
        setIsReportModalOpen(false);
        setUserToReport(null);
    };
    
    // --- Date Invitation Logic ---
    const handleSendDateInvite = async (idea: DateIdea) => {
        if (!currentUser || !usersForDatePlanning) return;
        const receiver = usersForDatePlanning[1];
        
        // Create formatted invite string
        const inviteText = `DATE_INVITE::${idea.title}::${idea.location}::${idea.description}`;
        
        await handleSendMessage(receiver.id, inviteText);
        setSelectedChatUserId(receiver.id);
        setIsDatePlannerModalOpen(false);
        setCurrentView(View.Chat);
        showToast("Date invitation sent!", 'success');
    };
    
    const handleCreateDateFromEvent = (event: LocalEvent) => { setEventForDate(event); setCurrentView(View.Create); showToast('Pre-filled date from event!', 'info'); };
    const handleViewProfile = (user: User) => { setSelectedUserForModal(user); setIsProfileModalOpen(true); };
    const handleOpenIcebreakerModal = (user: User) => { setSelectedUserForModal(user); setIsProfileModalOpen(false); setIsIcebreakerModalOpen(true); };
    const handleGetProfileFeedback = () => { setIsFeedbackModalOpen(true); };
    const handlePlanDate = (user: User) => { if(!currentUser) return; setUsersForDatePlanning([currentUser, user]); setIsDatePlannerModalOpen(true); };
    const handleOpenMonetizationModal = () => { setIsMonetizationModalOpen(true); };
    const handleViewBusiness = (business: Business) => { setSelectedBusinessForModal(business); setIsBusinessModalOpen(true); };
    const handleCreateDateFromBusiness = (business: Business, deal?: Deal) => { setBusinessForDate({ business, deal }); setCurrentView(View.Create); showToast(`Creating date at ${business.name}!`, 'info'); };
    const handleUpgrade = async () => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, isPremium: true };
        await handleUpdateProfile(updatedUser);
        setIsMonetizationModalOpen(false);
        showToast('Welcome to Premium! Enjoy your new features.', 'success');
    };
    const handleSignOut = async () => {
        localStorage.removeItem('cad_current_user_id');
        setIsAuthenticated(false);
        setCurrentUser(null);
        showToast('Signed out.', 'info');
    };
    
    const handleSendIcebreaker = async (text: string) => {
        if(!selectedUserForModal || !currentUser) return;
        await handleSendMessage(selectedUserForModal.id, text);
        setSelectedChatUserId(selectedUserForModal.id);
        setIsIcebreakerModalOpen(false);
        showToast('Icebreaker sent!', 'success');
        setCurrentView(View.Chat);
    };

    if (!isAuthenticated) {
        if (PRE_LAUNCH_MODE) return <LandingPage />;
        return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
    }

    if (isLoading || !currentUser) {
         return (
            <div className="min-h-screen bg-dark-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-pink"></div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen bg-dark-1 text-light-1 font-montserrat overflow-hidden flex flex-col transition-colors duration-1000"
            style={appBackground ? { backgroundImage: `url(${appBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(18, 18, 18, 0.8)' } : {}}
        >
            <Header currentView={currentView} setCurrentView={setCurrentView} activeColorTheme={activeColorTheme} />
            
            <main className="pt-16 flex-grow overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className={`absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-r ${activeColorTheme.gradientFrom} to-transparent rounded-full blur-[100px] opacity-20`}></div>
                        <div className={`absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-r ${activeColorTheme.gradientTo} to-transparent rounded-full blur-[120px] opacity-20`}></div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="relative z-10 h-full overflow-y-auto p-3 scrollbar-hide"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ transform: `translateY(${pullY}px)`, transition: isRefreshing || pullY === 0 ? 'transform 0.3s ease' : 'none' }}
                >
                    {/* Pull to Refresh Spinner */}
                    <div className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none" style={{ height: '60px', transform: 'translateY(-100%)' }}>
                        <div className={`transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullY * 2}deg)` }}>
                            <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-brand-pink opacity-80"></div>
                        </div>
                    </div>

                    {currentView === View.Swipe && (
                        <SwipeDeck 
                            users={usersForSwiping} 
                            currentUser={currentUser} 
                            onSwipe={handleSwipe} 
                            onSuperLike={handleSuperLike}
                            onRecall={handleRecall}
                            canRecall={!!lastSwipedUserId}
                            isLoading={false}
                            onPremiumFeatureClick={handleOpenMonetizationModal}
                        />
                    )}
                    {currentView === View.LocalPeople && (
                        <LocalPeopleView 
                            users={usersForLocalView}
                            onViewProfile={handleViewProfile}
                            activeColorTheme={activeColorTheme}
                        />
                    )}
                    {currentView === View.Dates && (
                        <DateMarketplace 
                            datePosts={datePosts}
                            allUsers={users}
                            businesses={businesses}
                            deals={deals}
                            onToggleInterest={handleToggleInterest}
                            onPriorityInterest={handlePriorityInterest}
                            currentUserId={currentUser.id}
                            gender={currentUser.gender}
                            isLoading={false}
                            onViewProfile={handleViewProfile}
                            onViewBusiness={handleViewBusiness}
                            activeColorTheme={activeColorTheme}
                            localEvents={localEvents}
                            onCreateDateFromEvent={handleCreateDateFromEvent}
                            searchLocation={searchLocation}
                            effectiveSearchLocation={effectiveSearchLocation}
                            isSearchExpanded={isSearchExpanded}
                            onSearchLocationChange={setSearchLocation}
                            isEventsLoading={isEventsLoading}
                            onPremiumFeatureClick={handleOpenMonetizationModal}
                            onSeeAll={() => setCurrentView(View.AllEvents)}
                        />
                    )}
                        {currentView === View.AllEvents && (
                            <AllEventsView 
                            events={localEvents} 
                            location={searchLocation} 
                            onCreateDateFromEvent={handleCreateDateFromEvent} 
                            onBack={() => setCurrentView(View.Dates)}
                            activeColorTheme={activeColorTheme}
                            />
                    )}
                    {currentView === View.Create && (
                        <CreateDateForm 
                            onCreateDate={handleCreateDate} 
                            onUpdateDate={handleUpdateDate}
                            currentUser={currentUser}
                            activeColorTheme={activeColorTheme}
                            onPremiumFeatureClick={handleOpenMonetizationModal}
                            eventForDate={eventForDate}
                            onClearEventForDate={() => setEventForDate(null)}
                            businessForDate={businessForDate}
                            onClearBusinessForDate={() => setBusinessForDate(null)}
                            editingDate={editingDate}
                        />
                    )}
                    {currentView === View.Matches && (
                            <MatchesView 
                            matchedUsers={matchedUsers} 
                            currentUser={currentUser} 
                            onViewProfile={handleViewProfile} 
                            onPlanDate={handlePlanDate}
                            activeColorTheme={activeColorTheme}
                            onPremiumFeatureClick={handleOpenMonetizationModal}
                            />
                    )}
                    {currentView === View.Chat && (
                        <ChatView 
                            currentUser={currentUser} 
                            matchedUsers={matchedUsers} 
                            allUsers={users} 
                            messages={messages} 
                            onSendMessage={handleSendMessage} 
                            onViewProfile={handleViewProfile}
                            isChatDisabled={false} 
                            activeColorTheme={activeColorTheme}
                            onPremiumFeatureClick={handleOpenMonetizationModal}
                            onReportUser={handleOpenReportModal}
                            initialActiveUserId={selectedChatUserId}
                        />
                    )}
                    {currentView === View.MyDates && (
                        <MyDatesManager 
                            myDates={myDates} 
                            allUsers={users} 
                            onChooseApplicant={handleChooseApplicant} 
                            onDeleteDate={handleDeleteDate}
                            onEditDate={(date) => {
                                setEditingDate(date);
                                setCurrentView(View.Create);
                            }}
                            gender={currentUser.gender}
                            onViewProfile={handleViewProfile}
                            activeColorTheme={activeColorTheme}
                        />
                    )}
                    {currentView === View.BusinessSignup && (
                        <BusinessSignupForm activeColorTheme={activeColorTheme} />
                    )}
                    {currentView === View.Leaderboard && (
                        <LeaderboardView activeColorTheme={activeColorTheme} onViewProfile={handleViewProfile} />
                    )}
                    {currentView === View.Profile && (
                        <ProfileSettings 
                            currentUser={currentUser} 
                            onSave={handleUpdateProfile} 
                            onGetFeedback={handleGetProfileFeedback}
                            activeColorTheme={activeColorTheme}
                            onSignOut={handleSignOut}
                            onPremiumFeatureClick={handleOpenMonetizationModal}
                            onSetAppBackground={handleSetAppBackground}
                        />
                    )}
                </div>
            </main>

            {/* GLOBAL MODALS */}
            
            {matchOverlayUser && currentUser && (
                <MatchOverlay
                    currentUser={currentUser}
                    matchedUser={matchOverlayUser}
                    onClose={handleCloseMatchOverlay}
                    onSendMessage={handleSendMessageFromOverlay}
                    activeColorTheme={activeColorTheme}
                />
            )}

            {isReportModalOpen && userToReport && (
                <ReportModal
                    userName={userToReport.name}
                    onClose={() => setIsReportModalOpen(false)}
                    onReport={handleReportSubmit}
                />
            )}

            {isProfileModalOpen && (
                <ProfileModal 
                    user={selectedUserForModal} 
                    onClose={() => setIsProfileModalOpen(false)} 
                    onGenerateIcebreakers={handleOpenIcebreakerModal}
                    gender={currentUser.gender}
                />
            )}
            {isIcebreakerModalOpen && (
                <IcebreakerModal
                    user={selectedUserForModal}
                    onClose={() => setIsIcebreakerModalOpen(false)}
                    gender={currentUser.gender}
                    onSendIcebreaker={handleSendIcebreaker}
                />
            )}
            {isFeedbackModalOpen && (
                <ProfileFeedbackModal
                    user={currentUser}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    gender={currentUser.gender}
                />
            )}
            {isDatePlannerModalOpen && (
                    <DatePlannerModal
                    users={usersForDatePlanning}
                    onClose={() => setIsDatePlannerModalOpen(false)}
                    gender={currentUser.gender}
                    onSendInvite={handleSendDateInvite}
                    />
            )}
            {isMonetizationModalOpen && (
                <MonetizationModal
                    onClose={() => setIsMonetizationModalOpen(false)}
                    onUpgrade={handleUpgrade}
                />
            )}
            {isBusinessModalOpen && (
                <BusinessDetailModal
                    business={selectedBusinessForModal}
                    allDeals={deals}
                    onClose={() => setIsBusinessModalOpen(false)}
                    onCreateDate={handleCreateDateFromBusiness}
                />
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <MainApp />
        </ToastProvider>
    );
};

export default App;
