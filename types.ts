import React from 'react';

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export interface Badge {
  id: 'first_date' | 'adventurous' | 'starter' | 'prolific_planner';
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export interface User {
  id: string; // Changed to string to match Supabase user IDs
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  gender: Gender;
  isPremium: boolean;
  preferences: {
    interestedIn: Gender[];
    ageRange: { min: number; max: number };
  };
  earnedBadgeIds?: Badge['id'][];
}

export type DateCategory = 'Food & Drink' | 'Outdoors & Adventure' | 'Arts & Culture' | 'Nightlife' | 'Relaxing & Casual' | 'Active & Fitness' | 'Adult (18+)';

export interface DatePost {
  id: string; // Changed to string to match string ID system
  title: string;
  description: string;
  location: string;
  dateTime: string;
  createdBy: string; // Changed to string to match User.id
  applicants: string[]; // Changed to string array
  chosenApplicantId: string | null; // Changed to string
  categories: DateCategory[];
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
  id: string; // Changed to string to match string ID system
  senderId: string; // Changed to string to match User.id
  receiverId: string; // Changed to string to match User.id
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
  Chat
}