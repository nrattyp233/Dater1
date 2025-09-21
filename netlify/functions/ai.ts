import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { GoogleGenAI, Type } from '@google/genai';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Gemini API key not configured on server.' }),
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { action, payload } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing action' }),
      };
    }

    switch (action) {
      case 'enhanceDateDescription': {
        const { idea } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are a creative date planner. Take the following simple date idea and turn it into an exciting and descriptive date post of about 50-70 words. Make it sound appealing, romantic, and fun. Do not use hashtags. Date Idea: "${idea}"`,
          config: { temperature: 0.8, topP: 0.9 },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ text: response.text.trim() }),
        };
      }
      case 'generateFullDateIdea': {
        const { user } = payload;
        const prompt = `You are a creative date planner. Based on this user's profile, generate one unique, creative, and appealing date idea that they could post on a dating app. Provide a catchy title, an exciting description (50-70 words), and a general location type (e.g., 'A cozy cafe', 'A scenic park').\n\n    User Profile:\n    Interests: ${user.interests.join(', ')}\n    Bio: "${user.bio}"\n\n    Generate a complete date idea.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.9,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                location: { type: Type.STRING },
              },
              required: ['title', 'description', 'location'],
            },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'generateIcebreakers': {
        const { user } = payload;
        const prompt = `You are a witty and charming dating assistant. A user has matched with another person. Based on the matched person's profile, generate exactly 3 unique, creative, and personalized icebreakers. The icebreakers should be short (1-2 sentences), engaging, and directly reference their interests or bio. Avoid generic compliments like "you're beautiful".\n\n  Matched Person's Profile:\n  Name: ${user.name}\n  Bio: "${user.bio}"\n  Interests: ${user.interests.join(', ')}\n\n  Return ONLY the JSON object.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.9,
            topP: 0.95,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: { icebreakers: { type: Type.ARRAY, items: { type: Type.STRING } } },
              required: ['icebreakers'],
            },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'getCompatibilityScore': {
        const { currentUser, otherUser } = payload;
        const prompt = `Analyze the compatibility between these two user profiles for a romantic relationship. \n    User 1: Name: ${currentUser.name}, Bio: "${currentUser.bio}", Interests: ${currentUser.interests.join(', ')}.\n    User 2: Name: ${otherUser.name}, Bio: "${otherUser.bio}", Interests: ${otherUser.interests.join(', ')}.\n    Provide a compatibility score (0-100) and a short, fun summary (15-25 words).`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.5,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, summary: { type: Type.STRING } },
              required: ['score', 'summary'],
            },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'getProfileFeedback': {
        const { user } = payload;
        const prompt = `You are a friendly and encouraging dating coach. Analyze this user's profile and provide exactly 3 actionable, positive, and constructive tips to improve it. Focus on making the bio more engaging, suggesting photo types, or highlighting interests better.\n    Name: ${user.name}\n    Bio: "${user.bio}"\n    Interests: ${user.interests.join(', ')}\n    Number of photos: ${user.photos.length}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: { tips: { type: Type.ARRAY, items: { type: Type.STRING } } },
              required: ['tips'],
            },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'generateDateIdeas': {
        const { user1, user2 } = payload;
        const prompt = `Generate 3 unique first date ideas with title, location type, and short description based on these interests.\nPerson 1: ${user1.name} – ${user1.interests.join(', ')}\nPerson 2: ${user2.name} – ${user2.interests.join(', ')}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.9,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                ideas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      location: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['title', 'location', 'description'],
                  },
                },
              },
              required: ['ideas'],
            },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'suggestLocations': {
        const { title, description } = payload;
        const prompt = `Based on this date idea, suggest 3 to 5 specific, real-sounding public locations in a major city. Provide a name and a simple address for each.\n\nTitle: "${title}"\nDescription: "${description}"\n\nReturn JSON { locations: [{ name, address }] }.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.8,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                locations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, address: { type: Type.STRING } },
                    required: ['name', 'address'],
                  },
                },
              },
              required: ['locations'],
            },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'generateChatReplies': {
        const { currentUser, otherUser, messages } = payload;
        const conversation = messages.slice(-6).map((m: any) => `${m.senderId === currentUser.id ? currentUser.name : otherUser.name}: ${m.text}`).join('\n');
        const prompt = `You are an AI conversation coach for a dating app. Provide exactly 3 short, engaging replies for ${currentUser.name} to send to ${otherUser.name}.\n\nRecent conversation:\n${conversation}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.9,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: { replies: { type: Type.ARRAY, items: { type: Type.STRING } } },
              required: ['replies'],
            },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'optimizePhotoOrder': {
        const { photos } = payload as { photos: string[] };
        const imageParts = photos.map((dataUrl) => {
          const [header, base64] = dataUrl.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
          return { inlineData: { mimeType, data: base64 } } as any;
        });
        const prompt = `I uploaded ${photos.length} dating photos. Reorder them for best first impression. Return JSON { newOrder: [indices] }.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }, ...imageParts] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: { type: Type.OBJECT, properties: { newOrder: { type: Type.ARRAY, items: { type: Type.NUMBER } } }, required: ['newOrder'] },
          },
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(JSON.parse(response.text.trim())),
        };
      }
      case 'generateAppBackground': {
        const { prompt } = payload;
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt,
          config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '9:16' },
        });
        const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) {
          return {
            statusCode: 502,
            headers,
            body: JSON.stringify({ error: 'No image returned from model' }),
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ dataUrl: `data:image/png;base64,${base64ImageBytes}` }),
        };
      }
      case 'categorizeDatePost': {
        const { title, description } = payload;
        const available = ['Food & Drink', 'Outdoors & Adventure', 'Arts & Culture', 'Nightlife', 'Relaxing & Casual', 'Active & Fitness', 'Adult (18+)'];
        const prompt = `Analyze the date idea and assign up to two categories from: [${available.join(', ')}]. If explicit or suggestive, include "Adult (18+)".\nTitle: "${title}"\nDescription: "${description}"\nReturn JSON { categories: string[] }.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: { type: Type.OBJECT, properties: { categories: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['categories'] },
          },
        });
        const result = JSON.parse(response.text.trim());
        result.categories = (result.categories || []).filter((c: string) => available.includes(c));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }
      case 'getProfileVibe': {
        const { user } = payload;
        const prompt = `Based on this user's profile, generate a short, snappy 'vibe' (10-15 words) that summarizes their personality. No hashtags.\nBio: "${user.bio}"\nInterests: ${user.interests.join(', ')}`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { temperature: 0.8, topP: 0.9 } });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ text: response.text.trim().replace(/^"|"$/g, '') }),
        };
      }
      case 'getWingmanTip': {
        const { currentUser, otherUser, messages } = payload;
        const conversation = messages.slice(-8).map((m: any) => `${m.senderId === currentUser.id ? 'Me' : otherUser.name}: ${m.text}`).join('\n');
        const prompt = `You are an AI wingman. Provide one short, actionable tip (<15 words) for ${currentUser.name} based on this chat with ${otherUser.name}.\n\n${conversation}`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { temperature: 0.9, topP: 0.95, thinkingConfig: { thinkingBudget: 0 } as any } });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ text: response.text.trim() }),
        };
      }
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` }),
        };
    }
  } catch (err: any) {
    console.error('AI API error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err?.message || 'Server error' }),
    };
  }
};