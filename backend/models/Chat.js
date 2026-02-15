import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: null
    },
    topic: {
      type: String,
      default: null
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        tokens: {
          type: Number,
          default: 0
        }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    stats: {
      totalMessages: {
        type: Number,
        default: 0
      },
      userMessages: {
        type: Number,
        default: 0
      },
      assistantMessages: {
        type: Number,
        default: 0
      },
      totalTokensUsed: {
        type: Number,
        default: 0
      },
      averageResponseTime: {
        type: Number, // in milliseconds
        default: 0
      },
      sessionDuration: {
        type: Number, // in minutes
        default: 0
      }
    },
    settings: {
      temperature: {
        type: Number,
        min: 0,
        max: 2,
        default: 0.7
      },
      maxTokens: {
        type: Number,
        default: 2048
      },
      includeContextWindow: {
        type: Number, // number of previous messages for context
        default: 10
      }
    },
    lastMessage: {
      type: Date,
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    indexes: [
      { user: 1, createdAt: -1 },
      { user: 1, document: 1, createdAt: -1 },
      { document: 1, createdAt: -1 }
    ]
  }
);

// Middleware to update last message time
chatSchema.methods.recordMessage = async function(role, content, tokens = 0) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    tokens
  });

  this.lastMessage = new Date();
  this.stats.totalMessages = (this.stats.totalMessages || 0) + 1;

  if (role === 'user') {
    this.stats.userMessages = (this.stats.userMessages || 0) + 1;
  } else {
    this.stats.assistantMessages = (this.stats.assistantMessages || 0) + 1;
  }

  this.stats.totalTokensUsed = (this.stats.totalTokensUsed || 0) + tokens;

  await this.save();
};

// Method to end chat session
chatSchema.methods.endSession = async function() {
  this.isActive = false;
  this.endedAt = new Date();

  if (this.createdAt) {
    const duration = (this.endedAt - this.createdAt) / (1000 * 60); // Convert to minutes
    this.stats.sessionDuration = Math.round(duration);
  }

  await this.save();
};

// Method to get formatted message history
chatSchema.methods.getMessageHistory = function(limit = null) {
  let messages = this.messages || [];

  if (limit) {
    messages = messages.slice(-limit);
  }

  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
