import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    filename: {
      type: String,
      required: true
    },
    filepath: {
      type: String,
      required: true
    },
    filesize: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      default: null
    },
    keywords: [{
      type: String
    }],
    category: {
      type: String,
      enum: ['science', 'technology', 'mathematics', 'language', 'history', 'arts', 'other'],
      default: 'other'
    },
    tags: [{
      type: String,
      trim: true
    }],
    isPublic: {
      type: Boolean,
      default: false
    },
    accessLevel: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private'
    },
    sharedWith: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      accessLevel: {
        type: String,
        enum: ['view', 'edit', 'comment'],
        default: 'view'
      }
    }],
    metadata: {
      pages: {
        type: Number,
        default: 0
      },
      totalWords: {
        type: Number,
        default: 0
      },
      totalSentences: {
        type: Number,
        default: 0
      },
      estimatedReadingTime: {
        type: Number, // in minutes
        default: 0
      },
      extractedKeywords: [{
        type: String
      }]
    },
    stats: {
      viewCount: {
        type: Number,
        default: 0
      },
      chatSessionsCount: {
        type: Number,
        default: 0
      },
      totalMessagesCount: {
        type: Number,
        default: 0
      },
      lastChatDate: {
        type: Date,
        default: null
      }
    },
    flashcardsCount: {
      type: Number,
      default: 0
    },
    quizzesCount: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: null
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    indexes: [
      { user: 1, createdAt: -1 },
      { user: 1, isFavorite: -1 },
      { user: 1, category: 1 },
      { user: 1, tags: 1 },
      { user: 1, isPublic: 1 }
    ]
  }
);

// Index for text search
documentSchema.index({ title: 'text', description: 'text', content: 'text' });

// Middleware to update lastAccessed
documentSchema.methods.updateAccessTime = async function() {
  this.lastAccessed = new Date();
  this.stats.viewCount = (this.stats.viewCount || 0) + 1;
  await this.save();
};

// Middleware to update chat stats
documentSchema.methods.updateChatStats = async function() {
  this.stats.lastChatDate = new Date();
  this.stats.chatSessionsCount = (this.stats.chatSessionsCount || 0) + 1;
  await this.save();
};

const Document = mongoose.model('Document', documentSchema);

export default Document;
