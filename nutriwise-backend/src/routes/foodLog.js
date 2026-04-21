import express from 'express';
import { logFood, getFoodLog, getDailyNutrition, deleteFoodLog, getNutritionTrends } from '../controllers/foodLogController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.post('/log', verifyToken, logFood);
router.get('/', verifyToken, getFoodLog);
router.get('/daily-nutrition', verifyToken, getDailyNutrition);
router.get('/trends', verifyToken, getNutritionTrends);
router.delete('/:logId', verifyToken, deleteFoodLog);

export default router;
