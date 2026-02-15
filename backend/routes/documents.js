import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  getDocumentView,
  deleteDocument,
  updateDocument,
  getDocumentStats,
  generateSummary,
  getKeyConcepts
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Error handling wrapper for multer
const uploadWithErrorHandling = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit'
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Only one file is allowed'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    
    next();
  });
};

// More specific routes first (before :id param routes)
router.get('/:id/stats', protect, getDocumentStats);
router.get('/:id/download', protect, getDocumentView);  // Use download instead of view
router.post('/:id/summary', protect, generateSummary);
router.post('/:id/concepts', protect, getKeyConcepts);

// Standard CRUD routes
router.post('/', protect, uploadWithErrorHandling, uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

export default router;