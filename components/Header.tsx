import React from 'react';
import { View } from '../types';
import { HeartIcon, UserIcon, CalendarIcon, PlusIcon, CogIcon, ChatIcon, BuildingIcon, TrophyIcon } from '../constants';
import type { ColorTheme } from '../constants';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  activeColorTheme: ColorTheme;
}

// FIX: Extracted NavButton props to a separate interface for better type safety and to resolve potential type inference issues.
interface NavButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  activeColor: string;
  activeGlow: string;
}

const NavButton: React.FC<NavButtonProps> = ({ isActive, onClick, children, ariaLabel, activeColor, activeGlow }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`p-3 rounded-full transition-all duration-300 ${isActive ? `${activeColor} text-white ${activeGlow}` : 'text-gray-400 hover:bg-dark-3 hover:text-white'}`}
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, activeColorTheme }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-2/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Heart Path */}
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F91880"/>
                    {/* Sparkle Path */}
                    <path d="M12 6l1.06 2.54L15.5 9.5l-2.54 1.06L12 13l-1.06-2.54L8.5 9.5l2.54-1.06L12 6z" fill="white"/>
                </svg>
            </div>
          <h1
            className="text-2xl font-medium font-montserrat tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-purple-500 to-cyan-400 bg-[length:200%_auto] animate-text-gradient-flow"
          >
            Create-A-Date
          </h1>
        </div>
        <nav className="flex items-center space-x-1 bg-dark-3 p-1 rounded-full">
          <NavButton isActive={currentView === View.Swipe} onClick={() => setCurrentView(View.Swipe)} ariaLabel="Swipe profiles" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <HeartIcon className="w-6 h-6" />
          </NavButton>
          <NavButton isActive={currentView === View.Dates} onClick={() => setCurrentView(View.Dates)} ariaLabel="Browse dates" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <CalendarIcon className="w-6 h-6" />
          </NavButton>
          <NavButton isActive={currentView === View.Create} onClick={() => setCurrentView(View.Create)} ariaLabel="Create a date" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <PlusIcon className="w-6 h-6" />
          </NavButton>
           <NavButton isActive={currentView === View.Leaderboard} onClick={() => setCurrentView(View.Leaderboard)} ariaLabel="Leaderboard" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <TrophyIcon className="w-6 h-6" />
          </NavButton>
          <NavButton isActive={currentView === View.Chat} onClick={() => setCurrentView(View.Chat)} ariaLabel="My chats" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <ChatIcon className="w-6 h-6" />
          </NavButton>
          <NavButton isActive={currentView === View.MyDates} onClick={() => setCurrentView(View.MyDates)} ariaLabel="My dates" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <UserIcon className="w-6 h-6" />
          </NavButton>
           <NavButton isActive={currentView === View.BusinessSignup} onClick={() => setCurrentView(View.BusinessSignup)} ariaLabel="For Businesses" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <BuildingIcon className="w-6 h-6" />
          </NavButton>
           <NavButton isActive={currentView === View.Profile} onClick={() => setCurrentView(View.Profile)} ariaLabel="Profile settings" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <CogIcon className="w-6 h-6" />
          </NavButton>
        </nav>
      </div>
    </header>
  );
};

export default Header;