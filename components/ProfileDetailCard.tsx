import React, { useState, useRef } from 'react';
import { User } from '../types';
import { BadgeDisplay } from './ProfileSettings';

interface ProfileDetailCardProps {
  user: User;
}

const ProfileDetailCard: React.FC<ProfileDetailCardProps> = ({ user }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== currentPhotoIndex) {
        setCurrentPhotoIndex(index);
      }
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl shadow-lg bg-dark-2 select-none group">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl overflow-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        {user.photos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`${user.name} profile photo ${index + 1}`}
            className="w-full h-full object-cover flex-shrink-0 snap-center"
          />
        ))}
      </div>

      {/* Photo Navigation and Indicators */}
      {user.photos.length > 1 && (
        <div className="absolute top-0 left-0 right-0 p-2 z-10 pointer-events-none">
            <div className="flex gap-1">
                {user.photos.map((_, index) => (
                    <div key={index} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${index === currentPhotoIndex ? 'bg-white/90' : 'bg-white/40'}`}></div>
                ))}
            </div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none rounded-2xl" />
      <div className="absolute bottom-0 left-0 p-6 text-white w-full">
        <h2 className="text-3xl font-bold">{user.name}, {user.age}</h2>
        <p className="mt-2 text-light-2">{user.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.interests.map(interest => (
            <span key={interest} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{interest}</span>
          ))}
        </div>
         {user.earnedBadgeIds && user.earnedBadgeIds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-3">
              {user.earnedBadgeIds.map(badgeId => (
                <BadgeDisplay key={badgeId} badgeId={badgeId} />
              ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetailCard;