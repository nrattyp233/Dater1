import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User } from '../types';
import { HeartIcon, XIcon, UndoIcon, SparklesIcon, CrownIcon, CalendarIcon } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { getCompatibilityScore, getProfileVibe } from '../services/geminiService';

// --- START: WeeklyChallenge Component ---
const WeeklyChallenge: React.FC<{ prompt: string; theme: string; onComplete: () => void; }> = ({ prompt, theme, onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="w-full max-w-sm mx-auto mb-4 bg-dark-2 border-2 border-dashed border-purple-500/50 rounded-2xl p-4 text-center animate-fade-in relative">
             <div className="flex items-center justify-center gap-2 text-purple-400 font-bold mb-2">
                <CalendarIcon className="w-5 h-5" />
                Weekly Challenge: {theme}
            </div>
            <p className="text-gray-300 italic mb-3">"{prompt}"</p>
            <button
                onClick={onComplete}
                className="bg-purple-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
                Take the Challenge!
            </button>
            <button onClick={() => setIsVisible(false)} className="absolute -top-2 -right-2 text-gray-500 hover:text-white">&times;</button>
        </div>
    );
};
// --- END: WeeklyChallenge Component ---

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  compatibility: { score: number; summary: string; } | null;
  isCompatibilityLoading: boolean;
  profileVibe: string | null;
  isVibeLoading: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, compatibility, isCompatibilityLoading, profileVibe, isVibeLoading }) => {
  const [dragState, setDragState] = useState({ x: 0, isDragging: false, startX: 0 });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragState(prev => ({ ...prev, isDragging: true, startX }));
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - dragState.startX;
    setDragState(prev => ({ ...prev, x: deltaX }));
  };

  const handleDragEnd = () => {
    if (!dragState.isDragging) return;

    if (dragState.x > 100) {
      onSwipe('right');
    } else if (dragState.x < -100) {
      onSwipe('left');
    }
    
    setTimeout(() => {
       setDragState({ x: 0, isDragging: false, startX: 0 });
       setCurrentPhotoIndex(0);
       if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
       }
    }, 300);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== currentPhotoIndex) {
        setCurrentPhotoIndex(index);
      }
    }
  };

  const rotation = dragState.x / 10;
  
  const cardStyle = {
    transform: `translateX(${dragState.x}px) rotate(${rotation}deg)`,
    transition: dragState.isDragging ? 'none' : 'transform 0.3s ease-out',
  };
  
  const likeOpacity = dragState.x > 20 ? Math.min(1, dragState.x / 100) : 0;
  const nopeOpacity = dragState.x < -20 ? Math.min(1, Math.abs(dragState.x) / 100) : 0;


  return (
    <div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={cardStyle}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onMouseMove={handleDragMove}
      onTouchMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg bg-dark-2">
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            {user.photos.map((photo, index) => (
                <img
                    key={index}
                    src={photo}
                    alt={`${user.name} profile photo ${index + 1}`}
                    className="w-full h-full object-cover flex-shrink-0 snap-center"
                    draggable="false"
                />
            ))}
        </div>
        
        {user.photos.length > 1 && (
            <div className="absolute top-0 left-0 right-0 p-2 pointer-events-none">
                <div className="flex gap-1">
                    {user.photos.map((_, index) => (
                        <div key={index} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${index === currentPhotoIndex ? 'bg-white/90' : 'bg-white/40'}`}></div>
                    ))}
                </div>
            </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-6 text-white w-full pointer-events-none">
          <h2 className="text-3xl font-bold">{user.name}, {user.age}</h2>
          
           {(isVibeLoading || profileVibe) && (
             <div className="mt-2 min-h-[24px]">
                {isVibeLoading && <SkeletonLoader className="h-4 w-3/4 rounded" />}
                {profileVibe && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <SparklesIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                        <p className="text-sm italic text-cyan-200">"{profileVibe}"</p>
                    </div>
                )}
            </div>
          )}
          
          <p className="mt-2 text-light-2">{user.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.interests.map(interest => (
              <span key={interest} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{interest}</span>
            ))}
          </div>

          {(isCompatibilityLoading || compatibility) && (
            <div className="mt-4 pt-4 border-t border-white/20 min-h-[110px]">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                    <SparklesIcon className="w-5 h-5" />
                    AI Vibe Check
                </div>
                {isCompatibilityLoading && <div className="mt-2"><SkeletonLoader className="h-4 w-3/4 rounded" /></div>}
                {compatibility && (
                    <div className="mt-2 animate-fade-in">
                        <p className="text-sm text-gray-200 italic">"{compatibility.summary}"</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-full bg-dark-3 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-cyan-400 to-emerald-500 h-2.5 rounded-full" style={{ width: `${compatibility.score}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-white">{compatibility.score}%</span>
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>
        <div style={{opacity: likeOpacity}} className="absolute top-12 right-12 text-green-400 border-4 border-green-400 rounded-full p-4 transform -rotate-20 pointer-events-none">
            <h2 className="text-4xl font-bold">LIKE</h2>
        </div>
        <div style={{opacity: nopeOpacity}} className="absolute top-12 left-12 text-red-500 border-4 border-red-500 rounded-full p-4 transform rotate-20 pointer-events-none">
            <h2 className="text-4xl font-bold">NOPE</h2>
        </div>
      </div>
    </div>
  );
};


interface SwipeDeckProps {
    users: User[];
    currentUser: User | undefined;
    onSwipe: (userId: string, direction: 'left' | 'right') => void;
    onRecall: () => void;
    canRecall: boolean;
    isLoading: boolean;
    onPremiumFeatureClick: () => void;
    weeklyChallenge: { theme: string; prompt: string; isCompleted: boolean } | null;
    onCompleteChallenge: () => void;
}

const SwipeDeck: React.FC<SwipeDeckProps> = ({ users, currentUser, onSwipe, onRecall, canRecall, isLoading, onPremiumFeatureClick, weeklyChallenge, onCompleteChallenge }) => {
  const [compatibility, setCompatibility] = useState<{ score: number; summary: string } | null>(null);
  const [isCompatibilityLoading, setIsCompatibilityLoading] = useState(false);
  const [profileVibe, setProfileVibe] = useState<string | null>(null);
  const [isVibeLoading, setIsVibeLoading] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [showMissAnimation, setShowMissAnimation] = useState(false);
  
  const topUser = useMemo(() => users.length > 0 ? users[users.length - 1] : null, [users]);

  useEffect(() => {
    if (topUser && currentUser) {
        setIsCompatibilityLoading(true);
        setIsVibeLoading(true);
        setCompatibility(null);
        setProfileVibe(null);

        const fetchAIFeatures = async () => {
            try {
                const [compat, vibe] = await Promise.all([
                    getCompatibilityScore(currentUser, topUser),
                    getProfileVibe(topUser)
                ]);
                setCompatibility(compat);
                setProfileVibe(vibe);
            } catch (err) {
                 console.error("Failed to get AI features:", err);
            } finally {
                setIsCompatibilityLoading(false);
                setIsVibeLoading(false);
            }
        };
        fetchAIFeatures();
    }
  }, [topUser, currentUser]);
  
  const handleSwipe = (userId: string, direction: 'left' | 'right') => {
    onSwipe(userId, direction);
    setCompatibility(null);
    if (direction === 'right') {
        setShowMatchAnimation(true);
        setTimeout(() => setShowMatchAnimation(false), 2500);
    } else {
        setShowMissAnimation(true);
        setTimeout(() => setShowMissAnimation(false), 2500);
    }
  };

  const handleRecallClick = () => {
    if (currentUser?.isPremium) {
        if (canRecall) {
            onRecall();
        }
    } else {
        onPremiumFeatureClick();
    }
  };
  
  const userStack = useMemo(() => users.slice(Math.max(users.length - 3, 0)), [users]);

  if (isLoading) {
    return (
        <div className="w-full max-w-sm mx-auto h-[70vh] flex flex-col items-center">
            <div className="relative w-full flex-grow">
                 <SkeletonLoader className="absolute w-full h-full rounded-2xl" />
            </div>
            <div className="flex justify-center items-center gap-8 mt-6">
                <SkeletonLoader className="w-16 h-16 rounded-full" />
                <SkeletonLoader className="w-20 h-20 rounded-full" />
                <SkeletonLoader className="w-20 h-20 rounded-full" />
            </div>
        </div>
    )
  }

  if (userStack.length === 0 && !isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-gray-300">That's everyone for now!</h2>
            <p className="text-gray-400 mt-2">Check back later for new profiles or explore posted dates.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-full flex flex-col items-center">
      {weeklyChallenge && !weeklyChallenge.isCompleted && <WeeklyChallenge theme={weeklyChallenge.theme} prompt={weeklyChallenge.prompt} onComplete={onCompleteChallenge} />}
      <div className="relative w-full flex-grow min-h-[50vh]">
        {showMatchAnimation && (
            <div 
              className="absolute top-16 right-0 text-5xl font-bold text-yellow-300 pointer-events-none animate-slide-in-right z-10" 
              style={{ textShadow: '0 0 15px rgba(253, 224, 71, 0.8)' }}
            >
                Match!
            </div>
        )}
        {showMissAnimation && (
            <div 
              className="absolute top-16 left-0 text-6xl font-bold text-blue-400 pointer-events-none animate-slide-in-left z-10" 
              style={{ textShadow: '0 0 15px rgba(96, 165, 250, 0.8)' }}
            >
                !
            </div>
        )}

        {userStack.map((user, index) => {
           const isTopCard = index === userStack.length - 1;
           return (
              <SwipeCard
                key={user.id}
                user={user}
                onSwipe={(direction) => handleSwipe(user.id, direction)}
                compatibility={isTopCard ? compatibility : null}
                isCompatibilityLoading={isTopCard && isCompatibilityLoading}
                profileVibe={isTopCard ? profileVibe : null}
                isVibeLoading={isTopCard && isVibeLoading}
              />
           );
        })}
      </div>
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
            onClick={handleRecallClick}
            disabled={!canRecall}
            className="relative bg-white/10 p-4 rounded-full text-amber-400 hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            aria-label="Recall last swipe"
        >
            {!currentUser?.isPremium && (
                 <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                    <CrownIcon className="w-4 h-4" />
                </div>
            )}
            <UndoIcon className="w-7 h-7"/>
        </button>
        <button onClick={() => handleSwipe(userStack[userStack.length - 1].id, 'left')} className="bg-white/10 p-5 rounded-full text-red-500 hover:bg-white/20 transition-transform duration-200 hover:scale-110 active:scale-95">
          <XIcon className="w-9 h-9"/>
        </button>
        <button onClick={() => handleSwipe(userStack[userStack.length - 1].id, 'right')} className="bg-white/10 p-5 rounded-full text-green-400 hover:bg-white/20 transition-transform duration-200 hover:scale-110 active:scale-95">
          <HeartIcon className="w-9 h-9"/>
        </button>
      </div>
    </div>
  );
};

export default SwipeDeck;
