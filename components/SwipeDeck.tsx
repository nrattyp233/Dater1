import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User } from '../types';
import { HeartIcon, XIcon, UndoIcon, SparklesIcon, CrownIcon, StarIcon } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { getCompatibilityScore, getProfileVibe } from '../services/geminiService';
import SwipeCard from './SwipeCard';

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
  
  const handleSwipe = (userId: number, direction: 'left' | 'right') => {
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
  
  const handleSuperLikeClick = () => {
    if (!currentUser?.isPremium) {
        onPremiumFeatureClick();
        return;
    }
    const topUserId = userStack[userStack.length - 1]?.id;
    if (topUserId) {
        onSuperLike(topUserId);
        setShowSuperLikeAnimation(true);
        setTimeout(() => setShowSuperLikeAnimation(false), 2500);
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
      <div className="relative w-full flex-grow min-h-[50vh]">
        {showMatchAnimation && (
            <div 
              className="absolute top-16 right-0 text-5xl font-bold text-yellow-300 pointer-events-none animate-slide-in-right z-10" 
              style={{ textShadow: '0 0 15px rgba(253, 224, 71, 0.8)' }}
            >
                Match!
            </div>
        )}
         {showSuperLikeAnimation && (
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-blue-400 pointer-events-none animate-ping z-20"
            >
                <StarIcon className="w-32 h-32" style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' }} />
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
         <button onClick={handleSuperLikeClick} className="relative bg-white/10 p-4 rounded-full text-blue-400 hover:bg-white/20 transition-transform duration-200 hover:scale-110 active:scale-95">
            {!currentUser?.isPremium && (
                 <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                    <CrownIcon className="w-4 h-4" />
                </div>
            )}
            <StarIcon className="w-7 h-7"/>
        </button>
        <button onClick={() => handleSwipe(userStack[userStack.length - 1].id, 'right')} className="bg-white/10 p-5 rounded-full text-green-400 hover:bg-white/20 transition-transform duration-200 hover:scale-110 active:scale-95">
          <HeartIcon className="w-9 h-9"/>
        </button>
      </div>
    </div>
  );
};

export default SwipeDeck;