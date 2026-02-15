import Flashcard from '../models/Flashcard.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import { generateFlashcards as aiGenerateFlashcards, isAPIKeyAvailable } from '../services/aiService.js';

// Mock flashcards for development (fallback when no AI provider)
const generateMockFlashcards = (count) => {
  const topics = [
    { question: "What is the main topic?", answer: "The main topic covered in this document." },
    { question: "What are the key points?", answer: "The document covers several key concepts and ideas." },
    { question: "How does this apply?", answer: "This concept can be applied in practical scenarios." },
    { question: "What is the importance?", answer: "Understanding this is important for the subject matter." },
    { question: "What are the examples?", answer: "The document provides various examples throughout." }
  ];
  const out = [];
  for (let i = 0; i < count; i++) out.push(topics[i % topics.length]);
  return out;
};

// @desc    Generate flashcards from document
// @route   POST /api/flashcards/generate/:documentId
// @access  Private
export const generateFlashcards = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { count = 10 } = req.body;

    console.log('📚 Flashcard generation started for count:', count);

    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let flashcardsData = [];

    if (isAPIKeyAvailable()) {
      try {
        flashcardsData = await aiGenerateFlashcards(document.content, document.title, count);
        if (flashcardsData.length === 0) throw new Error('AI returned empty flashcards');
        console.log('✅ Flashcards generated from AI with', flashcardsData.length, 'cards');
      } catch (apiError) {
        console.error('❌ AI flashcard error:', apiError.message);
        flashcardsData = generateMockFlashcards(count);
      }
    } else {
      console.log('⚠️ Using mock flashcards (no AI key configured)');
      flashcardsData = generateMockFlashcards(count);
    }

    // Filter out any flashcards with empty question or answer before saving
    flashcardsData = flashcardsData.filter(
      fc => fc.question && fc.answer && fc.question.trim() && fc.answer.trim()
    );

    if (flashcardsData.length === 0) {
      return res.status(400).json({ success: false, message: 'AI did not produce valid flashcards. Please try again.' });
    }

    // Create flashcards in database
    const flashcards = await Promise.all(
      flashcardsData.map(fc =>
        Flashcard.create({
          user: req.user._id,
          document: documentId,
          question: fc.question.trim(),
          answer: fc.answer.trim()
        })
      )
    );

    // Update document flashcard count
    document.flashcardsCount = await Flashcard.countDocuments({
      document: documentId
    });
    await document.save();

    console.log('✅ Flashcards saved successfully:', flashcards.length);
    res.status(201).json(flashcards);
  } catch (error) {
    console.error('❌ Flashcard generation error:', error.message);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Flashcard generation failed'
    });
  }
};

// @desc    Get flashcards for document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      user: req.user._id,
      document: req.params.documentId
    }).sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all flashcard sets
// @route   GET /api/flashcards
// @access  Private
export const getAllFlashcardSets = async (req, res) => {
  try {
    const flashcardSets = await Flashcard.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$document',
          count: { $sum: 1 },
          reviewed: {
            $sum: { $cond: ['$reviewed', 1, 0] }
          },
          createdAt: { $first: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'documents',
          localField: '_id',
          foreignField: '_id',
          as: 'documentInfo'
        }
      },
      { $unwind: '$documentInfo' },
      {
        $project: {
          documentId: '$_id',
          title: '$documentInfo.title',
          count: 1,
          reviewed: 1,
          progress: {
            $multiply: [
              { $divide: ['$reviewed', '$count'] },
              100
            ]
          },
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(flashcardSets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update flashcard review status
// @route   PUT /api/flashcards/:id/review
// @access  Private
export const updateFlashcardReview = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    flashcard.reviewed = req.body.reviewed;
    await flashcard.save();

    // Log activity
    await Activity.create({
      user: req.user._id,
      type: 'flashcard_review',
      description: 'Reviewed flashcard',
      document: flashcard.document
    });

    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get flashcard stats
// @route   GET /api/flashcards/stats
// @access  Private
export const getFlashcardStats = async (req, res) => {
  try {
    const totalFlashcards = await Flashcard.countDocuments({ user: req.user._id });
    res.json({ totalFlashcards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};