import React, { useState } from 'react';
import { User } from '../types';

interface ProfileDetailCardProps {
  user: User;
}

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);


const ProfileDetailCard: React.FC<ProfileDetailCardProps> = ({ user }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => Math.min(prev + 1, user.photos.length - 1));
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNavigationClick = (e: React.MouseEvent) => {
    // This allows tapping on mobile to navigate photos
    const cardWidth = (e.currentTarget as HTMLElement).offsetWidth;
    const clickX = e.nativeEvent.offsetX;
    
    if (clickX > cardWidth / 2) {
      nextPhoto();
    } else {
      prevPhoto();
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg bg-dark-2 select-none group">
      <img src={user.photos[currentPhotoIndex]} alt={`${user.name} profile photo ${currentPhotoIndex + 1}`} className="w-full h-full object-cover" />
      
      {/* Photo Navigation and Indicators */}
      <div className="absolute top-0 left-0 right-0 p-2 z-10">
          <div className="flex gap-1">
              {user.photos.map((_, index) => (
                  <div key={index} className={`h-1 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white/90' : 'bg-white/40'}`}></div>
              ))}
          </div>
      </div>
      
      {/* Clickable navigation areas for touch devices */}
      <div 
        className="absolute inset-0 flex lg:hidden" // Only show on smaller screens where hover is not reliable
        onClick={handleNavigationClick}
      >
        <div className="w-1/2 h-full"></div>
        <div className="w-1/2 h-full"></div>
      </div>
      
      {/* Visible Arrow Buttons on Hover for Desktop */}
      {user.photos.length > 1 && (
        <>
          {currentPhotoIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-white z-20 hidden lg:block"
              aria-label="Previous photo"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}
          {currentPhotoIndex < user.photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-white z-20 hidden lg:block"
              aria-label="Next photo"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-6 text-white w-full pointer-events-none">
        <h2 className="text-3xl font-bold">{user.name}, {user.age}</h2>
        <p className="mt-2 text-light-2">{user.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.interests.map(interest => (
            <span key={interest} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{interest}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailCard;