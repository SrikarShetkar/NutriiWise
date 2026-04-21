import express from 'express';
import { getUserProfile, createOrUpdateProfile, calculateBMI, deleteProfile } from '../controllers/profileController.js';
import verifyToken from '../middleware/auth.js';
import { validateProfile } from '../middleware/validate.js';

const router = express.Router();

router.get('/me', verifyToken, getUserProfile);
router.post('/create', verifyToken, validateProfile, createOrUpdateProfile);
router.put('/update', verifyToken, createOrUpdateProfile);
router.post('/calculate-bmi', verifyToken, calculateBMI);
router.delete('/delete', verifyToken, deleteProfile);

export default router;
