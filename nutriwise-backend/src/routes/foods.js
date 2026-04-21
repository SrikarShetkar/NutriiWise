import express from 'express';
import { getAllFoods, getFoodById, searchFoods, getFoodsByCategory, getCategories, getFoodNutrition } from '../controllers/foodsController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllFoods);
router.get('/categories', getCategories);
router.get('/search', searchFoods);
router.get('/category/:category', getFoodsByCategory);
router.get('/nutrition/:id', verifyToken, getFoodNutrition);
router.get('/:id', getFoodById);

export default router;
