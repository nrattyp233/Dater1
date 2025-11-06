import { GoogleGenAI, Type } from "@google/genai";
import { User, DateIdea, LocationSuggestion, Message, DateCategory, LocalEvent } from '../types';

// Ensure you have your API_KEY in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found in environment variables. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    const prompt = `What is the closest major metropolitan city to "${location}" that would have a lot of events and activities? Respond with only the "City, ST" format (e.g., "Denver, CO").`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting nearby major city:", error);
        throw new Error("Failed to determine nearby major city.");
    }
};

export const getProfileVibe = async (user: User): Promise<string> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
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
        throw new Error("Failed to get profile vibe.");
    }
};


export const getRealtimeEvents = async (location: string): Promise<LocalEvent[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

    const availableCategories: DateCategory[] = ['Food & Drink', 'Outdoors & Adventure', 'Arts & Culture', 'Nightlife', 'Relaxing & Casual', 'Active & Fitness'];
    const prompt = `Find 5 real, upcoming local events in "${location}". Focus on events suitable for a date, like concerts, festivals, workshops, markets, or unique community gatherings.
Respond with ONLY a valid JSON object. The JSON object must have a single key "events", which is an array of 5 event objects.
Each event object must have the following keys:
- "title": a catchy title for the event (string).
- "location": the venue or general location (string).
- "description": a short exciting description of 20-30 words (string).
- "category": one of the following strings: [${availableCategories.join(', ')}] (string).
- "imageUrl": a plausible but not necessarily real image URL from a service like Unsplash (string).
- "date": a friendly date string, like 'This Friday' or 'Next Weekend' (string).

Do not include markdown formatting like \`\`\`json. Your response must be raw JSON text.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        // FIX: The AI can sometimes wrap the response in markdown, so we need to clean it before parsing.
        let jsonString = response.text.trim();
        if (jsonString.startsWith("```json")) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        } else if (jsonString.startsWith("```")) {
            jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        }

        const result = JSON.parse(jsonString);

        if (!result.events) {
            return [];
        }

        // We need to map the result to our LocalEvent type
        return result.events.map((event: any, index: number) => ({
            id: Date.now() + index, // Create a temporary unique ID
            title: event.title,
            category: availableCategories.includes(event.category) ? event.category : 'Relaxing & Casual',
            description: event.description,
            location: event.location,
            date: event.date, // Gemini will provide a string like "This weekend"
            imageUrl: event.imageUrl,
            source: "AI-Powered Search",
            price: "Varies"
        }));
        
    } catch (error) {
        console.error("Error fetching real-time events:", error, "Raw response:", (error as any).response?.text);
        throw new Error("Failed to find local events with AI. Please try a different location.");
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
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    
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
        throw new Error("Failed to analyze compatibility.");
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
        throw new Error("Failed to suggest locations with AI.");
    }
};

export const generateChatReplies = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    
    const conversationHistory = messages.slice(-6).map(m => {
        const speaker = m.senderId === currentUser.id ? currentUser.name : otherUser.name;
        return `${speaker}: ${m.text}`;
    }).join('\n');

    const prompt = `You are an AI conversation coach for a dating app. User "${currentUser.name}" is talking to "${otherUser.name}". 
    
    Their profile info:
    - ${currentUser.name} (me): Bio: "${currentUser.bio}", Interests: ${currentUser.interests.join(', ')}
    - ${otherUser.name}: Bio: "${otherUser.bio}", Interests: ${otherUser.interests.join(', ')}
    
    Recent conversation history:
    ${conversationHistory}
    
    Based on the context, generate exactly 3 short, engaging, and creative replies for ${currentUser.name} to send. The replies should encourage more conversation. Do not just repeat things from the bio.`;
    
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
                        replies: {
                            type: Type.ARRAY,
                            description: "A list of three unique chat reply suggestions.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["replies"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result.replies;
    } catch (error) {
        console.error("Error generating chat replies:", error);
        throw new Error("Failed to generate replies with AI.");
    }
};

export const generatePickupLines = async (currentUser: User, otherUser: User): Promise<string[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    
    const prompt = `You are a witty and charming dating assistant. User "${currentUser.name}" wants to send a pickup line to "${otherUser.name}". 
    
    Their profile info:
    - ${otherUser.name}'s Bio: "${otherUser.bio}"
    - ${otherUser.name}'s Interests: ${otherUser.interests.join(', ')}
    
    Based on ${otherUser.name}'s profile, generate exactly 3 creative, witty, and charming pickup lines for ${currentUser.name} to send. The lines should be fun, respectful, and not overly cheesy. They must reference something specific from their profile.`;
    
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
                        pickupLines: {
                            type: Type.ARRAY,
                            description: "A list of three unique pickup lines.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["pickupLines"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result.pickupLines;
    } catch (error) {
        console.error("Error generating pickup lines:", error);
        throw new Error("Failed to generate pickup lines with AI.");
    }
};

