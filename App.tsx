import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { View, User, DatePost, Message, LocalEvent, Business, Deal } from './types';
import { colorThemes, ColorTheme, BADGES } from './constants';
import * as api from './services/api';
// Import the geminiService functions that were moved to the edge function
import { callGeminiFunction } from './services/geminiService';
import { useToast, ToastProvider } from './contexts/ToastContext';
import { onAuthStateChange, getCurrentUser, getSession, signOut } from './services/supabaseClient';

// Lazy load components for better performance
const Header = React.lazy(() => import('./components/Header'));
const SwipeDeck = React.lazy(() => import('./components/SwipeDeck'));
const DateMarketplace = React.lazy(() => import('./components/DateMarketplace'));
const CreateDateForm = React.lazy(() => import('./components/CreateDateForm'));
const MyDatesManager = React.lazy(() => import('./components/MyDatesManager'));
const ProfileSettings = React.lazy(() => import('./components/ProfileSettings'));
const MatchesView = React.lazy(() => import('./components/MatchesView'));
const ChatView = React.lazy(() => import('./components/ChatView'));
const ProfileModal = React.lazy(() => import('./components/ProfileModal'));
const IcebreakerModal = React.lazy(() => import('./components/IcebreakerModal'));
const ProfileFeedbackModal = React.lazy(() => import('./components/ProfileFeedbackModal'));
const DatePlannerModal = React.lazy(() => import('./components/DatePlannerModal'));
const MonetizationModal = React.lazy(() => import('./components/MonetizationModal'));
const Auth = React.lazy(() => import('./components/Auth'));
const BusinessSignupForm = React.lazy(() => import('./components/BusinessSignupForm'));
const BusinessDetailModal = React.lazy(() => import('./components/BusinessDetailModal'));
const LeaderboardView = React.lazy(() => import('./components/LeaderboardView'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Define the shape of our app state
type AppState = {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  datePosts: DatePost[];
  messages: Message[];
  matches: User[];
  swipedLeftIds: number[];
  swipedRightIds: number[];
  localEvents: LocalEvent[];
  businesses: Business[];
  deals: Deal[];
  searchLocation: string;
  effectiveSearchLocation: string;
  isSearchExpanded: boolean;
  activeColorTheme: ColorTheme;
  appBackground: string | null;
  selectedUserForModal: User | null;
  selectedBusinessForModal: Business | null;
  usersForDatePlanning: [User, User] | null;
  eventForDate: LocalEvent | null;
  businessForDate: { business: Business; deal?: Deal } | null;
  isProfileModalOpen: boolean;
  isIcebreakerModalOpen: boolean;
  isFeedbackModalOpen: boolean;
  isDatePlannerModalOpen: boolean;
  isMonetizationModalOpen: boolean;
  isBusinessModalOpen: boolean;
  currentView: View;
};

type LoadingState = {
  isLoading: boolean;
  isEventsLoading: boolean;
  isBusinessLoading: boolean;
  error: string | null;
};

const initialState: AppState = {
  isAuthenticated: false,
  currentUser: null,
  users: [],
  datePosts: [],
  messages: [],
  matches: [],
  swipedLeftIds: [],
  swipedRightIds: [],
  localEvents: [],
  businesses: [],
  deals: [],
  searchLocation: '',
  effectiveSearchLocation: '',
  isSearchExpanded: false,
  activeColorTheme: colorThemes[0],
  appBackground: localStorage.getItem('appBackground'),
  selectedUserForModal: null,
  selectedBusinessForModal: null,
  usersForDatePlanning: null,
  eventForDate: null,
  businessForDate: null,
  isProfileModalOpen: false,
  isIcebreakerModalOpen: false,
  isFeedbackModalOpen: false,
  isDatePlannerModalOpen: false,
  isMonetizationModalOpen: false,
  isBusinessModalOpen: false,
  currentView: View.Swipe,
};

const initialLoadingState: LoadingState = {
  isLoading: true,
  isEventsLoading: false,
  isBusinessLoading: false,
  error: null,
};

const MainApp: React.FC = () => {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState<LoadingState>({
    ...initialLoadingState,
    isLoading: true, // Start with loading true to wait for auth state
  });
  const lastColorIndex = useRef(0);
  const { showToast } = useToast();
  const authListener = useRef<{ unsubscribe: () => void } | null>(null);
  
  // Memoize derived state
  const { 
    isAuthenticated, currentUser, users, datePosts, messages, matches, 
    swipedLeftIds, localEvents, businesses, deals, searchLocation, 
    effectiveSearchLocation, isSearchExpanded, activeColorTheme, appBackground,
    selectedUserForModal, selectedBusinessForModal, usersForDatePlanning,
    eventForDate, businessForDate, isProfileModalOpen, isIcebreakerModalOpen,
    isFeedbackModalOpen, isDatePlannerModalOpen, isMonetizationModalOpen,
    isBusinessModalOpen, currentView 
  } = state;
  
  const { isLoading, isEventsLoading, isBusinessLoading, error } = loading;

  // Helper function to update state with type safety
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Helper function to update loading state
  const updateLoading = useCallback((updates: Partial<LoadingState>) => {
    setLoading(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Handle errors consistently
  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(error);
    const message = error instanceof Error ? error.message : defaultMessage;
    showToast(message, 'error');
    updateLoading({ error: message });
    return message;
  }, [showToast, updateLoading]);

  // Handle user login
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      updateLoading({ isLoading: true, error: null });
      // Call your authentication API here
      // const user = await api.login(email, password);
      // updateState({ isAuthenticated: true, currentUser: user });
    } catch (error) {
      handleError(error, 'Failed to log in. Please check your credentials.');
    } finally {
      updateLoading({ isLoading: false });
    }
  }, [handleError, updateLoading, updateState]);

  // Handle user signup
  const handleSignup = useCallback(async (userData: any) => {
    try {
      updateLoading({ isLoading: true, error: null });
      // Call your signup API here
      // const user = await api.signup(userData);
      // updateState({ isAuthenticated: true, currentUser: user });
    } catch (error) {
      handleError(error, 'Failed to create account. Please try again.');
    } finally {
      updateLoading({ isLoading: false });
    }
  }, [handleError, updateLoading, updateState]);

  // Handle user logout
  const handleLogout = useCallback(async () => {
    try {
      updateLoading({ isLoading: true });
      // Call your logout API here
      // await api.logout();
      updateState({
        ...initialState,
        appBackground: state.appBackground, // Keep the background setting
      });
    } catch (error) {
      handleError(error, 'Failed to log out. Please try again.');
    } finally {
      updateLoading({ isLoading: false });
    }
  }, [handleError, updateLoading, updateState, state.appBackground]);

  // Fetch initial app data
  const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return;
    
    try {
      updateLoading({ isLoading: true, error: null });
      
      // Fetch all data in parallel
      const [
        fetchedUsers, 
        fetchedDatePosts, 
        fetchedMatches,
        fetchedSwipedLeftIds,
        fetchedBusinesses,
        fetchedDeals
      ] = await Promise.all([
        api.getUsers(),
        api.getDatePosts(currentUser.id),
        api.getMatches(currentUser.id),
        api.getSwipedLeftIds(currentUser.id),
        api.getBusinesses(),
        api.getDealsForBusiness(0), // Get all deals
      ]);
      
      // Update state with fetched data
      updateState({
        users: fetchedUsers,
        datePosts: fetchedDatePosts,
        matches: fetchedMatches,
        swipedLeftIds: fetchedSwipedLeftIds,
        businesses: fetchedBusinesses,
        deals: fetchedDeals,
      });
      
    } catch (error) {
      handleError(error, 'Failed to load app data. Please refresh.');
    } finally {
      updateLoading({ 
        isLoading: false,
        isBusinessLoading: false 
      });
    }
  }, [isAuthenticated, currentUser, handleError, updateLoading, updateState]);
  
  // Handle user location detection
  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser. Please search for a city.", 'info');
      return;
    }
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      // Call the edge function to get city from coordinates
      const city = await callGeminiFunction('getCityFromCoords', {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
      
      showToast(`Location found! Showing local dates for ${city}.`, 'info');
      updateState({ 
        searchLocation: city, 
        effectiveSearchLocation: city 
      });
      
    } catch (error) {
      console.warn("Location error:", error);
      showToast("Could not get your location. Please search for a city.", 'info');
    }
  }, [showToast, updateState]);
  
  // Fetch and expand search for local events
  const fetchAndExpandSearch = useCallback(async () => {
    if (!isAuthenticated || !searchLocation) {
      updateState({ 
        localEvents: [],
        effectiveSearchLocation: '',
        isSearchExpanded: false 
      });
      return;
    }
    
    updateLoading({ isEventsLoading: true });
    
    try {
      // 1. Initial Search
      const initialEvents = await api.getLocalEvents(searchLocation);
      const initialPostsCount = datePosts.filter(p => 
        p.location.toLowerCase().includes(searchLocation.toLowerCase())
      ).length;
      
      const totalResults = initialEvents.length + initialPostsCount;
      const MIN_RESULTS_THRESHOLD = 5;
      
      // 2. Check if we need to expand search
      if (totalResults < MIN_RESULTS_THRESHOLD) {
        showToast('Not many results. Expanding search to nearby areas...', 'info');
        
        try {
          // 3. Find Nearby Major City
          const majorCity = await getNearbyMajorCity(searchLocation);
          
          if (majorCity && majorCity.toLowerCase() !== searchLocation.toLowerCase()) {
            // 4. Expanded Search
            const expandedEvents = await api.getLocalEvents(majorCity);
            updateState({
              localEvents: expandedEvents,
              effectiveSearchLocation: majorCity,
              isSearchExpanded: true
            });
          } else {
            // Use initial results
            updateState({
              localEvents: initialEvents,
              effectiveSearchLocation: searchLocation,
              isSearchExpanded: false
            });
          }
        } catch (expandError) {
          // Fall back to initial results if expansion fails
          console.warn('Expanded search failed:', expandError);
          updateState({
            localEvents: initialEvents,
            effectiveSearchLocation: searchLocation,
            isSearchExpanded: false
          });
        }
      } else {
        // 5. Sufficient Results, No Expansion Needed
        updateState({
          localEvents: initialEvents,
          effectiveSearchLocation: searchLocation,
          isSearchExpanded: false
        });
      }
    } else {
      // 5. Sufficient Results, No Expansion Needed
      updateState({
        localEvents: initialEvents,
        effectiveSearchLocation: searchLocation,
        isSearchExpanded: false
      });
    }
  } catch (error) {
    handleError(error, 'Failed to load local data. Please try another location.');
    updateState({
      localEvents: [],
      effectiveSearchLocation: searchLocation,
      isSearchExpanded: false
    });
  } finally {
    updateLoading({ isEventsLoading: false });
    
    // Clean up the listener when the component unmounts
    return () => {
      if (authListener.current) {
        authListener.current.unsubscribe();
      }
    };
  }, [updateState, updateLoading]);
  
  // Handle initial data fetching after authentication
  const fetchInitialDataAfterAuth = useCallback(async () => {
    if (!state.currentUser) return;
    
    try {
      updateLoading({ isLoading: true });
      
      // Fetch all data in parallel
      const [
        fetchedUsers, 
        fetchedDatePosts, 
        fetchedMatches,
        fetchedSwipedLeftIds,
        fetchedBusinesses,
        fetchedDeals,
        fetchedMessages
      ] = await Promise.all([
        api.getUsers(),
        api.getDatePosts(state.currentUser.id),
        api.getMatches(state.currentUser.id),
        api.getSwipedLeftIds(state.currentUser.id),
        api.getBusinesses(),
        api.getDealsForBusiness(0), // Get all deals
        api.getMessages()
      ]);
      
      // Update state with fetched data
      updateState({
        users: fetchedUsers,
        datePosts: fetchedDatePosts,
        messages: fetchedMessages,
        matches: fetchedMatches,
        swipedLeftIds: fetchedSwipedLeftIds,
        businesses: fetchedBusinesses,
        deals: fetchedDeals,
      });
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showToast('Failed to load app data. Please refresh.', 'error');
    } finally {
      updateLoading({ isLoading: false });
    }
  }, [state.currentUser, updateState, updateLoading, showToast]);
  
  // Get user location when authenticated
  const getUserLocationAfterAuth = useCallback(async () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser. Please search for a city.", 'info');
      return;
    }
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const city = await getCityFromCoords(
        position.coords.latitude,
        position.coords.longitude
      );
      
      showToast(`Location found! Showing local dates for ${city}.`, 'info');
      updateState({ 
        searchLocation: city, 
        effectiveSearchLocation: city 
      });
      
    } catch (error) {
      console.warn("Location error:", error);
      showToast("Could not get your location. Please search for a city.", 'info');
    }
  }, [showToast, updateState]);
  
  // Handle successful authentication
  const handleAuthSuccess = useCallback((user: any) => {
    // This is now handled by the auth state listener
    console.log('Auth success:', user);
  }, []);
  
  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      updateLoading({ isLoading: true });
      await signOut();
      // The auth state listener will handle the state update
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('Failed to sign out. Please try again.', 'error');
    } finally {
      updateLoading({ isLoading: false });
    }
  }, [updateLoading, showToast]);
  
  // Trigger search when searchLocation changes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const timer = setTimeout(() => {
      fetchAndExpandSearch();
    }, 500); // Debounce search
    
    return () => clearTimeout(timer);
  }, [searchLocation, isAuthenticated, fetchAndExpandSearch]);

  // Render loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Render error state if needed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error Loading Application</p>
          <p>{error}</p>
          <button 
            onClick={fetchInitialData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Render the main app
  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={appBackground ? { 
        backgroundImage: `url(${appBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      <React.Suspense fallback={<LoadingSpinner />}>
        {loading.isLoading ? (
          <LoadingSpinner />
        ) : isAuthenticated ? (
          <>
            <Header 
              currentView={currentView}
              onViewChange={(view) => updateState({ currentView: view })}
              onSearchLocationChange={(location) => updateState({ searchLocation: location })}
              searchLocation={searchLocation}
              isSearchExpanded={isSearchExpanded}
              onProfileClick={() => updateState({ currentView: View.Profile })}
              onLogout={handleLogout}
              user={currentUser!}
            />
            
            <main className="flex-1 overflow-y-auto p-4">
              {currentView === View.Swipe && currentUser && (
                <SwipeDeck 
                  users={users.filter(user => user.id !== currentUser.id)} 
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onSuperLike={handleSuperLike}
                  onUndo={handleUndo}
                  currentUser={currentUser}
                  onProfileClick={handleProfileClick}
                />
              )}
              
              {currentView === View.Marketplace && (
                <DateMarketplace 
                  datePosts={datePosts}
                  onDateSelect={handleDateSelect}
                  onBusinessSelect={handleBusinessSelect}
                  onEventSelect={handleEventSelect}
                  isEventsLoading={isEventsLoading}
                  localEvents={localEvents}
                  businesses={businesses}
                  deals={deals}
                  isBusinessLoading={isBusinessLoading}
                />
              )}
              
              {currentView === View.CreateDate && currentUser && (
                <CreateDateForm 
                  onCreateDate={handleCreateDate}
                  onCancel={() => updateState({ currentView: View.Marketplace })}
                  currentUserId={currentUser.id}
                />
              )}
              
              {currentView === View.MyDates && currentUser && (
                <MyDatesManager 
                  datePosts={datePosts.filter(post => post.createdBy === currentUser.id)}
                  onEditDate={handleEditDate}
                  onDeleteDate={handleDeleteDate}
                  onSelectApplicant={handleSelectApplicant}
                  onMessageUser={handleMessageUser}
                />
              )}
              
              {currentView === View.Matches && currentUser && (
                <MatchesView 
                  matches={matches}
                  users={users}
                  currentUserId={currentUser.id}
                  onMessageUser={handleMessageUser}
                  onUnmatch={handleUnmatch}
                />
              )}
              
              {currentView === View.Chat && currentUser && (
                <ChatView 
                  messages={messages}
                  matches={matches}
                  users={users}
                  currentUserId={currentUser.id}
                  onSendMessage={handleSendMessage}
                  onStartVideoCall={handleStartVideoCall}
                />
              )}
              
              {currentView === View.Leaderboard && currentUser && (
                <LeaderboardView 
                  leaderboard={[]} // TODO: Implement leaderboard
                  currentUser={currentUser}
                />
              )}
              
              {currentView === View.Profile && currentUser && (
                <ProfileSettings 
                  user={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  onUpgradeToPremium={handleUpgradeToPremium}
                  onLogout={handleLogout}
                  onDeleteAccount={handleDeleteAccount}
                  onViewBusinessPortal={handleViewBusinessPortal}
                  onChangeTheme={handleChangeTheme}
                  onUploadBackground={handleUploadBackground}
                />
              )}
            </main>
            
            {/* Modals */}
            <ProfileModal 
              isOpen={isProfileModalOpen}
              onClose={() => updateState({ isProfileModalOpen: false })}
              user={selectedUserForModal!}
              onMessage={handleMessageUser}
              onReport={handleReportUser}
              onBlock={handleBlockUser}
              currentUserId={currentUser?.id}
            />
            
            <IcebreakerModal 
              isOpen={isIcebreakerModalOpen}
              onClose={() => updateState({ isIcebreakerModalOpen: false })}
              onSendIcebreaker={handleSendIcebreaker}
              user={selectedUserForModal!}
              currentUserId={currentUser?.id}
            />
            
            <ProfileFeedbackModal 
              isOpen={isFeedbackModalOpen}
              onClose={() => updateState({ isFeedbackModalOpen: false })}
              onSubmitFeedback={handleSubmitFeedback}
              user={selectedUserForModal!}
            />
            
            {usersForDatePlanning && currentUser && (
              <DatePlannerModal 
                isOpen={isDatePlannerModalOpen}
                onClose={() => updateState({ isDatePlannerModalOpen: false })}
                users={usersForDatePlanning}
                onPlanDate={handlePlanDate}
                currentUser={currentUser}
              />
            )}
            
            <MonetizationModal 
              isOpen={isMonetizationModalOpen}
              onClose={() => updateState({ isMonetizationModalOpen: false })}
              onSubscribe={handleSubscribe}
              onPurchaseCoins={handlePurchaseCoins}
            />
            
            {selectedBusinessForModal && (
              <BusinessDetailModal 
                isOpen={isBusinessModalOpen}
                onClose={() => updateState({ isBusinessModalOpen: false })}
                business={selectedBusinessForModal}
                deals={deals.filter(deal => deal.businessId === selectedBusinessForModal.id)}
                onSelectDeal={handleSelectDeal}
                onContactBusiness={handleContactBusiness}
              />
            )}
          </>
        ) : (
          <Auth 
            onAuthSuccess={handleAuthSuccess}
            onBusinessSignup={() => updateState({ currentView: View.BusinessSignup })}
          />
        )}
        
        {currentView === View.BusinessSignup && (
          <BusinessSignupForm 
            onSubmit={handleBusinessSignup}
            onBack={() => updateState({ currentView: View.Auth })}
          />
        )}
      </React.Suspense>
    </div>
  );
};

const App = () => (
  <React.Suspense fallback={<LoadingSpinner />}>
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  </React.Suspense>
);

export default App;
