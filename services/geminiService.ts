import { GoogleGenAI, Type } from "@google/genai";
import { User, DateIdea, LocationSuggestion } from '../types';

// Ensure you have your API_KEY in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found in environment variables. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
    Based on their bios and interests, provide a compatibility score from 0 to 100. Also, provide a short, one-sentence summary explaining a key reason for their potential compatibility.`;

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
                        summary: { type: Type.STRING, description: "A short summary of compatibility." }
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