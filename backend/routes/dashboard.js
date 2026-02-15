import express from 'express';
import { 
  getStats, 
  getActivities, 
  getAnalytics,
  getLearningGoals,
  getAchievements,
  getSummary
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/activities', getActivities);
router.get('/learning-goals', getLearningGoals);
router.get('/achievements', getAchievements);
router.get('/summary', getSummary);

export default router;
