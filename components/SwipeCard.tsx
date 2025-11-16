import React, { useState, useRef } from 'react';
import { User } from '../types';
import { SparklesIcon, CheckCircleIcon } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';

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
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <span>{user.name}, {user.age}</span>
            {user.isVerified && <CheckCircleIcon className="w-7 h-7 text-blue-400" />}
          </h2>
          
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

export default SwipeCard;