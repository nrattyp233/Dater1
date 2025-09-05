import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { HeartIcon, XIcon, UndoIcon, SparklesIcon, CrownIcon } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { getCompatibilityScore } from '../services/geminiService';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  compatibility: { score: number; summary: string; } | null;
  isCompatibilityLoading: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, compatibility, isCompatibilityLoading }) => {
  const [dragState, setDragState] = useState({ x: 0, isDragging: false, startX: 0 });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
    }, 300);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => Math.min(prev + 1, user.photos.length - 1));
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));
  };
  
  const handleNavigationClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const cardWidth = (e.target as HTMLElement).offsetWidth;
    const clickX = e.nativeEvent.offsetX;
    
    if (clickX > cardWidth / 2) {
      nextPhoto();
    } else {
      prevPhoto();
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
        <img src={user.photos[currentPhotoIndex]} alt={`${user.name} profile photo ${currentPhotoIndex + 1}`} className="w-full h-full object-cover" />
        
        <div className="absolute top-0 left-0 right-0 p-2">
            <div className="flex gap-1">
                {user.photos.map((_, index) => (
                    <div key={index} className={`h-1 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white/90' : 'bg-white/40'}`}></div>
                ))}
            </div>
        </div>
        
        <div 
          className="absolute inset-0 flex"
          onClick={handleNavigationClick}
        >
          <div className="w-1/2 h-full"></div>
          <div className="w-1/2 h-full"></div>
        </div>


        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-6 text-white w-full pointer-events-none">
          <h2 className="text-3xl font-bold">{user.name}, {user.age}</h2>
          <p className="mt-2 text-light-2">{user.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.interests.map(interest => (
              <span key={interest} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{interest}</span>
            ))}
          </div>

          {(isCompatibilityLoading || compatibility) && (
            <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                    <SparklesIcon className="w-5 h-5" />
                    AI Compatibility Insight
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
    onSwipe: (userId: number, direction: 'left' | 'right') => void;
    onRecall: () => void;
    canRecall: boolean;
    isLoading: boolean;
    onPremiumFeatureClick: () => void;
}

const SwipeDeck: React.FC<SwipeDeckProps> = ({ users, currentUser, onSwipe, onRecall, canRecall, isLoading, onPremiumFeatureClick }) => {
  const [compatibility, setCompatibility] = useState<{ score: number; summary: string } | null>(null);
  const [isCompatibilityLoading, setIsCompatibilityLoading] = useState(false);
  
  const topUser = useMemo(() => users.length > 0 ? users[users.length - 1] : null, [users]);

  useEffect(() => {
    if (topUser && currentUser) {
        setIsCompatibilityLoading(true);
        setCompatibility(null);
        getCompatibilityScore(currentUser, topUser)
            .then(setCompatibility)
            .catch(err => {
                console.error("Failed to get compatibility score:", err);
            })
            .finally(() => setIsCompatibilityLoading(false));
    }
  }, [topUser, currentUser]);
  
  const handleSwipe = (userId: number, direction: 'left' | 'right') => {
    onSwipe(userId, direction);
    setCompatibility(null);
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

  if (userStack.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-gray-300">That's everyone for now!</h2>
            <p className="text-gray-400 mt-2">Check back later for new profiles or explore posted dates.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-[70vh] flex flex-col items-center">
      <div className="relative w-full flex-grow">
        {userStack.map((user, index) => {
           const isTopCard = index === userStack.length - 1;
           return (
              <SwipeCard
                key={user.id}
                user={user}
                onSwipe={(direction) => handleSwipe(user.id, direction)}
                compatibility={isTopCard ? compatibility : null}
                isCompatibilityLoading={isTopCard && isCompatibilityLoading}
              />
           );
        })}
      </div>
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
            onClick={handleRecallClick}
            disabled={!canRecall}
            className="relative bg-white/10 p-4 rounded-full text-amber-400 hover:bg-white/20 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            aria-label="Recall last swipe"
        >
            {!currentUser?.isPremium && (
                 <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full shadow-md">
                    <CrownIcon className="w-4 h-4" />
                </div>
            )}
            <UndoIcon className="w-7 h-7"/>
        </button>
        <button onClick={() => handleSwipe(userStack[userStack.length - 1].id, 'left')} className="bg-white/10 p-5 rounded-full text-red-500 hover:bg-white/20 transition-transform duration-200 hover:scale-110">
          <XIcon className="w-9 h-9"/>
        </button>
        <button onClick={() => handleSwipe(userStack[userStack.length - 1].id, 'right')} className="bg-white/10 p-5 rounded-full text-green-400 hover:bg-white/20 transition-transform duration-200 hover:scale-110">
          <HeartIcon className="w-9 h-9"/>
        </button>
      </div>
    </div>
  );
};

export default SwipeDeck;