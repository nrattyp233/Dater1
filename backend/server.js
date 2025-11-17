require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dater1 API is running' });
});

// Generate date ideas endpoint
app.post('/api/generate-date-ideas', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    
    if (!user1 || !user2) {
      return res.status(400).json({ error: 'Both user1 and user2 are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a creative date planner. Based on these two users' profiles, generate 3 unique and fun date ideas. 
    For each idea, provide a title, description, and suggested location type.
    
    User 1: ${user1.name}
    Bio: ${user1.bio}
    Interests: ${user1.interests.join(', ')}
    
    User 2: ${user2.name}
    Bio: ${user2.bio}
    Interests: ${user2.interests.join(', ')}
    
    Format the response as a JSON array of objects with the following structure:
    [
      {
        "title": "Date idea title",
        "description": "Detailed description of the date idea",
        "locationType": "Type of location (e.g., 'cozy cafe', 'scenic park')"
      },
      ...
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response text
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const ideas = JSON.parse(jsonMatch[0]);
    res.json(ideas);
  } catch (error) {
    console.error('Error generating date ideas:', error);
    res.status(500).json({ 
      error: 'Failed to generate date ideas',
      details: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
