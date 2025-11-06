// FIX: Import React to use React.FC
import React from 'react';

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export interface Badge {
  id: 'first_date' | 'adventurous' | 'starter' | 'prolific_planner' | 'community_contender';
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export interface User {
  id: number;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  gender: Gender;
  isPremium: boolean;
  isVerified: boolean;
  preferences: {
    interestedIn: Gender[];
    ageRange: { min: number; max: number };
    relationshipIntent: 'Serious' | 'Casual' | 'Exploring';
    communicationStyle: 'Texting' | 'Calls' | 'In-person';
    activityLevel: 'Active' | 'Relaxed' | 'Bit of both';
  };
  earnedBadgeIds?: Badge['id'][];
}

export type DateCategory = 'Food & Drink' | 'Outdoors & Adventure' | 'Arts & Culture' | 'Nightlife' | 'Relaxing & Casual' | 'Active & Fitness' | 'Adult (18+)';

export interface DatePost {
  id: number;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  createdBy: number;
  applicants: number[];
  priorityApplicants?: number[];
  chosenApplicantId: number | null;
  categories: DateCategory[];
  businessId?: number; // Link to a partner business
  dealId?: number; // Link to a specific deal
}

export interface DateIdea {
  title: string;
  location: string;
  description: string;
}

export interface LocationSuggestion {
  name: string;
  address: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
  read: boolean;
}

export enum View {
  Swipe,
  Dates,
  Create,
  Matches,
  MyDates,
  Profile,
  Chat,
  BusinessSignup,
  Leaderboard,
}

export interface LocalEvent {
  id: number;
  title: string;
  category: DateCategory;
  description:string;
  location: string;
  date: string;
  imageUrl: string;
  source: string;
  price?: string;
}

export interface Business {
    id: number;
    name: string;
    description: string;
    address: string;
    category: DateCategory;
    photos: string[];
    website?: string;
    status: 'approved' | 'pending';
}

export interface Deal {
    id: number;
    businessId: number;
    title: string;
    description: string;
    commissionRate: number; // e.g., 0.15 for 15%
}