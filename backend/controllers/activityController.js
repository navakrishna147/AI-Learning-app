import Activity from '../models/Activity.js';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

// @desc    Get recent activities
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .populate('document', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const [totalDocuments, totalFlashcards, totalQuizzes] = await Promise.all([
      Document.countDocuments({ user: req.user._id }),
      Flashcard.countDocuments({ user: req.user._id }),
      Quiz.countDocuments({ user: req.user._id })
    ]);

    res.json({
      totalDocuments,
      totalFlashcards,
      totalQuizzes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};