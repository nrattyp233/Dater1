import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, User, DatePost, Message, Badge } from './types';
import { colorThemes, ColorTheme, BADGES, WEEKLY_CHALLENGE_PROMPTS, HeartIcon, CalendarIcon, PlusIcon, ChatIcon } from './constants';
import * as api from './services/api';
import { categorizeDatePost } from './services/geminiService';
import { useToast, ToastProvider } from './contexts/ToastContext';
import { supabase } from './services/supabaseClient';

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

// --- START: Onboarding Component ---
const ONBOARDING_STEPS = [
  {
    title: "Welcome to Create-A-Date!",
    text: "Let's take a quick tour of how to find your next great connection.",
    icon: (props: any) => <HeartIcon {...props} />,
  },
  {
    title: "The Swipe Deck",
    text: "This is where the classic fun happens. Swipe right on profiles you like, and left on those you don't. It's your main way to discover new people.",
    icon: (props: any) => <HeartIcon {...props} />,
  },
  {
    title: "The Date Marketplace",
    text: "Browse unique date ideas posted by other users. If you see one you like, express your interest and see if you get chosen!",
    icon: (props: any) => <CalendarIcon {...props} />,
  },
  {
    title: "Create-A-Date",
    text: "Post your own date ideas! Use our AI tools to make your description more exciting and attract the right person to join you.",
    icon: (props: any) => <PlusIcon {...props} />,
  },
  {
    title: "Chats & Matches",
    text: "Once you match with someone, you can start a conversation here. Our AI can even help you break the ice!",
    icon: (props: any) => <ChatIcon {...props} />,
  },
  {
    title: "You're All Set!",
    text: "That's the basics. Explore, connect, and create amazing dates. Have fun!",
    icon: (props: any) => <HeartIcon {...props} />,
  },
];

const OnboardingGuide: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const currentStep = ONBOARDING_STEPS[step];
    const isLastStep = step === ONBOARDING_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onFinish();
        } else {
            setStep(s => s + 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-2 rounded-2xl w-full max-w-sm p-8 text-center border border-dark-3 shadow-lg flex flex-col items-center">
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-brand-pink to-brand-purple rounded-full flex items-center justify-center text-white">
                    {currentStep.icon({ className: "w-8 h-8" })}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
                <p className="text-gray-300 mb-6">{currentStep.text}</p>
                <button
                    onClick={handleNext}
                    className="w-full py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90"
                >
                    {isLastStep ? "Let's Go!" : "Next"}
                </button>
                 {!isLastStep && (
                    <button onClick={onFinish} className="mt-3 text-sm text-gray-500 hover:text-gray-300">
                        Skip Tour
                    </button>
                )}
            </div>
        </div>
    );
};
// --- END: Onboarding Component ---