export const optimizePhotoOrder = async (photos: string[]): Promise<string[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    
    const imageParts = photos.map(photoDataUrl => {
        const [header, base64Data] = photoDataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        return {
            inlineData: {
                mimeType,
                data: base64Data
            }
        };
    });

    const prompt = `You are a dating profile expert. I have uploaded ${photos.length} photos for a dating profile. Analyze them based on factors like clear face visibility, lighting, variety (headshot, full body, activity), and overall engagement potential. Your task is to reorder them to create the best possible first impression. The first photo should be the strongest.

    Return a JSON object with the new order of indices. For example, if the best order is the 3rd photo, then the 1st, then the 2nd (from the original order), you should return: { "newOrder": [2, 0, 1] }.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }, ...imageParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        newOrder: {
                            type: Type.ARRAY,
                            description: "An array of indices representing the new optimal photo order.",
                            items: { type: Type.NUMBER }
                        }
                    },
                    required: ["newOrder"]
                }
            }
        });
        
        const result = JSON.parse(response.text.trim());
        const newOrder: number[] = result.newOrder;

        if (!newOrder || newOrder.length !== photos.length) {
            throw new Error("AI returned an invalid photo order.");
        }

        const reorderedPhotos = newOrder.map(index => photos[index]);
        return reorderedPhotos;

    } catch (error) {
        console.error("Error optimizing photo order:", error);
        throw new Error("Failed to optimize photos with AI.");
    }
};

export const generateAppBackground = async (prompt: string): Promise<string> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '9:16', // Tall aspect ratio for mobile
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("AI did not return an image.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating app background:", error);
        throw new Error("Failed to generate background with AI.");
    }
};

export const categorizeDatePost = async (title: string, description: string): Promise<DateCategory[]> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");

    const availableCategories: DateCategory[] = ['Food & Drink', 'Outdoors & Adventure', 'Arts & Culture', 'Nightlife', 'Relaxing & Casual', 'Active & Fitness', 'Adult (18+)'];
    
    const prompt = `Analyze the following date idea and assign it up to two relevant categories from this list: [${availableCategories.join(', ')}].

Date Title: "${title}"
Date Description: "${description}"

Respond with a JSON object containing a single key "categories" which is an array of the chosen category strings.`;

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
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["categories"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        // Validate that the returned categories are from our allowed list
        return result.categories.filter((c: any) => availableCategories.includes(c));
    } catch (error) {
        console.error("Error categorizing date post:", error);
        throw new Error("Failed to categorize date with AI.");
    }
};

export const getWingmanTip = async (currentUser: User, otherUser: User, messages: Message[]): Promise<string> => {
    if (!API_KEY) throw new Error("Gemini API key not configured.");
    
    const conversationHistory = messages.slice(-4).map(m => {
        const speaker = m.senderId === currentUser.id ? "Me" : otherUser.name;
        return `${speaker}: ${m.text}`;
    }).join('\n');

    const prompt = `I am an AI Wingman. My user, ${currentUser.name}, is talking to ${otherUser.name}.
    
    Here's their recent chat:
    ${conversationHistory}
    
    Based on the last message from ${otherUser.name}, give me ONE short, actionable tip. Should I ask a question, share something about myself, or suggest a date? Be specific and encouraging. For example: "She mentioned hiking! Ask her about her favorite trail." or "Good vibe here. Time to suggest grabbing that coffee you both like."`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { temperature: 0.8 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting wingman tip:", error);
        throw new Error("Wingman is unavailable right now.");
    }
};