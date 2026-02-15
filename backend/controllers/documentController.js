import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processDocument, getFileSizeReadable } from '../services/documentService.js';
import { generateDocumentSummary, extractKeyConcepts, getAPIStatus } from '../services/aiService.js';

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to safely delete files
async function cleanupFile(filePath) {
  try {
    // Handle both relative and absolute paths
    let fullPath = filePath;
    if (!path.isAbsolute(filePath)) {
      fullPath = path.join(__dirname, '..', filePath);
    }
    
    if (fullPath && fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      console.log('🗑️ Cleaned up file:', filePath);
    } else if (!fs.existsSync(fullPath)) {
      console.warn('⚠️ File does not exist:', fullPath);
    }
  } catch (error) {
    console.error('⚠️ Error deleting file:', error.message);
  }
}

// @desc    Upload and process document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req, res) => {
  let uploadedFilePath = null;

  try {
    console.log('📤 Document upload started');
    console.log('User:', req.user._id);
    console.log('File:', req.file?.originalname);

    // Validation
    if (!req.user) {
      if (req.file) await cleanupFile(req.file.path);
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const { title, description, category } = req.body;

    if (!title || title.trim() === '') {
      await cleanupFile(req.file.path);
      return res.status(400).json({ 
        success: false,
        message: 'Document title is required' 
      });
    }

    uploadedFilePath = req.file.path;

    // Process document (extract text, clean, analyze)
    console.log('🔄 Processing document...');
    let processedData;
    try {
      processedData = await processDocument(uploadedFilePath, req.file.originalname);
    } catch (processError) {
      console.error('❌ Document processing failed:', processError.message);
      throw new Error(`Failed to process PDF: ${processError.message}`);
    }

    // Validate processed data
    if (!processedData || !processedData.content) {
      throw new Error('Document processing returned empty content');
    }

    console.log('✅ Document processed successfully');

    // Get document statistics
    const stats = processedData.metadata?.stats || {
      totalWords: 0,
      totalSentences: 0,
      estimatedReadingTimeMinutes: 0
    };

    // Create document in database
    console.log('💾 Creating document in database...');
    let document;
    try {
      const relativePath = `uploads/${req.file.filename}`;
      const documentData = {
        user: req.user._id,
        title: title.trim(),
        description: description || '',
        category: category || 'other',
        filename: req.file.filename,
        filepath: relativePath,
        filesize: req.file.size,
        content: processedData.content,
        keywords: processedData.metadata?.keywords || [],
        metadata: {
          pages: processedData.metadata?.pages || 0,
          totalWords: stats.totalWords || 0,
          totalSentences: stats.totalSentences || 0,
          estimatedReadingTime: stats.estimatedReadingTimeMinutes || 0,
          extractedKeywords: processedData.metadata?.keywords || []
        }
      };

      console.log('Document data to save:', {
        title: documentData.title,
        content_length: documentData.content.length,
        keywords: documentData.keywords.length,
        user: documentData.user
      });

      document = await Document.create(documentData);
      console.log('✅ Document created in DB:', document._id);
    } catch (dbError) {
      console.error('❌ Database creation failed:', dbError.message);
      console.error('Error details:', dbError);
      throw new Error(`Failed to save document: ${dbError.message}`);
    }

    // Generate summary using AI (if API available) - NON-CRITICAL
    if (getAPIStatus && getAPIStatus().available) {
      console.log('🤖 Generating AI summary...');
      try {
        const summary = await generateDocumentSummary(
          processedData.content,
          title
        );
        if (summary && summary.trim().length > 0) {
          document.summary = summary;
          await document.save();
          console.log('✅ Summary generated');
        } else {
          console.warn('⚠️ Summary was empty, skipping');
        }
      } catch (summaryError) {
        console.warn('⚠️ Summary generation failed (non-critical):', summaryError.message);
        // Don't throw - continue without summary
      }
    } else {
      console.log('ℹ️ AI Service not available, skipping summary');
    }

    // Log activity - NON-CRITICAL
    if (Activity) {
      try {
        await Activity.create({
          user: req.user._id,
          type: 'document_upload',
          description: `Uploaded document: ${document.title}`,
          document: document._id
        });
        console.log('✅ Activity logged');
      } catch (activityError) {
        console.warn('⚠️ Activity logging failed (non-critical):', activityError.message);
        // Don't throw - activity logging is non-critical
      }
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      document: {
        _id: document._id,
        title: document.title,
        description: document.description,
        filename: document.filename,
        filesize: document.filesize,
        category: document.category,
        keywords: document.keywords,
        metadata: document.metadata,
        summary: document.summary,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('❌ UPLOAD ERROR - FULL DETAILS:');
    console.error('━'.repeat(60));
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Stack:', error.stack);
    console.error('━'.repeat(60));

    // Clean up uploaded file on error
    if (uploadedFilePath) {
      try {
        await cleanupFile(uploadedFilePath);
        console.log('✅ Cleanup file successful');
      } catch (cleanupErr) {
        console.error('❌ Cleanup failed:', cleanupErr.message);
      }
    }

    let statusCode = 500;
    let message = 'Document upload failed';

    // ========== VALIDATION ERRORS ==========
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors).map(err => err.message).join(', ');
      console.error('Validation Error Details:', error.errors);
    }
    // ========== PDF ERRORS ==========
    else if (error.message.includes('PDF')) {
      statusCode = 400;
      message = 'Invalid PDF file or corrupted file';
    }
    // ========== CONTENT LENGTH ERRORS ==========
    else if (error.message.includes('too short') || error.message.includes('too long')) {
      statusCode = 400;
      message = error.message;
    }
    // ========== DATABASE ERRORS ==========
    else if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      statusCode = 503;
      message = 'Database connection error. Please try again later.';
      console.error('MongoDB Error:', error);
    }
    // ========== CAST ERRORS ==========
    else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid data format';
    }

    res.status(statusCode).json({ 
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all documents for user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res) => {
  try {
    const { category, tags, search, isFavorite, sort = '-createdAt' } = req.query;

    // Build filter
    const filter = { user: req.user._id };

    if (category) {
      filter.category = category;
    }

    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Get documents
    const documents = await Document.find(filter)
      .select('-content')
      .sort(sort)
      .lean();

    res.json(documents);
  } catch (error) {
    console.error('❌ Get documents error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch documents' 
    });
  }
};

