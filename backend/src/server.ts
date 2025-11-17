import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI Features: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled (No API Key)'}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
