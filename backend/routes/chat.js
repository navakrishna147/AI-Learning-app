import express from 'express';
import {
  chatWithDocument,
  getChatHistory,
  getChatSessions,
  clearChatHistory,
  deleteChatSession,
  getAIStatus
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Specific routes first (before :documentId param routes)
router.get('/status', protect, getAIStatus);
router.get('/', protect, getChatSessions);

// Parameterized routes
router.post('/:documentId', protect, chatWithDocument);
router.get('/:documentId', protect, getChatHistory);
router.delete('/:documentId/permanent', protect, deleteChatSession);
router.delete('/:documentId', protect, clearChatHistory);

export default router;