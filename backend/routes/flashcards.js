import express from 'express';
import {
  generateFlashcards,
  getFlashcards,
  getAllFlashcardSets,
  updateFlashcardReview,
  getFlashcardStats
} from '../controllers/flashcardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate/:documentId', protect, generateFlashcards);
router.get('/stats', protect, getFlashcardStats);
router.get('/sets', protect, getAllFlashcardSets);
router.get('/:documentId', protect, getFlashcards);
router.put('/:id/review', protect, updateFlashcardReview);

export default router;