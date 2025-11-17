import { 
  User, 
  DateIdea, 
  LocationSuggestion, 
  Message, 
  DateCategory, 
  LocalEvent 
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for making API requests
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Date Ideas
export const generateDateIdeas = (user1: User, user2: User): Promise<DateIdea[]> => {
  return apiRequest<DateIdea[]>('/generate-date-ideas', 'POST', { user1, user2 });
};

// Location Services
export const getCityFromCoords = (lat: number, lon: number): Promise<string> => {
  return apiRequest<string>('/location/city-from-coords', 'POST', { lat, lon });
};

export const getNearbyMajorCity = (location: string): Promise<string> => {
  return apiRequest<string>('/location/nearby-major-city', 'POST', { location });
};

// Profile Services
export const getProfileVibe = (user: User): Promise<string> => {
  return apiRequest<string>('/profile/vibe', 'POST', { user });
};

export const getProfileFeedback = (user: User): Promise<string[]> => {
  return apiRequest<string[]>('/profile/feedback', 'POST', { user });
};

// Events
export const getRealtimeEvents = (location: string): Promise<LocalEvent[]> => {
  return apiRequest<LocalEvent[]>('/events', 'POST', { location });
};

// Date Enhancement
export const enhanceDateDescription = (idea: string): Promise<string> => {
  return apiRequest<string>('/date/enhance-description', 'POST', { idea });
};

export const generateFullDateIdea = (user: User): Promise<{ title: string; description: string; location: string }> => {
  return apiRequest('/date/generate-full', 'POST', { user });
};

// Chat & Interaction
export const generateIcebreakers = (user: User): Promise<string[]> => {
  return apiRequest<string[]>('/chat/icebreakers', 'POST', { user });
};

export const getCompatibilityScore = (currentUser: User, otherUser: User): Promise<{ score: number; summary: string }> => {
  return apiRequest<{ score: number; summary: string }>('/compatibility/score', 'POST', { currentUser, otherUser });
};

// Location Suggestions
export const suggestLocations = (title: string, description: string): Promise<LocationSuggestion[]> => {
  return apiRequest<LocationSuggestion[]>('/locations/suggest', 'POST', { title, description });
};

// Categorization
export const categorizeDatePost = (title: string, description: string): Promise<DateCategory[]> => {
  return apiRequest<DateCategory[]>('/date/categorize', 'POST', { title, description });
};

// Photo Optimization
export const optimizePhotoOrder = (photos: string[]): Promise<string[]> => {
  return apiRequest<string[]>('/photos/optimize-order', 'POST', { photos });
};

// Background Generation
export const generateAppBackground = (prompt: string): Promise<string> => {
  return apiRequest<string>('/background/generate', 'POST', { prompt });
};

// Chat Replies
export const generateChatReplies = (
  currentUser: User, 
  otherUser: User, 
  messages: Message[]
): Promise<string[]> => {
  return apiRequest<string[]>('/chat/generate-replies', 'POST', {
    currentUser,
    otherUser,
    messages
  });
};
