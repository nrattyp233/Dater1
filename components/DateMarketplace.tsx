
// FIX: Imported useEffect to resolve 'Cannot find name 'useEffect'' error.
import React, { useState, useMemo, useEffect } from 'react';
import { DatePost, User, Gender, DateCategory, LocalEvent, Business, Deal } from '../types';
import { SkeletonLoader } from './SkeletonLoader';
// FIX: Moved image fallbacks to constants and consolidated imports.
import { MapPinIcon, AlertTriangleIcon, TicketIcon, PlusIcon, BuildingIcon, StarIcon, CrownIcon, XIcon, DATE_CATEGORIES, PLACEHOLDER_IMAGE_URL, CATEGORY_IMAGE_FALLBACKS } from '../constants';
import type { ColorTheme } from '../constants';

interface DateCardProps {
    datePost: DatePost;
    allUsers: User[];
    allBusinesses: Business[];
    onToggleInterest: (dateId: number) => void;
    onPriorityInterest: (dateId: number) => void;
    isInterested: boolean;
    isCreator: boolean;
    gender?: Gender;
    onViewProfile: (user: User) => void;
    onViewBusiness: (business: Business) => void;
    currentUser: User;
    onPremiumFeatureClick: () => void;
}

const DateCard: React.FC<DateCardProps> = ({ datePost, allUsers, allBusinesses, onToggleInterest, onPriorityInterest, isInterested, isCreator, gender, onViewProfile, onViewBusiness, currentUser, onPremiumFeatureClick }) => {
    const creator = allUsers.find(u => u.id === datePost.createdBy);
    const business = datePost.businessId ? allBusinesses.find(b => b.id === datePost.businessId) : null;

    if (!creator) return null;

    const formattedDate = new Date(datePost.dateTime).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
    
    const formattedTime = new Date(datePost.dateTime).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit'
    });
    
    const formattedDateOnly = new Date(datePost.dateTime).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });
    
    // Extract price range from description or use default
    const priceRange = datePost.description.match(/\$[\d,]+-\$[\d,]+|\$[\d,]+\+/)?.[0] || 'Free';
    
    const isMaleTheme = gender === Gender.Male;
    const hoverBorderClass = isMaleTheme ? 'hover:border-green-600' : 'hover:border-brand-pink';
    const titleClass = isMaleTheme ? 'text-white' : 'text-brand-light';
    const creatorTextColor = isMaleTheme ? 'text-lime-400' : 'text-brand-light';
    
    const handleGetDirections = () => {
        if (!datePost.location) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(datePost.location)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handlePriorityClick = () => {
        if (!currentUser.isPremium) {
            onPremiumFeatureClick();
        } else {
            onPriorityInterest(datePost.id);
        }
    };

    return (
        <div className={`bg-dark-2 rounded-2xl p-6 flex flex-col gap-4 border border-dark-3 ${hoverBorderClass} transition-colors duration-300`}>
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => onViewProfile(creator)}
                    className="flex items-center gap-3 text-left rounded-lg p-1 -ml-1 hover:bg-dark-3/50 transition-colors"
                    aria-label={`View profile of ${creator.name}`}
                >
                    <img src={creator.photos[0]} alt={creator.name} className="w-12 h-12 rounded-full object-cover"/>
                    <div>
                        <p className="font-semibold text-white">{creator.name}, {creator.age}</p>
                        <p className="text-sm text-gray-400">Posted a date idea</p>
                    </div>
                </button>
                {business && (
                    <button 
                        onClick={() => onViewBusiness(business)}
                        className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20"
                    >
                       <BuildingIcon className="w-4 h-4" /> Partner Venue
                    </button>
                )}
            </div>
            
            {/* Scannable Data Bar */}
            <div className="flex items-center justify-between bg-dark-3/50 rounded-lg p-3 border border-dark-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMaleTheme ? 'bg-lime-400' : 'bg-brand-pink'}`}></div>
                        <span className="text-sm font-semibold text-white">{formattedDateOnly}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMaleTheme ? 'bg-green-400' : 'bg-cyan-400'}`}></div>
                        <span className="text-sm font-semibold text-white">{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMaleTheme ? 'bg-yellow-400' : 'bg-orange-400'}`}></div>
                        <span className="text-sm font-semibold text-white">{priceRange}</span>
                    </div>
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
                 <div className="mt-2 flex gap-2">
                    <button 
                        onClick={() => onToggleInterest(datePost.id)} 
                        className={`flex-1 w-full py-2 rounded-lg font-bold transition-all duration-300 ${isInterested ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30'}`}
                    >
                        {isInterested ? "I'm Not Interested" : "I'm Interested!"}
                    </button>
                    <button
                        onClick={handlePriorityClick}
                        className={`relative flex-1 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${ isMaleTheme ? 'bg-lime-500/20 text-lime-300 hover:bg-lime-500/30' : 'bg-brand-light/20 text-brand-light hover:bg-brand-light/30'}`}
                        aria-label="Express priority interest"
                    >
                        {!currentUser.isPremium && (
                            <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                                <CrownIcon className="w-3 h-3" />
                            </div>
                        )}
                        <StarIcon className="w-5 h-5" />
                        Priority
                    </button>
                </div>
            )}
            {isCreator && (
                <div className={`mt-2 w-full py-2 text-center rounded-lg bg-dark-3 ${creatorTextColor} font-bold`}>This is your date</div>
            )}
        </div>
    );
};