const MainApp: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [currentAuthUser, setCurrentAuthUser] = useState<any>(null);
    const [currentView, setCurrentView] = useState<View>(View.Swipe);
    const [users, setUsers] = useState<User[]>([]);
    const [datePosts, setDatePosts] = useState<DatePost[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [matches, setMatches] = useState<string[]>([]); // Changed to string array for user IDs
    const [swipedLeftIds, setSwipedLeftIds] = useState<string[]>([]);
    const [swipedRightIds, setSwipedRightIds] = useState<string[]>([]); // Track who user swiped right on
    const [isLoading, setIsLoading] = useState(true);
    const [lastSwipedUserId, setLastSwipedUserId] = useState<string | null>(null);
    const { showToast } = useToast();
    
    // State for dynamic color theme
    const [activeColorTheme, setActiveColorTheme] = useState<ColorTheme>(colorThemes[0]);
    const lastColorIndex = useRef(0);

    // State for customizable app background
    const [appBackground, setAppBackground] = useState<string | null>(null);

    // State for modals, centralized here
    const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isIcebreakerModalOpen, setIsIcebreakerModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isDatePlannerModalOpen, setIsDatePlannerModalOpen] = useState(false);
    const [usersForDatePlanning, setUsersForDatePlanning] = useState<[User, User] | null>(null);
    const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);

    // New feature states
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [weeklyChallenge, setWeeklyChallenge] = useState<{ theme: string, prompt: string; isCompleted: boolean } | null>(null);

    // Get current authenticated user ID
    const getCurrentUserId = () => {
        if (!currentAuthUser) return null;
        // Use the Supabase user ID directly
        return currentAuthUser.id;
    };

    // Data loader (reusable for initial load and retries)
    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const savedBackground = localStorage.getItem('appBackground');
            if (savedBackground) setAppBackground(savedBackground);

            // Fetch data from API - production ready
            const [fetchedUsers, fetchedDatePosts, fetchedMessages] = await Promise.all([
                api.getUsers(), api.getDatePosts(), api.getMessages()
            ]);
            setUsers(fetchedUsers);
            setDatePosts(fetchedDatePosts);
            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Failed to load app data:', error);
            showToast('Failed to load app data. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Verify PayPal payment when user returns
    const verifyPayPalPayment = async (token: string, payerId: string) => {
        try {
                const response = await fetch('/.netlify/functions/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'captureOrder',
                        payload: { orderId: token, userId: getCurrentUserId() }
                    })
                });            const result = await response.json();
            
            if (result.success) {
                // Payment verified! Grant premium access
                const updatedUser = { ...currentUser, isPremium: true };
                handleUpdateProfile(updatedUser);
                showToast('🎉 Payment successful! You now have Premium access!', 'success');
                setIsMonetizationModalOpen(false);
            } else {
                showToast('Payment verification failed. Please contact support.', 'error');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            showToast('Payment verification failed. Please contact support.', 'error');
        }
    };

    useEffect(() => {
        // Check initial auth state
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setCurrentAuthUser(session?.user || null);
            setAuthLoading(false);
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session);
            setCurrentAuthUser(session?.user || null);
            setAuthLoading(false);
            
            if (event === 'SIGNED_IN') {
                showToast('Welcome! You are now signed in.', 'success');
            } else if (event === 'SIGNED_OUT') {
                showToast("You've been signed out.", 'info');
            }
        });

        return () => subscription.unsubscribe();
    }, [showToast]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchInitialData();
            
            // Check for PayPal return and verify payment
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const payerId = urlParams.get('PayerID');
            
            if (token && payerId) {
                verifyPayPalPayment(token, payerId);
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            
             // Onboarding check
            const hasOnboarded = localStorage.getItem('hasOnboarded');
            if (!hasOnboarded) {
                setShowOnboarding(true);
            } else {
                // Profile completion check - only after onboarding
                const hasCompletedProfileSetup = localStorage.getItem('hasCompletedProfileSetup');
                if (!hasCompletedProfileSetup) {
                    setShowProfileSetup(true);
                }
            }
            // Weekly Challenge logic
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
            const weekOfYear = Math.ceil(dayOfYear / 7);
            
            const lastCompletionWeek = localStorage.getItem('weeklyChallengeCompletionWeek');
            const currentWeekString = `${today.getFullYear()}-${weekOfYear}`;

            const { theme, prompt } = WEEKLY_CHALLENGE_PROMPTS[weekOfYear % WEEKLY_CHALLENGE_PROMPTS.length];
            setWeeklyChallenge({ theme, prompt, isCompleted: currentWeekString === lastCompletionWeek });
        }
    }, [showToast, isAuthenticated]);

    // Load user-specific data when user changes
    useEffect(() => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) {
            setMatches([]);
            setSwipedLeftIds([]);
            setSwipedRightIds([]);
            return;
        }

        // Load user-specific swipe data from localStorage
        const savedMatches = localStorage.getItem(`matches_${currentUserId}`);
        const savedSwipedLeft = localStorage.getItem(`swipedLeft_${currentUserId}`);
        const savedSwipedRight = localStorage.getItem(`swipedRight_${currentUserId}`);
        
        if (savedMatches) {
            try {
                setMatches(JSON.parse(savedMatches));
            } catch (e) {
                console.error('Failed to parse saved matches:', e);
                setMatches([]);
            }
        } else {
            setMatches([]);
        }
        
        if (savedSwipedLeft) {
            try {
                setSwipedLeftIds(JSON.parse(savedSwipedLeft));
            } catch (e) {
                console.error('Failed to parse saved swipe left data:', e);
                setSwipedLeftIds([]);
            }
        } else {
            setSwipedLeftIds([]);
        }

        if (savedSwipedRight) {
            try {
                setSwipedRightIds(JSON.parse(savedSwipedRight));
            } catch (e) {
                console.error('Failed to parse saved swipe right data:', e);
                setSwipedRightIds([]);
            }
        } else {
            setSwipedRightIds([]);
        }
    }, [currentAuthUser]);

    // Save swipe data when it changes
    useEffect(() => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return;
        
        localStorage.setItem(`matches_${currentUserId}`, JSON.stringify(matches));
    }, [matches, currentAuthUser]);

    useEffect(() => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return;
        
        localStorage.setItem(`swipedLeft_${currentUserId}`, JSON.stringify(swipedLeftIds));
    }, [swipedLeftIds, currentAuthUser]);

    useEffect(() => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return;
        
        localStorage.setItem(`swipedRight_${currentUserId}`, JSON.stringify(swipedRightIds));
    }, [swipedRightIds, currentAuthUser]);

    useEffect(() => {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * colorThemes.length); } 
        while (colorThemes.length > 1 && newIndex === lastColorIndex.current);
        lastColorIndex.current = newIndex;
        setActiveColorTheme(colorThemes[newIndex]);
    }, [currentView]);


    // Helper function to check if a user profile is complete
    const isProfileComplete = (user: User): boolean => {
        return !!(
            user.name && 
            user.name.trim() !== '' &&
            user.bio && 
            user.bio.trim() !== '' &&
            user.photos && 
            user.photos.length > 0 &&
            user.interests && 
            user.interests.length > 0 &&
            user.age && 
            user.age > 0
        );
    };

    // Pick the user profile for the current authenticated user
    const currentUser = useMemo(() => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return null;
        
        // Look for existing user profile in database
        const existingUser = users.find(u => u.id === currentUserId);
        if (existingUser) {
            return existingUser;
        }
        
        // If no profile exists, create a default one for the authenticated user
        // This will prompt them to complete their profile
        return {
            id: currentUserId,
            name: currentAuthUser?.user_metadata?.full_name || '',
            age: 25,
            bio: '',
            photos: [],
            interests: [],
            gender: 'male' as any,
            isPremium: false,
            preferences: {
                interestedIn: ['female' as any],
                ageRange: { min: 18, max: 35 }
            },
            earnedBadgeIds: []
        };
    }, [users, currentAuthUser]);

    const currentUserId = currentUser?.id ?? getCurrentUserId();

    const matchedUsers = useMemo(() => {
        return users.filter(user => matches.includes(user.id));
    }, [users, matches]);

    // Filter messages to only show conversations between current user and matched users
    const userMessages = useMemo(() => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return [];
        
        const matchedUserIds = new Set(matches);
        
        return messages.filter(message => {
            // Include messages where current user is sender and receiver is a match
            const isSentToMatch = message.senderId === currentUserId && matchedUserIds.has(message.receiverId);
            // Include messages where current user is receiver and sender is a match  
            const isReceivedFromMatch = message.receiverId === currentUserId && matchedUserIds.has(message.senderId);
            
            return isSentToMatch || isReceivedFromMatch;
        });
    }, [messages, matches, currentAuthUser]);
    
    const sentMessageCount = useMemo(() => {
        if (!currentUser || currentUser.isPremium) return 0;
        return messages.filter(m => m.senderId === getCurrentUserId()).length;
    }, [messages, currentUser, currentAuthUser]);
    
    const FREE_MESSAGE_LIMIT = 20;

    const usersForSwiping = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => {
            const isNotCurrentUser = u.id !== currentUserId;
            const isNotMatched = !matches.includes(u.id);
            const isNotSwipedLeft = !swipedLeftIds.includes(u.id);
            const isNotSwipedRight = !swipedRightIds.includes(u.id);
            if (!currentUser.preferences) return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight;
            
            const matchesGenderPref = currentUser.preferences.interestedIn.includes(u.gender);
            const matchesAgePref = u.age >= currentUser.preferences.ageRange.min && u.age <= currentUser.preferences.ageRange.max;
            
            return isNotCurrentUser && isNotMatched && isNotSwipedLeft && isNotSwipedRight && matchesGenderPref && matchesAgePref;
        });
    }, [users, matches, swipedLeftIds, swipedRightIds, currentUser, currentAuthUser]);
    
    const myDates = datePosts.filter(d => d.createdBy === currentUserId);
    
    const earnBadge = (badgeId: Badge['id']) => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return;
        
        const user = users.find(u => u.id === currentUserId);
        if (!user || user.earnedBadgeIds?.includes(badgeId)) {
            return;
        }

        showToast(`Badge Unlocked: ${BADGES[badgeId].name}!`, 'success');
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === currentUserId ? { ...u, earnedBadgeIds: [...(u.earnedBadgeIds || []), badgeId] } : u
        ));
    };

    // Helper function to check if two users have swiped right on each other
    const checkForMutualMatch = (userId: string, currentUserId: string): boolean => {
        // Check if the other user has swiped right on the current user
        const otherUserSwipedRight = localStorage.getItem(`swipedRight_${userId}`);
        if (!otherUserSwipedRight) return false;
        
        try {
            const otherUserRightSwipes: string[] = JSON.parse(otherUserSwipedRight);
            return otherUserRightSwipes.includes(currentUserId);
        } catch (e) {
            console.error('Failed to parse other user swipe data:', e);
            return false;
        }
    };

    const handleSwipe = (userId: string, direction: 'left' | 'right') => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return;
        
        setLastSwipedUserId(userId);
        
        if (direction === 'right') {
            // Add to user's right swipes
            setSwipedRightIds(prev => [...prev, userId]);
            
            // Check if this creates a mutual match
            if (checkForMutualMatch(userId, currentUserId)) {
                // Both users swiped right - create a match!
                setMatches(prev => [...prev, userId]);
                
                // Also add the current user to the other user's matches
                // This ensures both users see each other as matches
                const otherUserMatches = localStorage.getItem(`matches_${userId}`);
                let updatedOtherUserMatches: string[];
                
                if (otherUserMatches) {
                    try {
                        updatedOtherUserMatches = JSON.parse(otherUserMatches);
                        if (!updatedOtherUserMatches.includes(currentUserId)) {
                            updatedOtherUserMatches.push(currentUserId);
                        }
                    } catch (e) {
                        console.error('Failed to parse other user matches:', e);
                        updatedOtherUserMatches = [currentUserId];
                    }
                } else {
                    updatedOtherUserMatches = [currentUserId];
                }
                
                localStorage.setItem(`matches_${userId}`, JSON.stringify(updatedOtherUserMatches));
                
                const matchedUser = users.find(u => u.id === userId);
                showToast(`🎉 You matched with ${matchedUser?.name}!`, 'success');
            } else {
                // Just a right swipe, no match yet
                const swipedUser = users.find(u => u.id === userId);
                showToast(`Swiped right on ${swipedUser?.name}`, 'info');
            }
        } else {
            setSwipedLeftIds(prev => [...prev, userId]);
        }
    };
    
    const handleRecall = () => {
        if (!lastSwipedUserId) return;
        setMatches(prev => prev.filter(id => id !== lastSwipedUserId));
        setSwipedLeftIds(prev => prev.filter(id => id !== lastSwipedUserId));
        setSwipedRightIds(prev => prev.filter(id => id !== lastSwipedUserId));
        const recalledUser = users.find(u => u.id === lastSwipedUserId);
        showToast(`Recalled ${recalledUser?.name || 'profile'}.`, 'info');
        setLastSwipedUserId(null);
    };

    const handleToggleInterest = async (dateId: number) => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) {
            showToast('Please sign in to express interest.', 'error');
            return;
        }
        
        try {
            const updated = await api.toggleInterest(dateId, currentUserId);
            setDatePosts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
            const isInterested = updated.applicants.includes(currentUserId);
            showToast(isInterested ? "You've expressed interest in this date!" : "You are no longer interested in this date.", isInterested ? 'success' : 'info');
        } catch (error: any) {
            showToast(error.message || 'Failed to update interest.', 'error');
        }
    };

    const handleCreateDate = async (newDateData: Omit<DatePost, 'id' | 'createdBy' | 'applicants' | 'chosenApplicantId' | 'categories'>) => {
        const currentUserId = getCurrentUserId();
        if (!currentUser || !currentUserId) {
            showToast('Please sign in to create a date.', 'error');
            return;
        }

        showToast('AI is categorizing your date...', 'info');
        try {
            const categories = await categorizeDatePost(newDateData.title, newDateData.description);
            const newDate = await api.createDate({ ...newDateData, categories }, currentUserId);

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
            await api.deleteDate(dateId);
            setDatePosts(prevPosts => prevPosts.filter(post => post.id !== dateId));
            showToast('Date post has been deleted.', 'info');
        } catch (error: any) {
            showToast(error.message || 'Failed to delete date.', 'error');
        }
    };

    const handleChooseApplicant = async (dateId: number, applicantId: string) => {
        try {
            const updated = await api.chooseApplicant(dateId, applicantId);
            setDatePosts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
            const applicant = users.find(u => u.id === applicantId);
            showToast(`You've chosen ${applicant?.name} for your date!`, 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to choose applicant.', 'error');
        }
    };

    const handleUpdateProfile = async (updatedUser: User) => {
        try {
            const wasProfileIncomplete = currentUser && !isProfileComplete(currentUser);
            const isNowComplete = isProfileComplete(updatedUser);
            
            await api.updateUser(updatedUser);
            setUsers(prevUsers => prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
            
            // Check if this completes the initial profile setup
            if (showProfileSetup && wasProfileIncomplete && isNowComplete) {
                handleProfileSetupComplete();
            } else {
                showToast('Profile saved successfully!', 'success');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to save profile.', 'error');
        }
    };

    const handleSendMessage = async (receiverId: string, text: string) => {
        const currentUserId = getCurrentUserId();
        if (!currentUser || !currentUserId) {
            showToast('Please sign in to send messages.', 'error');
            return;
        }
        
        // Check if the receiver is in the user's matches
        if (!matches.includes(receiverId)) {
            showToast('You can only message users you have matched with.', 'error');
            return;
        }
        
        if (!currentUser.isPremium && sentMessageCount >= FREE_MESSAGE_LIMIT) {
            handleOpenMonetizationModal();
            showToast(`You've used your ${FREE_MESSAGE_LIMIT} free messages. Upgrade to Premium for unlimited chat!`, 'info');
            return;
        }

        if (messages.filter(m => m.senderId === currentUser.id).length === 4) earnBadge('starter');
        
        try {
            const newMessage = await api.sendMessage(currentUserId, receiverId, text);
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
    
    const handleCompleteChallenge = () => {
        setCurrentView(View.Create);
        showToast('Let\'s create that date!', 'info');
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const weekOfYear = Math.ceil(dayOfYear / 7);
        localStorage.setItem('weeklyChallengeCompletionWeek', `${today.getFullYear()}-${weekOfYear}`);
        if (weeklyChallenge) setWeeklyChallenge({ ...weeklyChallenge, isCompleted: true });
    };

    // Modal Handlers
    const handleViewProfile = (user: User) => { setSelectedUserForModal(user); setIsProfileModalOpen(true); };
    const handleCloseProfile = () => { setIsProfileModalOpen(false); setTimeout(() => setSelectedUserForModal(null), 300); };
    const handleGenerateIcebreakersFromProfile = (user: User) => { setIsProfileModalOpen(false); setSelectedUserForModal(user); setIsIcebreakerModalOpen(true); };
    const handleCloseIcebreakers = () => { setIsIcebreakerModalOpen(false); setTimeout(() => setSelectedUserForModal(null), 300); };
    const handleGetProfileFeedback = () => setIsFeedbackModalOpen(true);
    const handleCloseProfileFeedback = () => setIsFeedbackModalOpen(false);
    const handlePlanDate = (matchedUser: User) => { if (currentUser) { setUsersForDatePlanning([currentUser, matchedUser]); setIsDatePlannerModalOpen(true); } };
    const handleCloseDatePlanner = () => { setIsDatePlannerModalOpen(false); setTimeout(() => setUsersForDatePlanning(null), 300); };
    const handleOpenMonetizationModal = () => setIsMonetizationModalOpen(true);
    const handleCloseMonetizationModal = () => setIsMonetizationModalOpen(false);
    const handleUpgradeToPremium = async () => { 
        const currentUserId = getCurrentUserId();
        if (!currentUser || !currentUserId) {
            showToast('Please sign in to upgrade to Premium.', 'error');
            return;
        }
        
        // Verify payment was actually completed before granting premium
        try {
            const { verifyPremiumStatus } = await import('./services/api');
            const isPremiumVerified = await verifyPremiumStatus(currentUserId);
            
            if (isPremiumVerified) {
                handleUpdateProfile({ ...currentUser, isPremium: true }); 
                handleCloseMonetizationModal(); 
                showToast('Congratulations! You are now a Create-A-Date Premium member.', 'success');
            } else {
                showToast('Payment verification failed. Please contact support.', 'error');
            }
        } catch (error) {
            showToast('Failed to verify premium status. Please try again.', 'error');
        }
    };
    const handleOnboardingComplete = () => { localStorage.setItem('hasOnboarded', 'true'); setShowOnboarding(false); };
    
    const handleProfileSetupComplete = () => { 
        localStorage.setItem('hasCompletedProfileSetup', 'true'); 
        setShowProfileSetup(false);
        showToast('Profile setup complete! You can now start swiping.', 'success');
    };

    const handleSignOut = async () => { 
        await supabase.auth.signOut(); 
        setCurrentView(View.Swipe); 
    };

    const renderView = () => {
        if (!currentUser && isLoading) return <div className="text-center">Loading Create-A-Date...</div>;
        if (!currentUser && !isLoading) {
            return (
                <div className="text-center text-gray-300">
                    <h2 className="text-2xl font-bold mb-4">Welcome to Create-A-Date!</h2>
                    <p className="mb-4">Ready to start meeting amazing people? Create your profile and start swiping!</p>
                    <button
                        onClick={() => setCurrentView(View.Profile)}
                        className="px-6 py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90"
                    >
                        Create Your Profile
                    </button>
                </div>
            );
        }

        switch (currentView) {
            case View.Swipe:
                if (users.length === 0) {
                    return (
                        <div className="text-center text-gray-300">
                            <h2 className="text-2xl font-bold mb-4">No Profiles Yet!</h2>
                            <p className="mb-4">Be the first to create a profile and start building the community!</p>
                            <button
                                onClick={() => setCurrentView(View.Profile)}
                                className="px-6 py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90"
                            >
                                Create Your Profile
                            </button>
                        </div>
                    );
                }
                return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} weeklyChallenge={weeklyChallenge} onCompleteChallenge={handleCompleteChallenge} />;
            case View.Dates:
                if (datePosts.length === 0) {
                    return (
                        <div className="text-center text-gray-300">
                            <h2 className="text-2xl font-bold mb-4">No Date Ideas Yet!</h2>
                            <p className="mb-4">Be the first to post an amazing date idea!</p>
                            <button
                                onClick={() => setCurrentView(View.Create)}
                                className="px-6 py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90"
                            >
                                Create First Date
                            </button>
                        </div>
                    );
                }
                return <DateMarketplace datePosts={datePosts} allUsers={users} onToggleInterest={handleToggleInterest} currentUserId={currentUserId} gender={currentUser?.gender} isLoading={isLoading} onViewProfile={handleViewProfile} activeColorTheme={activeColorTheme} />;
            case View.Create:
                return <CreateDateForm onCreateDate={handleCreateDate} currentUser={currentUser!} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.Matches:
                if (matchedUsers.length === 0) {
                    return (
                        <div className="text-center text-gray-300">
                            <h2 className="text-2xl font-bold mb-4">No Matches Yet!</h2>
                            <p className="mb-4">Start swiping to find your perfect match!</p>
                            <button
                                onClick={() => setCurrentView(View.Swipe)}
                                className="px-6 py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90"
                            >
                                Start Swiping
                            </button>
                        </div>
                    );
                }
                return <MatchesView matchedUsers={matchedUsers} currentUser={currentUser!} onViewProfile={handleViewProfile} onPlanDate={handlePlanDate} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
             case View.Chat:
                return <ChatView currentUser={currentUser!} matchedUsers={matchedUsers} allUsers={users} messages={userMessages} onSendMessage={handleSendMessage} onViewProfile={handleViewProfile} isChatDisabled={!currentUser?.isPremium && sentMessageCount >= FREE_MESSAGE_LIMIT} activeColorTheme={activeColorTheme} onPremiumFeatureClick={handleOpenMonetizationModal} />;
            case View.MyDates:
                if (myDates.length === 0) {
                    return (
                        <div className="text-center text-gray-300">
                            <h2 className="text-2xl font-bold mb-4">No Dates Posted Yet!</h2>
                            <p className="mb-4">Create your first date idea and start attracting matches!</p>
                            <button
                                onClick={() => setCurrentView(View.Create)}
                                className="px-6 py-3 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-brand-pink to-brand-purple text-white hover:opacity-90"
                            >
                                Create Date Idea
                            </button>
                        </div>
                    );
                }
                return <MyDatesManager myDates={myDates} allUsers={users} onChooseApplicant={handleChooseApplicant} onDeleteDate={handleDeleteDate} gender={currentUser?.gender} onViewProfile={handleViewProfile} activeColorTheme={activeColorTheme} />;
            case View.Profile:
                return <ProfileSettings currentUser={currentUser!} onSave={handleUpdateProfile} onGetFeedback={handleGetProfileFeedback} activeColorTheme={activeColorTheme} onSignOut={handleSignOut} onPremiumFeatureClick={handleOpenMonetizationModal} onSetAppBackground={handleSetAppBackground} />;
            default:
                return <SwipeDeck users={usersForSwiping} currentUser={currentUser} onSwipe={handleSwipe} onRecall={handleRecall} canRecall={!!lastSwipedUserId} isLoading={isLoading} onPremiumFeatureClick={handleOpenMonetizationModal} weeklyChallenge={weeklyChallenge} onCompleteChallenge={handleCompleteChallenge}/>;
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-dark-1 flex flex-col items-center justify-center p-4 font-sans">
                <div className="text-center">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 text-transparent bg-clip-text mb-2">
                        Create-A-Date
                    </h1>
                    <p className="text-xl italic text-brand-light/90 tracking-wide mb-4">Beyond the swipe.</p>
                    <div className="text-gray-400">Loading...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div 
             className="min-h-screen font-sans bg-cover bg-center bg-fixed" 
             style={{ backgroundImage: appBackground ? `linear-gradient(rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 0.7)), url(${appBackground})` : 'none', backgroundColor: '#121212' }}
        >
            {showOnboarding && <OnboardingGuide onFinish={handleOnboardingComplete} />}
            {showProfileSetup && currentUser && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-dark-1 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-dark-3 shadow-lg">
                        <div className="p-6 border-b border-dark-3 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
                                <p className="text-gray-400 mt-2">Let's set up your profile so you can start meeting amazing people!</p>
                            </div>
                            <button 
                                onClick={() => setShowProfileSetup(false)}
                                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-dark-3 transition-colors"
                                aria-label="Skip profile setup"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <ProfileSettings 
                                currentUser={currentUser} 
                                onSave={handleUpdateProfile} 
                                onGetFeedback={() => {}}
                                activeColorTheme={activeColorTheme}
                                onSignOut={() => {}}
                                onPremiumFeatureClick={handleOpenMonetizationModal}
                                onSetAppBackground={handleSetAppBackground}
                            />
                        </div>
                    </div>
                </div>
            )}
            <Header currentView={currentView} setCurrentView={setCurrentView} activeColorTheme={activeColorTheme} />
            <main className="pt-28 pb-10 px-4 container mx-auto">
                {renderView()}
            </main>
            {isProfileModalOpen && <ProfileModal user={selectedUserForModal} onClose={handleCloseProfile} onGenerateIcebreakers={handleGenerateIcebreakersFromProfile} gender={currentUser?.gender} />}
            {isIcebreakerModalOpen && <IcebreakerModal user={selectedUserForModal} onClose={handleCloseIcebreakers} gender={currentUser?.gender} onSendIcebreaker={(message) => { if(selectedUserForModal) { handleSendMessage(selectedUserForModal.id, message); handleCloseIcebreakers(); setCurrentView(View.Chat); } }} />}
            {isFeedbackModalOpen && <ProfileFeedbackModal user={currentUser!} onClose={handleCloseProfileFeedback} gender={currentUser?.gender}/>}
            {isDatePlannerModalOpen && <DatePlannerModal users={usersForDatePlanning} onClose={handleCloseDatePlanner} gender={currentUser?.gender}/>}
            {isMonetizationModalOpen && <MonetizationModal onClose={handleCloseMonetizationModal} onUpgrade={handleUpgradeToPremium} currentUserId={getCurrentUserId() || ''} />}
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <MainApp />
    </ToastProvider>
);

export default App;
