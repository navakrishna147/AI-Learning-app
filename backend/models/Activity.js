import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['document_access', 'quiz_complete', 'flashcard_review', 'chat', 'document_upload'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  metadata: {
    quizScore: Number,
    timeSpent: Number,          // in seconds
    flashcardsReviewed: Number,
    messagesExchanged: Number
  }
}, {
  timestamps: true,
  indexes: [{ user: 1, createdAt: -1 }]
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;