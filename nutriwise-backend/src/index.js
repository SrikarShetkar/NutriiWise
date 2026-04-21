import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import foodsRoutes from './routes/foods.js';
import mealPlansRoutes from './routes/mealPlans.js';
import foodLogRoutes from './routes/foodLog.js';
import savedFoodsRoutes from './routes/savedFoods.js';
import { getDashboardData, getWeeklyStats, getHealthMetrics } from './controllers/dashboardController.js';
import verifyToken from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
    credentials: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/foods', foodsRoutes);
app.use('/api/meal-plans', mealPlansRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/saved-foods', savedFoodsRoutes);

// Dashboard routes
app.get('/api/dashboard', verifyToken, getDashboardData);
app.get('/api/dashboard/weekly-stats', verifyToken, getWeeklyStats);
app.get('/api/dashboard/health-metrics', verifyToken, getHealthMetrics);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'NutriWise Backend is running', timestamp: new Date() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`NutriWise Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
