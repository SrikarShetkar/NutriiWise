import express from 'express';
import { createMealPlan, getUserMealPlans, getMealPlanById, addMealToPlain, removeMealFromPlan, deleteMealPlan } from '../controllers/mealPlanController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.post('/create', verifyToken, createMealPlan);
router.get('/', verifyToken, getUserMealPlans);
router.get('/:id', verifyToken, getMealPlanById);
router.post('/:mealPlanId/add-meal', verifyToken, addMealToPlain);
router.delete('/:mealPlanId/remove-meal/:itemId', verifyToken, removeMealFromPlan);
router.delete('/:id', verifyToken, deleteMealPlan);

export default router;
