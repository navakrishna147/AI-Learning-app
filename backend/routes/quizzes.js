import express from 'express';
import {
  generateQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResults,
  getQuizStats
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate/:documentId', protect, generateQuiz);
router.get('/stats', protect, getQuizStats);
router.get('/:documentId', protect, getQuizzes);
router.get('/quiz/:id', protect, getQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:id/results', protect, getQuizResults);

export default router;
