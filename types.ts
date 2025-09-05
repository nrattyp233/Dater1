export enum Gender {
  Male = 'male',
  Female = 'female',
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
}

export interface DatePost {
  id: number;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  createdBy: number;
  applicants: number[];
  chosenApplicantId: number | null;
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

export enum View {
  Swipe,
  Dates,
  Create,
  Matches,
  MyDates,
  Profile
}