
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User } from '../types';
import { HeartIcon, XIcon, UndoIcon, StarIcon, CrownIcon } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { getCompatibilityScore, getProfileVibe } from '../services/geminiService';
import SwipeCard, { SwipeCardRef } from './SwipeCard';

interface SwipeDeckProps {
    users: User[];
    currentUser: User | undefined;
    onSwipe: (userId: number, direction: 'left' | 'right') => void;
    onSuperLike: (userId: number) => void;
    onRecall: () => void;
    canRecall: boolean;
    isLoading: boolean;
    onPremiumFeatureClick: () => void;
}

const SwipeDeck: React.FC<SwipeDeckProps> = ({ users, currentUser, onSwipe, onSuperLike, onRecall, canRecall, isLoading, onPremiumFeatureClick }) => {
  const [compatibility, setCompatibility] = useState<{ score: number; summary: string } | null>(null);
  const [isCompatibilityLoading, setIsCompatibilityLoading] = useState(false);
  const [profileVibe, setProfileVibe] = useState<string | null>(null);
  const [isVibeLoading, setIsVibeLoading] = useState(false);
  
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [showMissAnimation, setShowMissAnimation] = useState(false);
  const [showSuperLikeAnimation, setShowSuperLikeAnimation] = useState(false);
  
  const activeCardRef = useRef<SwipeCardRef>(null);

  // Get the last 3 users for the stack
  const userStack = useMemo(() => users.slice(Math.max(users.length - 3, 0)), [users]);
  const topUser = userStack.length > 0 ? userStack[userStack.length - 1] : null;

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
  
  // This function is passed to the SwipeCard and called AFTER the animation completes
  const handleSwipeComplete = (userId: number, direction: 'left' | 'right') => {
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
  
  // Buttons trigger the card's internal animation method
  const triggerSwipeLeft = async () => {
      if (activeCardRef.current) {
          await activeCardRef.current.triggerSwipe('left');
      }
  };

  const triggerSwipeRight = async () => {
      if (activeCardRef.current) {
          await activeCardRef.current.triggerSwipe('right');
      }
  };

  const handleSuperLikeClick = async () => {
    if (!currentUser?.isPremium) {
        onPremiumFeatureClick();
        return;
    }
    if (activeCardRef.current) {
        // Super like typically swipes right visually
        await activeCardRef.current.triggerSwipe('right');
        // But we trigger the specific superlike action
        if (topUser) {
            onSuperLike(topUser.id);
            setShowSuperLikeAnimation(true);
            setTimeout(() => setShowSuperLikeAnimation(false), 2500);
        }
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
  

  if (isLoading) {
    return (
        <div className="w-full max-w-sm mx-auto h-[70vh] flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[9/14]">
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
        <div className="flex flex-col items-center justify-center h-full text-center pt-20 animate-fade-in">
            <div className="bg-dark-2 p-6 rounded-full mb-6 shadow-glow-purple">
                <HeartIcon className="w-16 h-16 text-dark-3" />
            </div>
            <h2 className="text-2xl font-bold text-gray-300">That's everyone for now!</h2>
            <p className="text-gray-400 mt-2 max-w-xs mx-auto">Check back later for new profiles or explore posted dates.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-full flex flex-col items-center">
      {/* Enforce aspect ratio for the card deck to ensure absolute children render correctly */}
      <div className="relative w-full aspect-[9/14] flex-grow perspective-1000">
        {showMatchAnimation && (
            <div 
              className="absolute top-16 right-0 text-5xl font-bold text-yellow-300 pointer-events-none animate-slide-in-right z-50" 
              style={{ textShadow: '0 0 15px rgba(253, 224, 71, 0.8)' }}
            >
                Match!
            </div>
        )}
         {showSuperLikeAnimation && (
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-blue-400 pointer-events-none animate-ping z-50"
            >
                <StarIcon className="w-32 h-32" style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' }} />
            </div>
        )}
        {showMissAnimation && (
            <div 
              className="absolute top-16 left-0 text-6xl font-bold text-blue-400 pointer-events-none animate-slide-in-left z-50" 
              style={{ textShadow: '0 0 15px rgba(96, 165, 250, 0.8)' }}
            >
                !
            </div>
        )}

        {userStack.map((user, index) => {
           const isTopCard = index === userStack.length - 1;
           
           // Calculate stack depth visual effect
           // Top card is at offset 0
           const offsetFromTop = (userStack.length - 1) - index; 
           
           // Only render the top 3 cards visibly
           if (offsetFromTop > 2) return null;

           const scale = 1 - (offsetFromTop * 0.05);
           const translateY = offsetFromTop * 15;
           const brightness = 1 - (offsetFromTop * 0.2);
           
           return (
              <SwipeCard
                key={user.id}
                ref={isTopCard ? activeCardRef : null}
                user={user}
                onSwipe={(direction) => handleSwipeComplete(user.id, direction)}
                compatibility={isTopCard ? compatibility : null}
                isCompatibilityLoading={isTopCard && isCompatibilityLoading}
                profileVibe={isTopCard ? profileVibe : null}
                isVibeLoading={isTopCard && isVibeLoading}
                style={{
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    filter: `brightness(${brightness})`,
                    zIndex: index,
                }}
              />
           );
        })}
      </div>
      <div className="flex justify-center items-center gap-4 mt-6 pb-4 z-50">
        <button
            onClick={handleRecallClick}
            disabled={!canRecall}
            className="relative bg-dark-2 border border-dark-3 p-4 rounded-full text-amber-400 hover:bg-dark-3 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
            aria-label="Recall last swipe"
        >
            {!currentUser?.isPremium && (
                 <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                    <CrownIcon className="w-3 h-3" />
                </div>
            )}
            <UndoIcon className="w-6 h-6"/>
        </button>
        <button onClick={triggerSwipeLeft} className="bg-dark-2 border border-dark-3 p-5 rounded-full text-red-500 hover:bg-dark-3 transition-transform duration-200 hover:scale-110 active:scale-95 shadow-lg">
          <XIcon className="w-8 h-8"/>
        </button>
         <button onClick={handleSuperLikeClick} className="relative bg-dark-2 border border-dark-3 p-4 rounded-full text-blue-400 hover:bg-dark-3 transition-transform duration-200 hover:scale-110 active:scale-95 shadow-lg">
            {!currentUser?.isPremium && (
                 <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                    <CrownIcon className="w-3 h-3" />
                </div>
            )}
            <StarIcon className="w-6 h-6"/>
        </button>
        <button onClick={triggerSwipeRight} className="bg-dark-2 border border-dark-3 p-5 rounded-full text-green-400 hover:bg-dark-3 transition-transform duration-200 hover:scale-110 active:scale-95 shadow-lg">
          <HeartIcon className="w-8 h-8"/>
        </button>
      </div>
    </div>
  );
};

export default SwipeDeck;
