import express from 'express';
import { getProfile, updateProfile, deleteUser, getAllUsers } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);

// Admin routes
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteUser);
router.get('/all', authMiddleware, roleMiddleware(['Admin']), getAllUsers);

export default router;
