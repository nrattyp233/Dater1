import { User, LocalEvent, Message, DateCategory } from '../types';
import { supabase } from './supabaseClient';

// This file now acts as a client-side wrapper for the Supabase Edge Function
// that handles all Gemini API calls server-side

// Fallback data in case the Edge Function is not available
const MOCK_EVENTS: LocalEvent[] = [
    {
        id: 9001,
        title: "Sunset Jazz in the Park",
        category: "Arts & Culture",
        description: "Enjoy a relaxing evening with live jazz music as the sun sets. Bring a blanket and a friend!",
        location: "Central Park Bandshell",
        date: "This Saturday",
        imageUrl: "https://images.unsplash.com/photo-1520473224395-3f7a83428f64?q=80&w=800",
        source: "AI Fallback",
        price: "Free"
    },
    {
        id: 9002,
        title: "Artisan Food Market",
        category: "Food & Drink",
        description: "Explore local flavors with dozens of artisan food stalls. A perfect spot for foodies to connect.",
        location: "City Square",
        date: "This Weekend",
        imageUrl: "https://images.unsplash.com/photo-1565193569049-983288d447ba?q=80&w=800",
        source: "AI Fallback",
        price: "Varies"
    },
    {
        id: 9003,
        title: "Outdoor Yoga Session",
        category: "Active & Fitness",
        description: "Start your morning with a refreshing outdoor yoga session. All levels welcome. A great way to energize your day.",
        location: "Riverside Park",
        date: "Sunday Morning",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800",
        source: "AI Fallback",
        price: "$10"
    }
];

// Helper function to call the Edge Function
async function callGeminiFunction<T>(functionName: string, params: any): Promise<T> {
    try {
        const { data, error } = await supabase.functions.invoke('gemini-handler', {
            body: { functionName, params }
        });

        if (error) {
            console.error(`Error calling ${functionName}:`, error);
            throw error;
        }

        return data as T;
    } catch (error) {
        console.error(`Error in ${functionName}:`, error);
        throw error;
    }
}

// Note: getCityFromCoords and getNearbyMajorCity are now handled by the client-side geolocation service
// as they don't require the Gemini API

export const getProfileVibe = async (user: User): Promise<string> => {
    try {
        const { vibe } = await callGeminiFunction<{ vibe: string }>('getProfileVibe', { user });
        return vibe || "Fun & Adventurous";
    } catch (error) {
        console.error("Error getting profile vibe:", error);
        return "Fun & Adventurous";
    }
};

export const getRealtimeEvents = async (location: string): Promise<LocalEvent[]> => {
    try {
        const { events } = await callGeminiFunction<{ events: LocalEvent[] }>('getRealtimeEvents', { location });
        return events || MOCK_EVENTS;
    } catch (error) {
        console.error("Error fetching real-time events:", error);
        return MOCK_EVENTS;
    }
};

export const enhanceDateDescription = async (idea: string): Promise<string> => {
    try {
        const { description } = await callGeminiFunction<{ description: string }>('enhanceDateDescription', { idea });
        return description || idea;
    } catch (error) {
        console.error("Error enhancing date description:", error);
        throw new Error("Failed to generate description with AI. Please try again.");
    }
};

export const generateFullDateIdea = async (user: User): Promise<{ title: string; description: string; location: string; }> => {
    try {
        return await callGeminiFunction<{ title: string; description: string; location: string }>('generateFullDateIdea', { user });
    } catch (error) {
        console.error("Error generating full date idea:", error);
        return {
            title: "Romantic Evening",
            description: "A wonderful date idea to connect and have fun together!",
            location: "A cozy location"
        };
    }
};

export const getCompatibilityScore = async (currentUser: User, otherUser: User): Promise<{ score: number; summary: string; }> => {
    // This is now a client-side calculation to reduce API calls
    const sharedInterests = currentUser.interests.filter(interest => 
        otherUser.interests.includes(interest)
    ).length;
    
    const totalInterests = new Set([...currentUser.interests, ...otherUser.interests]).size;
    const score = Math.min(100, Math.max(0, Math.round((sharedInterests / Math.max(1, totalInterests)) * 100)));
    
    const summaries = [
        "You have a lot in common and great potential for a strong connection!",
        "You share some interests and could have a good connection.",
        "You have a few things in common and might hit it off.",
        "You have different interests but that could make for interesting conversations!"
    ];
    
    const summaryIndex = Math.min(
        Math.floor((100 - score) / 25),
        summaries.length - 1
    );
    
    return {
        score,
        summary: summaries[summaryIndex]
    };
};

export const generateDateIdeas = async (user1: User, user2: User): Promise<{ title: string; description: string; location: string; }[]> => {
    try {
        const { ideas } = await callGeminiFunction<{ ideas: { title: string; description: string; location: string; }[] }>('generateDateIdeas', { user1, user2 });
        return ideas || [];
    } catch (error) {
        console.error("Error generating date ideas:", error);
        return [];
    }
};

