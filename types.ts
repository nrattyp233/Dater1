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
  id: number;
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
  id: number;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  createdBy: number;
  applicants: number[];
  chosenApplicantId: number | null;
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
  Chat
}