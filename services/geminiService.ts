import { User, DateIdea, LocationSuggestion, Message, DateCategory, LocalEvent } from '../types';
import { generateDateIdeas as apiGenerateDateIdeas, getCityFromCoords as apiGetCityFromCoords, getNearbyMajorCity as apiGetNearbyMajorCity, getProfileVibe as apiGetProfileVibe, getRealtimeEvents as apiGetRealtimeEvents, enhanceDateDescription as apiEnhanceDateDescription, generateFullDateIdea as apiGenerateFullDateIdea, generateIcebreakers as apiGenerateIcebreakers, getCompatibilityScore as apiGetCompatibilityScore, getProfileFeedback as apiGetProfileFeedback, suggestLocations as apiSuggestLocations, categorizeDatePost as apiCategorizeDatePost, optimizePhotoOrder as apiOptimizePhotoOrder, generateAppBackground as apiGenerateAppBackground, generateChatReplies as apiGenerateChatReplies } from './apiService';

// --- MOCK FALLBACK DATA ---
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

export const getCityFromCoords = async (lat: number, lon: number): Promise<string> => {
    try {
        return await apiGetCityFromCoords(lat, lon);
    } catch (error) {
        console.error('Error getting city from coords:', error);
        throw error;
    }
};

export const getNearbyMajorCity = async (location: string): Promise<string> => {
    try {
        return await apiGetNearbyMajorCity(location);
    } catch (error) {
        console.error('Error getting nearby major city:', error);
        throw error;
    }
};

export const getProfileVibe = async (user: User): Promise<string> => {
    try {
        return await apiGetProfileVibe(user);
    } catch (error) {
        console.error('Error getting profile vibe:', error);
        throw error;
    }
};

export const getRealtimeEvents = async (location: string): Promise<LocalEvent[]> => {
    try {
        return await apiGetRealtimeEvents(location);
    } catch (error) {
        console.error('Error getting real-time events:', error);
        throw error;
    }
};

export const enhanceDateDescription = async (idea: string): Promise<string> => {
    try {
        return await apiEnhanceDateDescription(idea);
    } catch (error) {
        console.error('Error enhancing date description:', error);
        throw error;
    }
};

export const generateFullDateIdea = async (user: User): Promise<{ title: string; description: string; location: string; }> => {
    try {
        return await apiGenerateFullDateIdea(user);
    } catch (error) {
        console.error('Error generating full date idea:', error);
        throw error;
    }
};

export const generateIcebreakers = async (user: User): Promise<string[]> => {
    try {
        return await apiGenerateIcebreakers(user);
    } catch (error) {
        console.error('Error generating icebreakers:', error);
        throw error;
    }
};

export const getCompatibilityScore = async (currentUser: User, otherUser: User): Promise<{ score: number; summary: string; }> => {
    try {
        return await apiGetCompatibilityScore(currentUser, otherUser);
    } catch (error) {
        console.error('Error getting compatibility score:', error);
        throw error;
    }
};

export const getProfileFeedback = async (user: User): Promise<string[]> => {
    try {
        return await apiGetProfileFeedback(user);
    } catch (error) {
        console.error('Error getting profile feedback:', error);
        throw error;
    }
};

export const generateDateIdeas = async (user1: User, user2: User): Promise<DateIdea[]> => {
    try {
        return await apiGenerateDateIdeas(user1, user2);
    } catch (error) {
        console.error('Error generating date ideas:', error);
        throw error;
    }
};