export const suggestLocations = async (title: string, description: string): Promise<{ name: string; address: string; }[]> => {
    try {
        const { locations } = await callGeminiFunction<{ locations: { name: string; address: string; }[] }>('suggestLocations', { title, description });
        return locations || [];
    } catch (error) {
        console.error("Error suggesting locations:", error);
        return [];
    }
};

export const categorizeDatePost = async (title: string, description: string): Promise<DateCategory[]> => {
    // Simple client-side categorization based on keywords
    const text = `${title} ${description}`.toLowerCase();
    const categories: DateCategory[] = [];
    
    const categoryKeywords: Record<DateCategory, string[]> = {
        'Food & Drink': ['food', 'restaurant', 'coffee', 'dinner', 'lunch', 'brunch', 'bar', 'wine', 'beer', 'cocktail', 'tasting', 'cafe', 'eat', 'drink'],
        'Outdoors & Adventure': ['park', 'hike', 'bike', 'outdoor', 'adventure', 'nature', 'garden', 'beach', 'lake', 'mountain', 'trail', 'camp', 'picnic'],
        'Arts & Culture': ['art', 'museum', 'gallery', 'theater', 'play', 'concert', 'opera', 'ballet', 'exhibit', 'cultural', 'history', 'book', 'reading'],
        'Nightlife': ['night', 'bar', 'club', 'dance', 'party', 'music', 'live music', 'dj', 'cocktail', 'lounge', 'late night'],
        'Relaxing & Casual': ['coffee', 'tea', 'chat', 'talk', 'walk', 'stroll', 'casual', 'relax', 'chill', 'low-key', 'simple', 'easy'],
        'Active & Fitness': ['sport', 'yoga', 'fitness', 'gym', 'run', 'jog', 'swim', 'tennis', 'basketball', 'soccer', 'hike', 'bike', 'workout']
    };
    
    // Count matches for each category
    const categoryScores = Object.entries(categoryKeywords).map(([category, keywords]) => ({
        category: category as DateCategory,
        score: keywords.filter(keyword => text.includes(keyword)).length
    }));
    
    // Sort by score and take top 2 categories with score > 0
    const topCategories = categoryScores
        .filter(cat => cat.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(cat => cat.category);
    
    return topCategories.length > 0 ? topCategories : ['Relaxing & Casual'];
};

export const optimizePhotoOrder = async (photos: string[]): Promise<string[]> => {
    // In a real app, you might want to implement client-side image analysis
    // or use a different approach to optimize photo order
    return photos;
};

export const generateAppBackground = async (prompt: string): Promise<string> => {
    try {
        const { imageUrl } = await callGeminiFunction<{ imageUrl: string }>('generateAppBackground', { prompt });
        return imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop';
    } catch (error) {
        console.error("Error generating app background:", error);
        return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop';
    }
};

export const generateChatReplies = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string[]> => {
    try {
        const { replies } = await callGeminiFunction<{ replies: string[] }>('generateChatReplies', { currentUser, otherUser, messages });
        return replies || [];
    } catch (error) {
        console.error("Error generating chat replies:", error);
        return [];
    }
};

export const getWingmanTip = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string> => {
    // Client-side tips to reduce API calls
    const sharedInterests = currentUser.interests.filter(interest => 
        otherUser.interests.includes(interest)
    );
    
    const tips = [
        "Ask open-ended questions to keep the conversation flowing.",
        "Share a personal story to help your match get to know you better.",
        "Find common interests to bond over.",
        "Be genuine and authentic in your conversations.",
        "Don't be afraid to show your sense of humor.",
        "Listen actively and respond thoughtfully to what your match shares.",
        "Suggest a specific activity for your first date based on your shared interests.",
        "Be positive and keep the conversation light and fun.",
        "Ask about their passions and what excites them.",
        "Share something unique about yourself that's not in your profile."
    ];
    
    // If there are shared interests, prioritize tips about them
    if (sharedInterests.length > 0) {
        const interest = sharedInterests[Math.floor(Math.random() * sharedInterests.length)];
        tips.unshift(
            `You both like ${interest}. Ask them what they enjoy most about it!`,
            `Since you both like ${interest}, you could suggest a related activity for your first date.`
        );
    }
    
    // Return a random tip
    return tips[Math.floor(Math.random() * tips.length)];
};

export const generatePickupLines = async (currentUser: User, otherUser: User): Promise<string[]> => {
    const prompt = `You are a witty and charming dating assistant. Generate 3 unique and creative pickup lines for ${currentUser.name} to use on ${otherUser.name}, based on ${otherUser.name}'s profile. The lines can be funny, cheesy, or clever, but should reference their interests or bio.
    
    Matched Person's Profile:
    Name: ${otherUser.name}
    Bio: "${otherUser.bio}"
    Interests: ${otherUser.interests.join(', ')}
    
    Generate 3 pickup lines.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.9,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lines: {
                            type: Type.ARRAY,
                            description: "A list of three unique pickup lines.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["lines"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        if (!result.lines || result.lines.length === 0) {
            throw new Error("AI failed to generate pickup lines.");
        }
        return result.lines;
    } catch (error) {
        console.error("Error generating pickup lines:", error);
        throw new Error("Failed to generate pickup lines with AI.");
    }
};