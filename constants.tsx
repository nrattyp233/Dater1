import React from 'react';
import { Badge, DateCategory } from './types';

// USER
export const CURRENT_USER_ID = 1;

// THEMES
export interface ColorTheme {
  bg: string;
  glow: string;
  gradientFrom: string;
  gradientTo: string;
}

export const colorThemes: ColorTheme[] = [
    { bg: 'bg-brand-pink', glow: 'shadow-glow-pink', gradientFrom: 'from-brand-pink', gradientTo: 'to-brand-purple' },
    { bg: 'bg-blue-600', glow: 'shadow-glow-blue', gradientFrom: 'from-blue-500', gradientTo: 'to-cyan-400' },
    { bg: 'bg-green-600', glow: 'shadow-glow-green', gradientFrom: 'from-green-500', gradientTo: 'to-emerald-400' },
    { bg: 'bg-orange-500', glow: 'shadow-glow-orange', gradientFrom: 'from-orange-500', gradientTo: 'to-amber-400' },
    { bg: 'bg-teal-500', glow: 'shadow-glow-teal', gradientFrom: 'from-teal-500', gradientTo: 'to-cyan-500' },
];

// CATEGORIES
export const DATE_CATEGORIES: Record<DateCategory, { color: string }> = {
    'Food & Drink': { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    'Outdoors & Adventure': { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    'Arts & Culture': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    'Nightlife': { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    'Relaxing & Casual': { color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    'Active & Fitness': { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    'Adult (18+)': { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
};

// SVG Icons
export const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

export const UndoIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.36 5.64L20 9l-5.64 2.36L13 17l-1-5.64L6 9l5.64-1.36L12 2zm-3 10l-1.18 2.82L5 16l2.82 1.18L9 20l1.18-2.82L13 16l-2.82-1.18L9 12zm10 2l-1.18 2.82L15 18l2.82 1.18L19 22l1.18-2.82L23 18l-2.82-1.18L19 14z"/>
    </svg>
);

export const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
    </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
);

export const CogIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61-.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0-.61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
);

export const ChatIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
);

export const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
    </svg>
);

export const BrainIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 7.5c0-1.29-1.03-2.5-2.5-2.5s-2.5 1.21-2.5 2.5c0 .92.54 1.74 1.3 2.19l-.51 1.54c-1.3-.49-2.29-1.74-2.29-3.23 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 .92-.37 1.75-.95 2.36l-.8-.86c.21-.29.35-.64.35-1zM9 13v-2H7v2h2zm6 0v-2h-2v2h2zm-9-4h2V7H6v2zm6 0h2V7h-2v2zm3-1.5c0-1.93-1.57-3.5-3.5-3.5S8.5 5.57 8.5 7.5c0 .92.37 1.75.95 2.36l.8-.86C10.04 8.74 9.5 7.92 9.5 7c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 .92-.54 1.74-1.3 2.19l.51 1.54c1.3-.49 2.29-1.74 2.29-3.23zM21 11.5c0-1.55-1.09-2.88-2.58-3.35l-.78-2.33C16.92 3.65 14.66 2 12 2S7.08 3.65 6.36 5.82l-.78 2.33C4.09 8.62 3 9.95 3 11.5c0 1.93 1.57 3.5 3.5 3.5h.5v2c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-2h.5c1.93 0 3.5-1.57 3.5-3.5zM15 17H9v-2h6v2z"/>
    </svg>
);

export const CrownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/>
    </svg>
);

export const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
);

export const AlertTriangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

export const TicketIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
);

export const BuildingIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
    </svg>
);

{/* FIX: Updated StarIcon to accept and apply a 'style' prop to fix a type error in SwipeDeck.tsx. */}
export const StarIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

export const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5 2h-13C4.12 2 3 3.12 3 4.5V10c0 .94.57 1.76 1.38 2.12L6 13v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-6l1.62-.88C20.43 11.76 21 10.94 21 10V4.5C21 3.12 19.88 2 18.5 2zM6 9H4V5h2v4zm14-4h-2v4h2V5z"/>
    </svg>
);

export const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// BADGES
const FirstDateIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);
const AdventurousIcon = ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 15l4-4 4 4 5-5 4 4" />
    </svg>
);
const StarterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4z" />
    </svg>
);
const ProlificPlannerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const CommunityContenderIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const BADGES: Record<Badge['id'], Badge> = {
    first_date: {
        id: 'first_date',
        name: 'First Date Dynamo',
        description: "You posted your first date idea! Way to put yourself out there.",
        icon: FirstDateIcon,
    },
    adventurous: {
        id: 'adventurous',
        name: 'Adventurer',
        description: 'You posted an adventurous date. Let the excitement begin!',
        icon: AdventurousIcon,
    },
    starter: {
        id: 'starter',
        name: 'Conversation Starter',
        description: "You've sent your first few messages. Keep the chats flowing!",
        icon: StarterIcon,
    },
    prolific_planner: {
        id: 'prolific_planner',
        name: 'Prolific Planner',
        description: "You've posted multiple date ideas. You're a dating visionary!",
        icon: ProlificPlannerIcon,
    },
    community_contender: {
        id: 'community_contender',
        name: 'Community Contender',
        description: 'You participated in a community challenge event!',
        icon: CommunityContenderIcon,
    },
};