// @desc    Get single document with full content
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Update access time
    await document.updateAccessTime();

    res.json(document);
  } catch (error) {
    console.error('❌ Get document error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch document' 
    });
  }
};

// @desc    Get document PDF for viewing
// @route   GET /api/documents/:id/view
// @access  Private
export const getDocumentView = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Check if file exists
    const filePath = document.filepath;
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    // Update view count
    document.viewCount = (document.viewCount || 0) + 1;
    await document.save();

    // Send file with proper headers
    res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading PDF file'
        });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('❌ Get document view error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve document view' 
    });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res) => {
  try {
    const { title, description, category, tags, isFavorite } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Update allowed fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    if (tags) document.tags = tags;
    if (isFavorite !== undefined) document.isFavorite = isFavorite;

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('❌ Update document error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update document' 
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Delete file
    const filePath = document.filepath;
    if (filePath) {
      await cleanupFile(filePath);
    }

    // Delete document
    await Document.findByIdAndDelete(req.params.id);

    // Log activity
    try {
      await Activity.create({
        user: req.user._id,
        type: 'document_delete',
        description: `Deleted document: ${document.title}`
      });
    } catch (err) {
      console.warn('⚠️ Activity logging failed:', err.message);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete document error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete document' 
    });
  }
};

// @desc    Get document statistics
// @route   GET /api/documents/:id/stats
// @access  Private
export const getDocumentStats = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    res.json({
      success: true,
      stats: {
        title: document.title,
        metadata: document.metadata,
        stats: document.stats,
        filesize: getFileSizeReadable(document.filesize),
        createdAt: document.createdAt,
        lastAccessed: document.lastAccessed
      }
    });
  } catch (error) {
    console.error('❌ Get document stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch document statistics' 
    });
  }
};

// @desc    Generate document summary
// @route   POST /api/documents/:id/summary
// @access  Private
export const generateSummary = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    if (!getAPIStatus().available) {
      return res.status(503).json({ 
        success: false,
        message: 'AI service not available. Please configure GROQ_API_KEY in backend/.env and restart server.',
        apiStatus: getAPIStatus(),
        solution: 'Get API key from https://console.groq.com/keys'
      });
    }

    const summary = await generateDocumentSummary(document.content, document.title);
    document.summary = summary;
    await document.save();

    res.json({
      success: true,
      message: 'Summary generated successfully',
      summary
    });
  } catch (error) {
    console.error('❌ Generate summary error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Failed to generate summary' 
    });
  }
};

// @desc    Extract key concepts
// @route   POST /api/documents/:id/concepts
// @access  Private
export const getKeyConcepts = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    if (!getAPIStatus().available) {
      return res.status(503).json({ 
        success: false,
        message: 'AI service not available. Please configure GROQ_API_KEY in backend/.env and restart server.',
        apiStatus: getAPIStatus(),
        solution: 'Get API key from https://console.groq.com/keys'
      });
    }

    const concepts = await extractKeyConcepts(document.content, document.title);

    res.json({
      success: true,
      message: 'Key concepts extracted successfully',
      concepts
    });
  } catch (error) {
    console.error('❌ Extract concepts error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Failed to extract key concepts' 
    });
  }
};