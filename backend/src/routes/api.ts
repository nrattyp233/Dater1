import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fallback from '../services/fallbackService';

const router = Router();
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    aiEnabled: !!genAI,
    message: genAI ? 'AI features are enabled' : 'Running in fallback mode'
  });
});

// Generate date ideas
router.post('/generate-date-ideas', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    
    if (!genAI) {
      console.log('Using fallback date ideas');
      return res.json({ ideas: fallback.generateFallbackDateIdeas(), isFallback: true });
    }

    if (!user1 || !user2) {
      return res.status(400).json({ 
        error: 'Both user1 and user2 are required' 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Generate 3 creative date ideas for ${user1.name} and ${user2.name}. 
    User 1 interests: ${user1.interests?.join(', ') || 'Not specified'}
    User 2 interests: ${user2.interests?.join(', ') || 'Not specified'}
    
    Return as JSON array: [{"title": "...", "description": "...", "locationType": "..."}]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    
    const ideas = JSON.parse(jsonString);
    res.json({ ideas, isFallback: false });
  } catch (error) {
    console.error('Error generating date ideas, using fallback:', error);
    res.json({ 
      ideas: fallback.generateFallbackDateIdeas(), 
      isFallback: true,
      error: 'AI service unavailable, using fallback data'
    });
  }
});

// Get city from coordinates
router.post('/location/city-from-coords', (req, res) => {
  res.json({ 
    city: fallback.getFallbackCity(), 
    isFallback: true 
  });
});

// Get nearby events
router.get('/events', (req, res) => {
  res.json({ 
    events: fallback.getFallbackEvents(), 
    isFallback: true 
  });
});

export default router;
