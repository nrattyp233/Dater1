import React from 'react';
import { View } from '../types';
import { HeartIcon, UserIcon, CalendarIcon, PlusIcon, CogIcon, ChatIcon, ColorTheme } from '../constants';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  activeColorTheme: ColorTheme;
}

const NavButton = ({ isActive, onClick, children, ariaLabel, activeColor, activeGlow }: { isActive: boolean; onClick: () => void; children: React.ReactNode; ariaLabel: string, activeColor: string, activeGlow: string }) => (
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 text-transparent bg-clip-text">
          Create-A-Date
        </h1>
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
          <NavButton isActive={currentView === View.Chat} onClick={() => setCurrentView(View.Chat)} ariaLabel="My chats" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <ChatIcon className="w-6 h-6" />
          </NavButton>
          <NavButton isActive={currentView === View.MyDates} onClick={() => setCurrentView(View.MyDates)} ariaLabel="My dates" activeColor={activeColorTheme.bg} activeGlow={activeColorTheme.glow}>
            <UserIcon className="w-6 h-6" />
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