// --- NEW COMPONENT: LocalEventCard ---
interface LocalEventCardProps {
    event: LocalEvent;
    onCreate: (event: LocalEvent) => void;
    onViewDetails: (event: LocalEvent) => void;
}

const LocalEventCard: React.FC<LocalEventCardProps> = ({ event, onCreate, onViewDetails }) => {
    // FIX: Added an onError handler to the image to fall back to a category image if the provided URL is broken.
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.currentTarget;
        const fallbackSrc = CATEGORY_IMAGE_FALLBACKS[event.category] || PLACEHOLDER_IMAGE_URL;
        if (target.src !== fallbackSrc) { // Prevent infinite loops if the fallback itself is broken
            target.src = fallbackSrc;
        }
    };

    // Format the event date for clear display
    const formattedEventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="flex-shrink-0 w-72 bg-dark-2 rounded-2xl overflow-hidden border border-dark-3 shadow-lg group relative">
             <div className="relative h-full">
                <button onClick={() => onViewDetails(event)} className="w-full h-full text-left">
                    <img 
                        src={event.imageUrl?.trim() || CATEGORY_IMAGE_FALLBACKS[event.category] || PLACEHOLDER_IMAGE_URL} 
                        onError={handleImageError}
                        alt={event.title} 
                        className="w-full h-40 object-cover absolute inset-0" 
                        style={{ height: '100%', minHeight: '200px' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                    <div className="relative p-4 flex flex-col justify-end h-full text-white min-h-[200px]">
                        <div className="flex-grow"></div>
                        <div className="text-sm font-bold text-cyan-300 mb-1">{formattedEventDate}</div>
                        <h4 className="font-bold text-lg">{event.title}</h4>
                        <p className="text-sm text-gray-300">{event.location}</p>
                    </div>
                </button>
                <button 
                    onClick={() => onCreate(event)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] py-2 rounded-lg font-bold text-white bg-blue-600/80 backdrop-blur-sm hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    aria-label={`Create a date from ${event.title}`}
                >
                    <PlusIcon className="w-5 h-5"/>
                    Create Date
                </button>
            </div>
        </div>
    );
};

