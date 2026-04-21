import express from 'express';
import { register, login, logout } from './controllers/authController.js';
import { getUserProfile, createOrUpdateProfile, calculateBMI, deleteProfile } from './controllers/profileController.js';
import { getAllFoods, getFoodById, searchFoods, getFoodsByCategory, getCategories, getFoodNutrition } from './controllers/foodsController.js';
import { createMealPlan, getUserMealPlans, getMealPlanById, addMealToPlain, removeMealFromPlan, deleteMealPlan } from './controllers/mealPlanController.js';
import { logFood, getFoodLog, getDailyNutrition, deleteFoodLog, getNutritionTrends } from './controllers/foodLogController.js';
import { saveFoodsToFavorites, getUserSavedFoods, removeSavedFood, isFoodSaved } from './controllers/savedFoodsController.js';
import { getDashboardData, getWeeklyStats, getHealthMetrics } from './controllers/dashboardController.js';
import verifyToken from './middleware/auth.js';
import { validateRegistration, validateProfile } from './middleware/validate.js';
import errorHandler from './middleware/errorHandler.js';
import cors from 'cors';
import dotenv from 'dotenv';

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
app.use('/api/auth', express.Router()
  .post('/register', validateRegistration, register)
  .post('/login', login)
  .post('/logout', logout)
);

app.use('/api/profile', express.Router()
  .get('/me', verifyToken, getUserProfile)
  .post('/create', verifyToken, validateProfile, createOrUpdateProfile)
  .put('/update', verifyToken, createOrUpdateProfile)
  .post('/calculate-bmi', verifyToken, calculateBMI)
  .delete('/delete', verifyToken, deleteProfile)
);

app.use('/api/foods', express.Router()
  .get('/', getAllFoods)
  .get('/categories', getCategories)
  .get('/search', searchFoods)
  .get('/category/:category', getFoodsByCategory)
  .get('/nutrition/:id', verifyToken, getFoodNutrition)
  .get('/:id', getFoodById)
);

app.use('/api/meal-plans', express.Router()
  .post('/create', verifyToken, createMealPlan)
  .get('/', verifyToken, getUserMealPlans)
  .get('/:id', verifyToken, getMealPlanById)
  .post('/:mealPlanId/add-meal', verifyToken, addMealToPlain)
  .delete('/:mealPlanId/remove-meal/:itemId', verifyToken, removeMealFromPlan)
  .delete('/:id', verifyToken, deleteMealPlan)
);

app.use('/api/food-logs', express.Router()
  .post('/log', verifyToken, logFood)
  .get('/', verifyToken, getFoodLog)
  .get('/daily-nutrition', verifyToken, getDailyNutrition)
  .get('/trends', verifyToken, getNutritionTrends)
  .delete('/:logId', verifyToken, deleteFoodLog)
);

app.use('/api/saved-foods', express.Router()
  .post('/save', verifyToken, saveFoodsToFavorites)
  .get('/', verifyToken, getUserSavedFoods)
  .delete('/:foodId', verifyToken, removeSavedFood)
  .get('/check/:foodId', verifyToken, isFoodSaved)
);

// Dashboard routes
app.get('/api/dashboard', verifyToken, getDashboardData);
app.get('/api/dashboard/weekly-stats', verifyToken, getWeeklyStats);
app.get('/api/dashboard/health-metrics', verifyToken, getHealthMetrics);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NutriWise API',
    version: '1.0.0',
    description: 'Student Nutrition & Meal Planning API',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      foods: '/api/foods',
      'meal-plans': '/api/meal-plans',
      'food-logs': '/api/food-logs',
      'saved-foods': '/api/saved-foods',
      dashboard: '/api/dashboard',
      health: '/api/health'
    },
    docs: 'API documentation available at /api/health'
  });
});

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
