import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.1';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { functionName, params } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable not set');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Route to the appropriate handler function based on functionName
    switch (functionName) {
      case 'getProfileVibe':
        return handleProfileVibe(genAI, params);
      case 'getRealtimeEvents':
        return handleRealtimeEvents(genAI, params);
      case 'enhanceDateDescription':
        return handleEnhanceDateDescription(genAI, params);
      case 'generateFullDateIdea':
        return handleGenerateFullDateIdea(genAI, params);
      case 'optimizePhotoOrder':
        return handleOptimizePhotoOrder(genAI, params);
      case 'generateAppBackground':
        return handleGenerateAppBackground(genAI, params);
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    console.error('Error in gemini-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

// Handler functions for each Gemini API endpoint
async function handleProfileVibe(genAI: GoogleGenerativeAI, { user }: { user: any }) {
  const prompt = `Describe the overall "vibe" of this person in 2-4 words based on their bio and interests. For example: "Creative & Adventurous" or "Cozy bookworm". Bio: "${user.bio}", Interests: ${user.interests?.join(', ') || 'None'}.`;
  
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let vibe = response.text().trim();
  
  // Remove potential quotes
  if (vibe.startsWith('"') && vibe.endsWith('"')) {
    vibe = vibe.substring(1, vibe.length - 1);
  }
  
  return new Response(
    JSON.stringify({ vibe }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
}

async function handleRealtimeEvents(genAI: GoogleGenerativeAI, { location }: { location: string }) {
  const availableCategories = ['Food & Drink', 'Outdoors & Adventure', 'Arts & Culture', 'Nightlife', 'Relaxing & Casual', 'Active & Fitness'];
  
  const prompt = `Find 5 realistic-sounding, upcoming local events in "${location}". Focus on events suitable for a date, like concerts, festivals, workshops, markets, or unique community gatherings.`;
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
  
  const result = await model.generateContent([
    { role: 'user', parts: [{ text: prompt }] },
    { 
      role: 'model', 
      parts: [{
        text: `{
          "events": [
            {
              "title": "Jazz in the Park",
              "location": "Central Park Bandshell",
              "description": "Enjoy a relaxing evening with live jazz music as the sun sets. Bring a blanket and a friend!",
              "category": "Arts & Culture",
              "imageUrl": "https://images.unsplash.com/photo-1520473224395-3f7a83428f64?q=80&w=800",
              "date": "This Saturday"
            }
          ]
        }`
      }]
    },
    { role: 'user', parts: [{ text: 'Now generate 5 events in the same format for the location I provided.' }] }
  ]);
  
  const response = await result.response;
  const text = response.text().trim();
  
  // Parse the response and handle potential formatting issues
  let events;
  try {
    // Try to parse as JSON directly
    events = JSON.parse(text);
  } catch (e) {
    // If direct parse fails, try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      events = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Could not parse Gemini response as JSON');
    }
  }
  
  // Transform the response to match the expected format
  const formattedEvents = (events.events || []).map((event: any, index: number) => ({
    id: Date.now() + index,
    title: event.title,
    category: availableCategories.includes(event.category) ? event.category : 'Relaxing & Casual',
    description: event.description,
    location: event.location,
    date: event.date,
    imageUrl: event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800',
    source: 'AI-Powered Search',
    price: 'Varies'
  }));
  
  return new Response(
    JSON.stringify({ events: formattedEvents }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
}

async function handleEnhanceDateDescription(genAI: GoogleGenerativeAI, { idea }: { idea: string }) {
  const prompt = `You are a creative date planner. Take the following simple date idea and turn it into an exciting and descriptive date post of about 50-70 words. Make it sound appealing, romantic, and fun. Do not use hashtags. Date Idea: "${idea}"`;
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
    },
  });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const description = response.text().trim();
  
  return new Response(
    JSON.stringify({ description }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
}

async function handleGenerateFullDateIdea(genAI: GoogleGenerativeAI, { user }: { user: any }) {
  const prompt = `You are a creative date planner. Based on this user's profile, generate one unique, creative, and appealing date idea that they could post on a dating app. Provide a catchy title, an exciting description (50-70 words), and a general location type (e.g., 'A cozy cafe', 'A scenic park').

  User Profile:
  Interests: ${user.interests?.join(', ') || 'Not specified'}
  Bio: "${user.bio || 'No bio provided'}"`;
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
    },
  });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().trim();
  
  // Parse the response to extract title, description, and location
  const titleMatch = text.match(/Title: ([^\n]+)/i) || [];
  const descMatch = text.match(/Description: ([\s\S]+?)(?=Location:|$)/i) || [];
  const locMatch = text.match(/Location: ([^\n]+)/i) || [];
  
  return new Response(
    JSON.stringify({
      title: titleMatch[1]?.trim() || 'Romantic Evening',
      description: descMatch[1]?.trim() || 'A wonderful date idea to connect and have fun together!',
      location: locMatch[1]?.trim() || 'A cozy location',
    }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
}

async function handleOptimizePhotoOrder(genAI: GoogleGenerativeAI, { photos }: { photos: string[] }) {
  if (photos.length < 2) {
    return new Response(
      JSON.stringify({ photos }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
  
  const prompt = `You are a dating profile photo expert. I'll provide you with ${photos.length} photo URLs. Please analyze them and return a reordered array (as JSON) that would make the best first impression on a dating app. Focus on variety, quality, and showing different aspects of a person's life.`;
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro-vision',
    generationConfig: {
      temperature: 0.3,
    },
  });
  
  // For each photo, create a part with the image data
  const imageParts = await Promise.all(photos.map(async (url) => {
    try {
      const response = await fetch(url);
      const imageData = await response.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(imageData)));
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      return {
        inlineData: {
          data: `data:${mimeType};base64,${base64Data}`,
          mimeType,
        }
      };
    } catch (error) {
      console.error(`Error processing image ${url}:`, error);
      return null;
    }
  }));
  
  // Filter out any failed image loads
  const validImageParts = imageParts.filter(Boolean);
  
  if (validImageParts.length === 0) {
    return new Response(
      JSON.stringify({ photos }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
  
  const result = await model.generateContent([prompt, ...validImageParts]);
  const response = await result.response;
  const text = response.text().trim();
  
  // Try to parse the response as JSON array of indices
  try {
    // Try to extract JSON array from the response
    const jsonMatch = text.match(/\[\s*\d[\s\d,]*\]/);
    const indices = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    if (Array.isArray(indices) && indices.length === photos.length) {
      // If we got a valid array of indices, reorder the photos
      const reorderedPhotos = indices.map((index: number) => photos[index]);
      return new Response(
        JSON.stringify({ photos: reorderedPhotos }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error parsing photo order response:', error);
  }
  
  // If we couldn't parse the response, return the original order
  return new Response(
    JSON.stringify({ photos }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
}

async function handleGenerateAppBackground(genAI: GoogleGenerativeAI, { prompt }: { prompt: string }) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro-vision',
    generationConfig: {
      temperature: 0.8,
    },
  });
  
  const enhancedPrompt = `Create a beautiful, high-quality background image for a dating app. The image should be abstract, romantic, and visually appealing. Use a color scheme that works well with dark mode. The theme is: ${prompt}. The image should be suitable for a mobile app background.`;
  
  const result = await model.generateContent([
    { text: enhancedPrompt },
    { text: 'Generate a beautiful, abstract background image based on the theme above.' },
  ]);
  
  const response = await result.response;
  const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!imageData) {
    throw new Error('Failed to generate image');
  }
  
  return new Response(
    JSON.stringify({ imageUrl: imageData }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    }
  );
}
