import express from 'express';
import { saveFoodsToFavorites, getUserSavedFoods, removeSavedFood, isFoodSaved } from '../controllers/savedFoodsController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.post('/save', verifyToken, saveFoodsToFavorites);
router.get('/', verifyToken, getUserSavedFoods);
router.delete('/:foodId', verifyToken, removeSavedFood);
router.get('/check/:foodId', verifyToken, isFoodSaved);

export default router;
