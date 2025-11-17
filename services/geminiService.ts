import { GoogleGenAI, Type, Part } from "@google/genai";
import { User, DateIdea, LocationSuggestion, Message, DateCategory, LocalEvent } from '../types';

// Ensure you have your API_KEY in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found in environment variables. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
        sourceUrl: "https://example.com/event/sunset-jazz",
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
        sourceUrl: "https://example.com/event/artisan-market",
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
        sourceUrl: "https://example.com/event/outdoor-yoga",
        price: "$10"
    }
];


export const getCityFromCoords = async (lat: number, lon: number): Promise<string> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    const prompt = `Based on these coordinates, what is the city and state? Latitude: ${lat}, Longitude: ${lon}. Respond with only the "City, ST" format (e.g., "San Francisco, CA").`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting city from coords:", error);
        throw new Error("Failed to determine city from coordinates.");
    }
};

export const getNearbyMajorCity = async (location: string): Promise<string> => {
    if (!API_KEY) return location;
    const prompt = `What is the closest major metropolitan city to "${location}" that would have a lot of events and activities? Respond with only the "City, ST" format (e.g., "Denver, CO").`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting nearby major city:", error);
        return location;
    }
};

export const getProfileVibe = async (user: User): Promise<string> => {
    if (!API_KEY) return "Fun & Adventurous";
    const prompt = `Describe the overall "vibe" of this person in 2-4 words based on their bio and interests. For example: "Creative & Adventurous" or "Cozy bookworm". Bio: "${user.bio}", Interests: ${user.interests.join(', ')}.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { temperature: 0.7 }
        });
        let vibe = response.text.trim();
        // Remove potential quotes
        if (vibe.startsWith('"') && vibe.endsWith('"')) {
            vibe = vibe.substring(1, vibe.length - 1);
        }
        return vibe;
    } catch (error) {
        console.error("Error getting profile vibe:", error);
        return "Fun & Adventurous";
    }
};


export const getRealtimeEvents = async (location: string): Promise<LocalEvent[]> => {
    if (!API_KEY) return MOCK_EVENTS;

    const availableCategories: DateCategory[] = ['Food & Drink', 'Outdoors & Adventure', 'Arts & Culture', 'Nightlife', 'Relaxing & Casual', 'Active & Fitness'];
    // FIX: Updated prompt to be highly specific about finding current, upcoming events to prevent outdated results.
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `It is currently ${currentDate}. Find 15 actual, verifiable, and **currently upcoming** local events in "${location}" suitable for a date. The events **must** be happening in the near future (e.g., this week, next weekend, within the next month). **Do not include events from the past.** Include events like concerts, festivals, workshops, or unique community gatherings. For each event, provide a catchy title, the specific venue or location, a short exciting description of 20-30 words, a plausible and relevant image URL from a service like Unsplash, the event date as a friendly string (e.g., 'This Friday', 'October 26th'), a valid source URL linking to the event page for more details, and one of the following categories: ${availableCategories.join(', ')}.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        events: {
                            type: Type.ARRAY,
                            description: "An array of 15 event objects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "A catchy title for the event." },
                                    location: { type: Type.STRING, description: "The venue or general location." },
                                    description: { type: Type.STRING, description: "A short exciting description of 20-30 words." },
                                    category: { type: Type.STRING, description: `One of: ${availableCategories.join(', ')}` },
                                    imageUrl: { type: Type.STRING, description: "A plausible image URL from a service like Unsplash." },
                                    date: { type: Type.STRING, description: "A friendly date string, like 'This Friday' or 'Next Weekend'." },
                                    sourceUrl: { type: Type.STRING, description: "A valid URL to the event's source page." }
                                },
                                required: ["title", "location", "description", "category", "imageUrl", "date", "sourceUrl"]
                            }
                        }
                    },
                    required: ["events"]
                }
            }
        });

        const result = JSON.parse(response.text.trim());

        if (!result.events) {
            return MOCK_EVENTS;
        }

        return result.events.map((event: any, index: number) => ({
            id: Date.now() + index,
            title: event.title,
            category: availableCategories.includes(event.category) ? event.category : 'Relaxing & Casual',
            description: event.description,
            location: event.location,
            date: event.date,
            imageUrl: event.imageUrl,
            sourceUrl: event.sourceUrl,
            price: "Varies"
        }));
        
    } catch (error) {
        console.error("Error fetching real-time events:", error, "Raw response:", (error as any).response?.text);
        return MOCK_EVENTS;
    }
};


