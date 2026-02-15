import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import Chat from '../models/Chat.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

// GET /api/dashboard/stats - Comprehensive statistics
export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalDocuments,
      totalFlashcards,
      totalQuizzes,
      todayDocuments,
      completedQuizzes,
      allQuizzes,
      user,
      todayActivities
    ] = await Promise.all([
      Document.countDocuments({ user: userId }),
      Flashcard.countDocuments({ user: userId }),
      Quiz.countDocuments({ user: userId }),
      Document.countDocuments({ user: userId, createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Quiz.countDocuments({ user: userId, completed: true }),
      Quiz.find({ user: userId, completed: true }).select('score'),
      User.findById(userId).select('stats'),
      Activity.countDocuments({ user: userId, createdAt: { $gte: startOfDay, $lte: endOfDay } })
    ]);

    // Calculate average quiz score
    const quizScores = allQuizzes.map(q => q.score || 0);
    const averageScore = quizScores.length > 0 
      ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(1)
      : 0;

    res.json({
      overview: {
        totalDocuments,
        totalFlashcards,
        totalQuizzes,
        completedQuizzes,
        averageQuizScore: parseFloat(averageScore),
        todayActivities
      },
      userStats: user?.stats || {
        totalQuizzesCompleted: 0,
        totalFlashcardsReviewed: 0,
        totalChatMessages: 0,
        averageQuizScore: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      today: {
        documentsUploaded: todayDocuments,
        activitiesCount: todayActivities
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/analytics - Detailed learning analytics
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7; // Default last 7 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get activities for the period
    const activities = await Activity.find({
      user: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group activities by day
    const activityByDay = {};
    activities.forEach(activity => {
      const day = new Date(activity.createdAt).toLocaleDateString();
      if (!activityByDay[day]) {
        activityByDay[day] = {
          chat: 0,
          quiz: 0,
          flashcard: 0,
          document: 0,
          totalTime: 0
        };
      }
      
      const dayData = activityByDay[day];
      switch (activity.type) {
        case 'chat':
          dayData.chat++;
          break;
        case 'quiz_complete':
          dayData.quiz++;
          break;
        case 'flashcard_review':
          dayData.flashcard++;
          break;
        case 'document_access':
        case 'document_upload':
          dayData.document++;
          break;
      }
      
      if (activity.metadata?.timeSpent) {
        dayData.totalTime += activity.metadata.timeSpent;
      }
    });

    // Get quiz performance
    const quizzes = await Quiz.find({ 
      user: userId,
      completed: true,
      updatedAt: { $gte: startDate }
    }).select('score createdAt');

    const quizPerformance = quizzes.map(q => ({
      date: new Date(q.createdAt).toLocaleDateString(),
      score: q.score
    }));

    // Get feature usage
    const featureUsage = {
      chat: activities.filter(a => a.type === 'chat').length,
      quiz: activities.filter(a => a.type === 'quiz_complete').length,
      flashcard: activities.filter(a => a.type === 'flashcard_review').length,
      document: activities.filter(a => a.type === 'document_access' || a.type === 'document_upload').length
    };

    res.json({
      period: `Last ${days} days`,
      activityByDay,
      quizPerformance,
      featureUsage,
      totalActivities: activities.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/activities - Recent activities
export const getActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 15;

    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('document', 'title')
      .lean();

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/learning-goals
export const getLearningGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('stats');

    // Define some common learning goals
    const goals = [
      {
        id: 1,
        title: 'Complete 10 Quizzes',
        current: user?.stats?.totalQuizzesCompleted || 0,
        target: 10,
        icon: 'target',
        category: 'quizzes'
      },
      {
        id: 2,
        title: 'Review 50 Flashcards',
        current: user?.stats?.totalFlashcardsReviewed || 0,
        target: 50,
        icon: 'book',
        category: 'flashcards'
      },
      {
        id: 3,
        title: 'Maintain 7-Day Streak',
        current: user?.stats?.currentStreak || 0,
        target: 7,
        icon: 'fire',
        category: 'streak'
      },
      {
        id: 4,
        title: 'Average Quiz Score 80%',
        current: user?.stats?.averageQuizScore || 0,
        target: 80,
        icon: 'award',
        category: 'score'
      },
      {
        id: 5,
        title: 'Study 10 Hours Total',
        current: Math.floor((user?.stats?.totalTimeSpent || 0) / 3600),
        target: 10,
        unit: 'hours',
        icon: 'clock',
        category: 'time'
      }
    ];

    // Calculate progress percentages
    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progress: Math.min(100, (goal.current / goal.target) * 100),
      completed: goal.current >= goal.target
    }));

    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/achievements
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('achievements stats');

    // Define all possible achievements
    const allAchievements = {
      firstSteps: {
        name: 'First Steps',
        description: 'Upload your first document',
        condition: (stats) => stats.totalFlashcardsReviewed > 0 || stats.totalQuizzesCompleted > 0,
        icon: '🚀'
      },
      quizMaster: {
        name: 'Quiz Master',
        description: 'Complete 10 quizzes',
        condition: (stats) => stats.totalQuizzesCompleted >= 10,
        icon: '🎯'
      },
      perfectScore: {
        name: 'Perfect Score',
        description: 'Score 100% on a quiz',
        icon: '⭐',
        unlocked: user?.achievements?.some(a => a.name === 'Perfect Score') || false
      },
      studyStreak: {
        name: 'Study Streak',
        description: 'Study 7 days in a row',
        condition: (stats) => stats.currentStreak >= 7,
        icon: '🔥'
      },
      flashcardFanatic: {
        name: 'Flashcard Fanatic',
        description: 'Review 100 flashcards',
        condition: (stats) => stats.totalFlashcardsReviewed >= 100,
        icon: '📚'
      },
      conversationalist: {
        name: 'Conversationalist',
        description: 'Have 50 AI chat conversations',
        condition: (stats) => stats.totalChatMessages >= 50,
        icon: '💬'
      },
      timeTracker: {
        name: 'Time Tracker',
        description: 'Study for 20 hours total',
        condition: (stats) => stats.totalTimeSpent >= 72000,
        icon: '⏰'
      },
      highAchiever: {
        name: 'High Achiever',
        description: 'Achieve 85% average quiz score',
        condition: (stats) => stats.averageQuizScore >= 85,
        icon: '🏆'
      }
    };

    // Check which achievements are unlocked
    const achievements = Object.entries(allAchievements).map(([key, achievement]) => {
      const isUnlocked = achievement.condition 
        ? achievement.condition(user?.stats || {})
        : achievement.unlocked || false;
      
      return {
        id: key,
        ...achievement,
        unlocked: isUnlocked,
        unlockedAt: user?.achievements?.find(a => a.name === achievement.name)?.earnedAt || null
      };
    });

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    res.json({
      achievements,
      unlockedCount,
      totalCount: achievements.length,
      progress: (unlockedCount / achievements.length) * 100
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/summary
export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get time-based stats
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const weekActivities = await Activity.countDocuments({
      user: userId,
      createdAt: { $gte: startOfWeek }
    });

    const recentDocuments = await Document.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt');

    const topQuizzes = await Quiz.find({ user: userId, completed: true })
      .sort({ score: -1 })
      .limit(5)
      .select('title score createdAt');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar
      },
      stats: user.stats,
      achievements: user.achievements,
      activity: {
        thisWeek: weekActivities,
        recentDocuments,
        topQuizzes
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