export const suggestLocations = async (title: string, description: string): Promise<LocationSuggestion[]> => {

    const prompt = `Based on this date idea, suggest 3 to 5 specific, real-sounding (but can be fictional) public locations in a major city. Provide a name and a simple address for each.

    Date Title: "${title}"
    Date Description: "${description}"

    Return ONLY the JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        locations: {
                            type: Type.ARRAY,
                            description: "A list of 3-5 location suggestions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The name of the location." },
                                    address: { type: Type.STRING, description: "The address of the location." }
                                },
                                required: ["name", "address"]
                            }
                        }
                    },
                    required: ["locations"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result.locations;
    } catch (error) {
        console.error("Error suggesting locations:", error);
        throw new Error("Failed to suggest locations.");
    }
};

// FIX: Add categorizeDatePost function to categorize date ideas using AI.
export const categorizeDatePost = async (title: string, description: string): Promise<DateCategory[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    const availableCategories: DateCategory[] = ['Food & Drink', 'Outdoors & Adventure', 'Arts & Culture', 'Nightlife', 'Relaxing & Casual', 'Active & Fitness', 'Adult (18+)'];
    const prompt = `Categorize the following date idea into 1 to 3 relevant categories from the provided list.
    Date Idea Title: "${title}"
    Date Idea Description: "${description}"
    Available Categories: ${availableCategories.join(', ')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        categories: {
                            type: Type.ARRAY,
                            description: "An array of 1-3 category strings that best fit the date idea.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ["categories"]
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        const validCategories = result.categories.filter((cat: any) => availableCategories.includes(cat));

        if (!validCategories || validCategories.length === 0) {
            // Fallback category
            return ['Relaxing & Casual'];
        }

        return validCategories;
    } catch (error) {
        console.error("Error categorizing date post:", error);
        // Provide a fallback category on error
        return ['Relaxing & Casual'];
    }
};

// FIX: Add optimizePhotoOrder function to reorder user photos for best impression.
export const optimizePhotoOrder = async (photos: string[]): Promise<string[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    if (photos.length < 2) return photos;

    const imageParts: Part[] = photos.map((photoDataUrl) => {
        const [meta, data] = photoDataUrl.split(',');
        const mimeTypeMatch = meta.match(/:(.*?);/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
        return {
            inlineData: {
                mimeType,
                data
            }
        };
    });

    const prompt = `Analyze these profile photos for a dating app. Reorder them to create the best possible first impression. The first photo should be the strongest. Respond with a JSON object containing a key 'photo_order' which is an array of the original photo indices (0-based) in the optimal new order. For example, if you think the second photo should be first, then the first, then the third, respond with {"photo_order": [1, 0, 2]}. Ensure the array contains each index exactly once.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...imageParts, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        photo_order: {
                            type: Type.ARRAY,
                            description: "An array of numbers representing the new order of photos.",
                            items: {
                                type: Type.NUMBER
                            }
                        }
                    },
                    required: ["photo_order"]
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        const order = result.photo_order as number[];

        // Validate the response from the AI
        if (Array.isArray(order) && order.length === photos.length && order.every(i => i >= 0 && i < photos.length)) {
            const reorderedPhotos = order.map(i => photos[i]);
            // Check for duplicates
            if (new Set(reorderedPhotos).size === photos.length) {
                return reorderedPhotos;
            }
        }
        
        console.warn("AI photo optimization returned invalid order. Returning original order.");
        return photos;
    } catch (error) {
        console.error("Error optimizing photo order:", error);
        // Return original order on error
        return photos;
    }
};

// FIX: Add generateAppBackground to create background images from a prompt.
export const generateAppBackground = async (prompt: string): Promise<string> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Generate an atmospheric, abstract, beautiful background image suitable for a dating app. Style: elegant, modern, subtle. Prompt: "${prompt}"`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16', // Good for mobile backgrounds
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating app background:", error);
        throw new Error("Failed to generate background with AI.");
    }
};

// FIX: Add generateChatReplies function for AI-powered chat suggestions.
export const generateChatReplies = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

    const conversationHistory = messages.map(m => `${m.senderId === currentUser.id ? currentUser.name : otherUser.name}: ${m.text}`).join('\n');

    const prompt = `You are a witty dating assistant. Based on the following user profiles and their conversation history, generate exactly 3 unique and engaging reply suggestions for ${currentUser.name}. Keep them short (1-2 sentences).

    User Profiles:
    - ${currentUser.name} (You): Bio: "${currentUser.bio}", Interests: ${currentUser.interests.join(', ')}
    - ${otherUser.name}: Bio: "${otherUser.bio}", Interests: ${otherUser.interests.join(', ')}

    Conversation History (most recent last):
    ${conversationHistory}
    
    Now, suggest three replies for ${currentUser.name}:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        replies: {
                            type: Type.ARRAY,
                            description: "A list of three unique reply suggestions.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["replies"]
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        if (!result.replies || result.replies.length === 0) {
            throw new Error("AI failed to generate valid replies.");
        }
        return result.replies;
    } catch (error) {
        console.error("Error generating chat replies:", error);
        throw new Error("Failed to generate replies with AI.");
    }
};

// FIX: Add getWingmanTip function to provide AI dating coach advice.
export const getWingmanTip = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    
    const conversationHistory = messages.map(m => `${m.senderId === currentUser.id ? currentUser.name : otherUser.name}: ${m.text}`).join('\n');
    
    const prompt = `You are an AI dating coach ('wingman'). Analyze this chat history and the user profiles. The last message was from ${otherUser.name}. Provide one short, actionable tip for ${currentUser.name} to improve the conversation, ask a good question, or move things forward.
    
    User Profiles:
    - ${currentUser.name} (You): Bio: "${currentUser.bio}", Interests: ${currentUser.interests.join(', ')}
    - ${otherUser.name}: Bio: "${otherUser.bio}", Interests: ${otherUser.interests.join(', ')}

    Conversation History (most recent last):
    ${conversationHistory}
    
    Wingman Tip for ${currentUser.name}:`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 100,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting wingman tip:", error);
        throw new Error("Failed to get wingman tip.");
    }
};

// FIX: Add generatePickupLines for AI-powered conversation starters.
export const generatePickupLines = async (currentUser: User, otherUser: User): Promise<string[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    
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