interface BusinessCardProps {
    business: Business;
    deals: Deal[];
    onView: (business: Business) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, deals, onView }) => {
    const hasDeals = deals.some(d => d.businessId === business.id);
    
    // FIX: Added an onError handler to the image for robust fallback.
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.currentTarget;
        const fallbackSrc = CATEGORY_IMAGE_FALLBACKS[business.category] || PLACEHOLDER_IMAGE_URL;
        if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
        }
    };

    return (
        <button onClick={() => onView(business)} className="flex-shrink-0 w-80 bg-dark-2 rounded-2xl overflow-hidden border border-dark-3 shadow-lg group relative text-left">
            <img 
                src={(business.photos && business.photos[0]?.trim()) || CATEGORY_IMAGE_FALLBACKS[business.category] || PLACEHOLDER_IMAGE_URL} 
                onError={handleImageError}
                alt={business.name} 
                className="w-full h-full object-cover absolute inset-0" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
            {hasDeals && (
                 <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    Special Offer!
                </div>
            )}
            <div className="relative p-4 flex flex-col justify-end h-full text-white min-h-[200px]">
                <div className="flex-grow"></div>
                <h4 className="font-bold text-lg">{business.name}</h4>
                <p className="text-sm text-gray-300 line-clamp-2">{business.description}</p>
            </div>
        </button>
    );
}

// --- NEW COMPONENT: EventDetailModal ---
interface EventDetailModalProps {
    event: LocalEvent | null;
    onClose: () => void;
    onCreate: (event: LocalEvent) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onCreate }) => {
    if (!event) return null;

    const handleCreate = () => {
        onCreate(event);
        onClose();
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.currentTarget;
        const fallbackSrc = CATEGORY_IMAGE_FALLBACKS[event.category] || PLACEHOLDER_IMAGE_URL;
        if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-dark-2 rounded-2xl w-full max-w-lg border border-dark-3 shadow-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="relative h-64 w-full bg-dark-3">
                    <img src={event.imageUrl} onError={handleImageError} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                     <h3 className="absolute bottom-4 left-4 text-3xl font-bold text-white shadow-2xl">{event.title}</h3>
                </div>
                <div className="p-6">
                    <p className="font-semibold text-gray-300">{event.location} • {event.date}</p>
                    <p className="text-gray-300 mt-4">{event.description}</p>
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 font-semibold mt-4 inline-block">
                        View Original Source &rarr;
                    </a>
                </div>
                <div className="p-4 border-t border-dark-3 mt-auto">
                    <button onClick={handleCreate} className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                        Create Date From This Event
                    </button>
                </div>
                 <button onClick={onClose} className="absolute top-3 right-3 bg-dark-3 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-dark-3/80 z-10">&times;</button>
            </div>
        </div>
    );
};


interface DateMarketplaceProps {
    datePosts: DatePost[];
    allUsers: User[];
    businesses: Business[];
    deals: Deal[];
    onToggleInterest: (dateId: number) => void;
    onPriorityInterest: (dateId: number) => void;
    currentUserId: number;
    gender?: Gender;
    isLoading: boolean;
    onViewProfile: (user: User) => void;
    onViewBusiness: (business: Business) => void;
    activeColorTheme: ColorTheme;
    localEvents: LocalEvent[];
    onCreateDateFromEvent: (event: LocalEvent) => void;
    searchLocation: string;
    effectiveSearchLocation: string;
    isSearchExpanded: boolean;
    onSearchLocationChange: (location: string) => void;
    isEventsLoading: boolean;
    onPremiumFeatureClick: () => void;
    onSeeAll: () => void;
}