export const enhanceDateDescription = async (idea: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API key not configured.");
  }
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a creative date planner. Take the following simple date idea and turn it into an exciting and descriptive date post of about 50-70 words. Make it sound appealing, romantic, and fun. Do not use hashtags. Date Idea: "${idea}"`,
        config: {
            temperature: 0.8,
            topP: 0.9,
        }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing date description:", error);
    // Rethrow a more user-friendly error to be caught by the calling component
    throw new Error("Failed to generate description with AI. Please try again.");
  }
};

export const generateFullDateIdea = async (user: User): Promise<{ title: string; description: string; location: string; }> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

    const prompt = `You are a creative date planner. Based on this user's profile, generate one unique, creative, and appealing date idea that they could post on a dating app. Provide a catchy title, an exciting description (50-70 words), and a general location type (e.g., 'A cozy cafe', 'A scenic park').

    User Profile:
    Interests: ${user.interests.join(', ')}
    Bio: "${user.bio}"

    Generate a complete date idea.`;

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
                        title: { type: Type.STRING, description: "A catchy title for the date." },
                        description: { type: Type.STRING, description: "An exciting and appealing description of the date." },
                        location: { type: Type.STRING, description: "A general type of location for the date." }
                    },
                    required: ["title", "description", "location"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating full date idea:", error);
        throw new Error("Failed to generate a date idea with AI.");
    }
};

export const generateIcebreakers = async (user: User): Promise<string[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API key not configured.");
  }

  const prompt = `You are a witty and charming dating assistant. A user has matched with another person. Based on the matched person's profile, generate exactly 3 unique, creative, and personalized icebreakers. The icebreakers should be short (1-2 sentences), engaging, and directly reference their interests or bio. Avoid generic compliments like "you're beautiful".

  Matched Person's Profile:
  Name: ${user.name}
  Bio: "${user.bio}"
  Interests: ${user.interests.join(', ')}

  Return ONLY the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icebreakers: {
              type: Type.ARRAY,
              description: "A list of three unique icebreaker messages.",
              items: {
                type: Type.STRING,
              }
            }
          },
          required: ["icebreakers"]
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (!result.icebreakers || result.icebreakers.length === 0) {
        throw new Error("AI failed to generate valid icebreakers.");
    }

    return result.icebreakers;
  } catch (error) {
    console.error("Error generating icebreakers:", error);
    throw new Error("Failed to generate icebreakers with AI. Please try again.");
  }
};

export const getCompatibilityScore = async (currentUser: User, otherUser: User): Promise<{ score: number; summary: string; }> => {
    const MOCK_SCORE = {
        score: 78,
        summary: 'You both seem to have a creative side and a love for the outdoors. Could be a great match!'
    };
    if (!API_KEY) return MOCK_SCORE;
    
    const prompt = `Analyze the compatibility between these two user profiles for a romantic relationship. 
    User 1: Name: ${currentUser.name}, Bio: "${currentUser.bio}", Interests: ${currentUser.interests.join(', ')}.
    User 2: Name: ${otherUser.name}, Bio: "${otherUser.bio}", Interests: ${otherUser.interests.join(', ')}.
    Based on their bios and interests, provide a compatibility score from 0 to 100. Also, provide a short, fun, "vibe check" summary (around 15-25 words) of their potential dynamic. For example: "You both love adventure and spicy food—your dates could be epic! But Carlos is an early bird and you're a night owl, so you might have to compromise on that morning hike."`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "A compatibility score from 0 to 100." },
                        summary: { type: Type.STRING, description: "A short, fun, 'vibe check' summary of compatibility." }
                    },
                    required: ["score", "summary"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting compatibility score:", error);
        return MOCK_SCORE;
    }
};

export const getProfileFeedback = async (user: User): Promise<string[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

    const prompt = `You are a friendly and encouraging dating coach. Analyze this user's profile and provide exactly 3 actionable, positive, and constructive tips to improve it. Focus on making the bio more engaging, suggesting photo types, or highlighting interests better.
    User Profile:
    Name: ${user.name}
    Bio: "${user.bio}"
    Interests: ${user.interests.join(', ')}
    Number of photos: ${user.photos.length}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tips: {
                            type: Type.ARRAY,
                            description: "A list of three actionable profile improvement tips.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["tips"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result.tips;
    } catch (error) {
        console.error("Error getting profile feedback:", error);
        throw new Error("Failed to get profile feedback.");
    }
};

export const generateDateIdeas = async (user1: User, user2: User): Promise<DateIdea[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

    const prompt = `You are a creative and thoughtful date planner. Based on the shared and individual interests of these two people, generate 3 unique and fun first date ideas. For each idea, provide a catchy title, a suggested type of location (not a specific address), and a short, exciting description.
    Person 1: Name: ${user1.name}, Interests: ${user1.interests.join(', ')}
    Person 2: Name: ${user2.name}, Interests: ${user2.interests.join(', ')}
    `;

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
                        ideas: {
                            type: Type.ARRAY,
                            description: "A list of three date ideas.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ["title", "location", "description"]
                            }
                        }
                    },
                    required: ["ideas"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result.ideas;
    } catch (error) {
        console.error("Error generating date ideas:", error);
        throw new Error("Failed to generate date ideas.");
    }
};

export const suggestLocations = async (title: string, description: string): Promise<LocationSuggestion[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

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