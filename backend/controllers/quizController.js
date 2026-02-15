import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import { generateQuizQuestions, isAPIKeyAvailable } from '../services/aiService.js';

// Mock quiz questions for development (fallback)
const generateMockQuiz = (questionCount) => {
  const base = [
    {
      question: "What is the primary focus of this document?",
      options: ["Main topic A", "Main topic B", "Main topic C", "Main topic D"],
      correctAnswer: 0,
      explanation: "The document primarily addresses Main topic A."
    },
    {
      question: "Which concept is most important according to the document?",
      options: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
      correctAnswer: 1,
      explanation: "Concept 2 is emphasised as fundamental throughout the document."
    },
    {
      question: "How would you apply this knowledge in practice?",
      options: ["Application A", "Application B", "Application C", "Application D"],
      correctAnswer: 2,
      explanation: "Application C is directly supported by examples in the material."
    },
    {
      question: "What are the key benefits mentioned?",
      options: ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
      correctAnswer: 0,
      explanation: "Benefit 1 is highlighted as the primary advantage."
    },
    {
      question: "What conclusion does the document support?",
      options: ["Conclusion A", "Conclusion B", "Conclusion C", "Conclusion D"],
      correctAnswer: 1,
      explanation: "Conclusion B follows logically from the arguments presented."
    }
  ];
  const out = [];
  for (let i = 0; i < questionCount; i++) out.push({ ...base[i % base.length], question: base[i % base.length].question + (i >= base.length ? ` (${i + 1})` : '') });
  return out;
};

// @desc    Generate quiz from document
// @route   POST /api/quizzes/generate/:documentId
// @access  Private
export const generateQuiz = async (req, res) => {
  try {
    const { documentId } = req.params;
    // Enforce minimum 10 questions
    const requestedCount = Math.max(Number(req.body.questionCount) || 10, 10);

    console.log('📝 Quiz generation started for questions:', requestedCount);

    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let questionsData = [];

    if (isAPIKeyAvailable()) {
      try {
        questionsData = await generateQuizQuestions(document.content, document.title, requestedCount);
        if (questionsData.length === 0) throw new Error('AI returned empty quiz');
        console.log('✅ Quiz generated from AI with', questionsData.length, 'questions');
      } catch (apiError) {
        console.error('❌ AI quiz error:', apiError.message);
        questionsData = generateMockQuiz(requestedCount);
      }
    } else {
      console.log('⚠️ Using mock quiz (no AI key configured)');
      questionsData = generateMockQuiz(requestedCount);
    }

    // Create quiz
    const quiz = await Quiz.create({
      user: req.user._id,
      document: documentId,
      title: `${document.title} - Quiz`,
      questions: questionsData
    });

    // Update document quiz count
    document.quizzesCount = await Quiz.countDocuments({
      document: documentId
    });
    await document.save();

    console.log('✅ Quiz saved successfully:', quiz._id);
    res.status(201).json(quiz);
  } catch (error) {
    console.error('❌ Quiz generation error:', error.message);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Quiz generation failed'
    });
  }
};

// @desc    Get quizzes for document
// @route   GET /api/quizzes/:documentId
// @access  Private
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      user: req.user._id,
      document: req.params.documentId
    })
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz with questions
// @route   GET /api/quizzes/quiz/:id
// @access  Private
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('-questions.correctAnswer'); // Don't send correct answers

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of user answers

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      q.userAnswer = answers[index];
      if (q.correctAnswer === answers[index]) {
        correct++;
      }
    });

    quiz.score = Math.round((correct / quiz.questions.length) * 100);
    quiz.completed = true;

    await quiz.save();

    // Log activity
    await Activity.create({
      user: req.user._id,
      type: 'quiz_complete',
      description: `Completed quiz: ${quiz.title} (Score: ${quiz.score}%)`,
      document: quiz.document
    });

    res.json({
      score: quiz.score,
      correct,
      total: quiz.questions.length,
      questions: quiz.questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.completed) {
      return res.status(400).json({ message: 'Quiz not completed yet' });
    }

    res.json({
      score: quiz.score,
      questions: quiz.questions,
      completedAt: quiz.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz stats
// @route   GET /api/quizzes/stats
// @access  Private
export const getQuizStats = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments({ user: req.user._id });
    res.json({ totalQuizzes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};