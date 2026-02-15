import Activity from '../models/Activity.js';
import User from '../models/User.js';

// Track activity - middleware to log user actions
export const trackActivity = async (userId, type, description, documentId = null, metadata = {}) => {
  try {
    const activity = new Activity({
      user: userId,
      type,
      description,
      document: documentId,
      metadata
    });

    await activity.save();

    // Update user stats
    const user = await User.findById(userId);
    if (user) {
      user.stats.lastActivityDate = new Date();

      // Update specific stat based on activity type
      switch (type) {
        case 'quiz_complete':
          user.stats.totalQuizzesCompleted = (user.stats.totalQuizzesCompleted || 0) + 1;
          if (metadata.quizScore !== undefined) {
            // Update average score
            const currentAvg = user.stats.averageQuizScore || 0;
            const completed = user.stats.totalQuizzesCompleted || 1;
            user.stats.averageQuizScore = 
              (currentAvg * (completed - 1) + metadata.quizScore) / completed;
          }
          break;
        case 'flashcard_review':
          user.stats.totalFlashcardsReviewed = (user.stats.totalFlashcardsReviewed || 0) + 
            (metadata.flashcardsReviewed || 1);
          break;
        case 'chat':
          user.stats.totalChatMessages = (user.stats.totalChatMessages || 0) + 
            (metadata.messagesExchanged || 1);
          break;
        case 'document_access':
        case 'document_upload':
          // Time tracking
          if (metadata.timeSpent) {
            user.stats.totalTimeSpent = (user.stats.totalTimeSpent || 0) + metadata.timeSpent;
          }
          break;
      }

      // Update streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActivity = user.stats.lastActivityDate;
      if (lastActivity) {
        const lastActivityDate = new Date(lastActivity);
        lastActivityDate.setHours(0, 0, 0, 0);
        const timeDiff = today.getTime() - lastActivityDate.getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        if (daysDiff === 0) {
          // Same day, no change to streak
        } else if (daysDiff === 1) {
          // Consecutive day
          user.stats.currentStreak = (user.stats.currentStreak || 0) + 1;
          if (user.stats.currentStreak > (user.stats.longestStreak || 0)) {
            user.stats.longestStreak = user.stats.currentStreak;
          }
        } else {
          // Streak broken, reset to 1
          user.stats.currentStreak = 1;
        }
      } else {
        // First activity
        user.stats.currentStreak = 1;
      }

      await user.save();
    }

    return activity;
  } catch (error) {
    console.error('Error tracking activity:', error);
    return null;
  }
};

// Middleware to log activities automatically for specific routes
export const logActivity = (type) => {
  return async (req, res, next) => {
    // Store original sendStatus and send methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Keep track of the activity to potentially log
    res.activityData = {
      type,
      userId: req.user?._id,
      documentId: req.params.documentId || null,
      metadata: req.body?.metadata || {}
    };

    // Override send method to capture response
    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Success - log activity
        if (res.activityData.userId) {
          trackActivity(
            res.activityData.userId,
            res.activityData.type,
            `${type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1).toLowerCase()}`,
            res.activityData.documentId,
            res.activityData.metadata
          ).catch(console.error);
        }
      }
      return originalSend.call(this, data);
    };

    // Override json method similarly
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (res.activityData.userId) {
          trackActivity(
            res.activityData.userId,
            res.activityData.type,
            `${type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1).toLowerCase()}`,
            res.activityData.documentId,
            { ...res.activityData.metadata, ...data }
          ).catch(console.error);
        }
      }
      return originalJson.call(this, data);
    };

    next();
  };
};
