import { User, DateIdea, LocationSuggestion, Message, DateCategory } from '../types';

const API_BASE = '/api/ai';

async function post<T>(action: string, payload: any): Promise<T> {
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
}

export const enhanceDateDescription = async (idea: string): Promise<string> => {
    const data = await post<{ text: string }>('enhanceDateDescription', { idea });
    return data.text;
};

export const generateFullDateIdea = async (user: User): Promise<{ title: string; description: string; location: string; }> => {
  return post('generateFullDateIdea', { user });
};

export const generateIcebreakers = async (user: User): Promise<string[]> => {
    const data = await post<{ icebreakers: string[] }>('generateIcebreakers', { user });
    return data.icebreakers;
};

export const getCompatibilityScore = async (currentUser: User, otherUser: User): Promise<{ score: number; summary: string; }> => {
  return post('getCompatibilityScore', { currentUser, otherUser });
};

export const getProfileFeedback = async (user: User): Promise<string[]> => {
  const data = await post<{ tips: string[] }>('getProfileFeedback', { user });
  return data.tips;
};

export const generateDateIdeas = async (user1: User, user2: User): Promise<DateIdea[]> => {
  const data = await post<{ ideas: DateIdea[] }>('generateDateIdeas', { user1, user2 });
  return data.ideas;
};

export const suggestLocations = async (title: string, description: string): Promise<LocationSuggestion[]> => {
  const data = await post<{ locations: LocationSuggestion[] }>('suggestLocations', { title, description });
  return data.locations;
};

export const generateChatReplies = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string[]> => {
  const data = await post<{ replies: string[] }>('generateChatReplies', { currentUser, otherUser, messages });
  return data.replies;
};

export const optimizePhotoOrder = async (photos: string[]): Promise<string[]> => {
  const data = await post<{ newOrder: number[] }>('optimizePhotoOrder', { photos });
  if (!data.newOrder || data.newOrder.length !== photos.length) {
    throw new Error('AI returned an invalid photo order.');
  }
  return data.newOrder.map((i) => photos[i]);
};

export const generateAppBackground = async (prompt: string): Promise<string> => {
  const data = await post<{ dataUrl: string }>('generateAppBackground', { prompt });
  return data.dataUrl;
};

export const categorizeDatePost = async (title: string, description: string): Promise<DateCategory[]> => {
  const data = await post<{ categories: DateCategory[] }>('categorizeDatePost', { title, description });
  return data.categories || [];
};

export const getProfileVibe = async (user: User): Promise<string> => {
    const data = await post<{ text: string }>('getProfileVibe', { user });
    return data.text;
};

export const getWingmanTip = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string> => {
  const data = await post<{ text: string }>('getWingmanTip', { currentUser, otherUser, messages });
  return data.text;
};