const DateMarketplace: React.FC<DateMarketplaceProps> = ({ datePosts, allUsers, businesses, deals, onToggleInterest, onPriorityInterest, currentUserId, gender, isLoading, onViewProfile, onViewBusiness, activeColorTheme, localEvents, onCreateDateFromEvent, searchLocation, effectiveSearchLocation, isSearchExpanded, onSearchLocationChange, isEventsLoading, onPremiumFeatureClick, onSeeAll }) => {
    const [activeCategory, setActiveCategory] = useState<DateCategory | 'All'>('All');
    const [tempSearch, setTempSearch] = useState(searchLocation);
    const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);
    const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
    
    useEffect(() => {
        setTempSearch(searchLocation);
    }, [searchLocation]);

    const filteredDatePosts = useMemo(() => {
        if (!effectiveSearchLocation) return []; // Don't show any community posts if no location is set.
        return datePosts.filter(post => {
            const categoryMatch = activeCategory === 'All' || post.categories.includes(activeCategory);
            const locationMatch = post.location.toLowerCase().includes(effectiveSearchLocation.toLowerCase());
            return categoryMatch && locationMatch;
        });
    }, [datePosts, activeCategory, effectiveSearchLocation]);

    const sortedDatePosts = useMemo(() => {
        const sorted = [...filteredDatePosts];
        if (sortBy === 'date') {
            sorted.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        } else if (sortBy === 'price') {
            sorted.sort((a, b) => {
                const getPrice = (description: string) => {
                    const match = description.match(/\$[\d,]+-\$[\d,]+|\$[\d,]+\+/);
                    if (!match) return 0;
                    const numbers = match[0].match(/[\d,]+/g);
                    if (!numbers) return 0;
                    return parseInt(numbers[0].replace(',', ''));
                };
                return getPrice(a.description) - getPrice(b.description);
            });
        }
        return sorted;
    }, [filteredDatePosts, sortBy]);

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearchLocationChange(tempSearch);
    };

    const currentUser = allUsers.find(u => u.id === currentUserId);

    return (
        <div className="max-w-2xl mx-auto">
             <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onCreate={onCreateDateFromEvent} />
             <h2 className={`text-3xl font-bold text-center mb-8 bg-gradient-to-r ${activeColorTheme.gradientFrom} ${activeColorTheme.gradientTo} text-transparent bg-clip-text`}>Date Marketplace</h2>
             
            <div className="mb-12">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${activeColorTheme.bg} ${activeColorTheme.glow} flex items-center justify-center`}>
                            <TicketIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white capitalize">{effectiveSearchLocation ? `Happening in ${effectiveSearchLocation}` : 'Search a City to Find Events'}</h3>
                            <p className="text-sm text-gray-400">AI-powered real-time event ideas</p>
                        </div>
                    </div>
                     <button onClick={onSeeAll} className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1">
                        See All <span className="text-lg">&rarr;</span>
                    </button>
                </div>
                {isEventsLoading ? (
                    <div className="flex gap-4">
                        <SkeletonLoader className="w-72 h-48 rounded-2xl flex-shrink-0" />
                        <SkeletonLoader className="w-72 h-48 rounded-2xl flex-shrink-0" />
                        <SkeletonLoader className="w-72 h-48 rounded-2xl flex-shrink-0" />
                    </div>
                ) : (
                    localEvents.length > 0 ? (
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none"></div>
                            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-4 -mx-4 px-4 relative">
                                {localEvents.map((event, index) => (
                                    <div key={event.id} className={`relative ${index === 0 ? 'ml-0' : ''}`}>
                                        {index === 0 && (
                                            <div className="absolute -top-2 -left-2 z-10">
                                                <div className={`px-2 py-1 text-xs font-bold text-white rounded-full ${activeColorTheme.bg} ${activeColorTheme.glow}`}>
                                                    Featured
                                                </div>
                                            </div>
                                        )}
                                        <LocalEventCard key={event.id} event={event} onCreate={onCreateDateFromEvent} onViewDetails={setSelectedEvent} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-8 bg-dark-2 rounded-xl border border-dark-3">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-dark-3 flex items-center justify-center`}>
                                <TicketIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="font-bold text-lg text-gray-300">
                                {searchLocation ? `No events found for ${searchLocation}.` : "What's the plan?"}
                            </h4>
                            <p className="mt-1 text-sm">
                                {searchLocation ? "Try another search, or browse community ideas below." : "Search for a city to get AI-powered, real-time event ideas!"}
                            </p>
                        </div>
                    )
                )}
            </div>

            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <BuildingIcon className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-2xl font-bold text-white">Partner Venues {effectiveSearchLocation && `in ${effectiveSearchLocation}`}</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide py-4 -mx-4 px-4">
                   {businesses.map(business => (
                       <BusinessCard key={business.id} business={business} deals={deals} onView={onViewBusiness} />
                   ))}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">Community Date Ideas {effectiveSearchLocation && `in ${effectiveSearchLocation}`}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400 font-medium">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'price')}
                        className="bg-dark-3 text-white text-sm rounded-lg px-3 py-1.5 border border-dark-4 focus:border-brand-pink focus:outline-none"
                    >
                        <option value="date">Date</option>
                        <option value="price">Price</option>
                    </select>
                </div>
            </div>
            <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                    <div className="relative flex-grow group">
                        <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                            placeholder="Search by city to find events & dates..."
                            className="w-full bg-dark-3 border border-dark-3 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-brand-pink focus:border-brand-pink transition group-hover:border-dark-2"
                        />
                        {tempSearch && (
                            <button
                                type="button"
                                onClick={() => setTempSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                aria-label="Clear search"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        Search
                    </button>
                    {searchLocation && (
                        <button 
                            type="button" 
                            onClick={() => { onSearchLocationChange(''); setTempSearch(''); }}
                            className="px-5 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
                {tempSearch && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        <div className="text-xs text-gray-400">Popular locations:</div>
                        {['Denver', 'New York', 'Los Angeles', 'Chicago'].map(city => (
                            <button
                                key={city}
                                type="button"
                                onClick={() => setTempSearch(city)}
                                className="text-xs px-2 py-1 bg-dark-3 text-gray-300 rounded-full hover:bg-dark-2 hover:text-white transition"
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                )}
            </form>
            
            {isSearchExpanded && (
                <div className="bg-blue-900/50 text-blue-200 text-sm p-3 rounded-lg mb-4 border border-blue-700/50">
                    Not many results found for <span className="font-bold">{searchLocation}</span>. Showing popular dates from nearby <span className="font-bold">{effectiveSearchLocation}</span> instead.
                </div>
            )}


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
                ) : effectiveSearchLocation ? (
                    sortedDatePosts.length > 0 ? (
                        sortedDatePosts.map(post => {
                            const isInterested = post.applicants.includes(currentUserId);
                            const isCreator = post.createdBy === currentUserId;
                            return (
                                <DateCard 
                                    key={post.id} 
                                    datePost={post} 
                                    allUsers={allUsers}
                                    allBusinesses={businesses}
                                    onToggleInterest={onToggleInterest}
                                    onPriorityInterest={onPriorityInterest}
                                    isInterested={isInterested}
                                    isCreator={isCreator}
                                    gender={gender}
                                    onViewProfile={onViewProfile}
                                    onViewBusiness={onViewBusiness}
                                    currentUser={currentUser!}
                                    onPremiumFeatureClick={onPremiumFeatureClick}
                                />
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-400 py-16">
                            <div className="mb-8">
                                <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${activeColorTheme.bg} ${activeColorTheme.glow} flex items-center justify-center`}>
                                    <PlusIcon className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-300 mb-2">No dates found in your area</h3>
                                <p className="text-gray-400 mb-6">Be the first to create an amazing date idea for your community!</p>
                            </div>
                            <button 
                                onClick={() => window.location.href = '#create'}
                                className={`px-8 py-4 rounded-lg font-bold text-white text-lg ${activeColorTheme.bg} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${activeColorTheme.glow}`}
                            >
                                Post a Date Now
                            </button>
                        </div>
                    )
                ) : (
                    <div className="text-center text-gray-400 py-12">
                        <h3 className="text-xl font-bold text-gray-300">Set a location to see dates!</h3>
                        <p className="mt-2">Use the search bar above to find dates in your city.</p>
                    </div>
                )}
             </div>
        </div>
    );
};

export default DateMarketplace;
