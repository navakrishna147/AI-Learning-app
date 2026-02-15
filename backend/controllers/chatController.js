import Chat from '../models/Chat.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import aiService from '../services/aiService.js';

// @desc    Chat with AI about document
// @route   POST /api/chat/:documentId
// @access  Private
export const chatWithDocument = async (req, res) => {
  try {
    const { message, streaming = false } = req.body;
    const { documentId } = req.params;

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Message cannot be empty' 
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({ 
        success: false,
        message: 'Message is too long (max 5000 characters)' 
      });
    }

    console.log('💬 Chat request for document:', documentId);

    // Get document
    const document = await Document.findOne({
      _id: documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Check API availability and log status
    const isAPIAvailable = aiService.isAPIKeyAvailable();
    console.log('🔍 AI API Available:', isAPIAvailable);
    console.log('📡 Groq Status:', aiService.getAPIStatus());
    
    if (!isAPIAvailable) {
      console.warn('⚠️ GROQ_API_KEY not available - AI features unavailable');
      return res.status(503).json({ 
        success: false,
        message: 'AI services are not available. Please configure GROQ_API_KEY in backend/.env',
        apiStatus: aiService.getAPIStatus(),
        solution: 'Add GROQ_API_KEY to backend/.env and restart server'
      });
    }

    // Get or create chat session
    let chat = await Chat.findOne({
      user: req.user._id,
      document: documentId,
      isActive: true
    });

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        document: documentId,
        title: `Chat with ${document.title}`,
        topic: document.category || 'General',
        messages: [],
        isActive: true
      });
      console.log('📝 New chat session created:', chat._id);
    }

    const startTime = Date.now();

    try {
      // Build conversational context from recent messages
      const recentMessages = chat.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate system prompt with document context
      const systemPrompt = aiService.generateSystemPrompt(
        document.content,
        document.title
      );

      // Prepare full conversation history
      const messagesForAPI = [
        ...recentMessages,
        { role: 'user', content: message }
      ];

      console.log('📤 Calling Groq API with', messagesForAPI.length, 'messages');
      console.log('🔑 Model:', aiService.getAPIStatus().model);
      
      // Call Groq API with enhanced error handling
      let assistantMessage = '';
      try {
        assistantMessage = await aiService.chatWithClaude(
          messagesForAPI,
          systemPrompt
        );
        console.log('✅ Got response from Groq:', assistantMessage.substring(0, 50) + '...');
      } catch (groqError) {
        console.error('❌ Groq API Error:', groqError.message);
        console.error('Error Status Code:', groqError.statusCode);
        
        const statusCode = groqError.statusCode || 503;
        const errorMessage = groqError.message || 'AI service encountered an error';
        
        return res.status(statusCode).json({
          success: false,
          message: errorMessage,
          details: 'Please try again in a moment',
          apiStatus: aiService.getAPIStatus()
        });
      }

      const tokensUsed = Math.ceil(assistantMessage.length / 4); // Rough token estimate

      // Send response
      res.json({
        success: true,
        message: assistantMessage,
        tokensUsed,
        chatId: chat._id,
        sessionStats: {
          totalMessages: chat.messages.length + 1,
          sessionDuration: Date.now() - new Date(chat.createdAt).getTime()
        }
      });

      // Save messages to chat history (async, don't wait)
      const userTokens = Math.ceil(message.length / 4);
      chat.recordMessage('user', message, userTokens);
      chat.recordMessage('assistant', assistantMessage, tokensUsed);
      document.chatSessionsCount = (document.chatSessionsCount || 0) + 1;
      document.lastChatDate = new Date();
      await Promise.all([chat.save(), document.save()]);

      // Log activity
      await Activity.create({
        user: req.user._id,
        type: 'chat',
        description: `Asked: "${message.substring(0, 50)}..."`,
        document: document._id,
        metadata: { tokensUsed, responseLength: assistantMessage.length, responseTime: Date.now() - startTime }
      });

      console.log(`✅ Chat processed in ${Date.now() - startTime}ms`);

    } catch (apiError) {
      console.error('❌ Chat API Error:', apiError.message);
      console.error('Error Type:', apiError.name);
      if (!res.headersSent) {
        return res.status(503).json({
          success: false,
          message: 'Failed to get AI response: ' + apiError.message,
          apiStatus: aiService.getAPIStatus()
        });
      }
    }

  } catch (error) {
    console.error('❌ Chat handler error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to send message'
      });
    }
  }
};

// @desc    Get chat history for document
// @route   GET /api/chat/:documentId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { skip = 0, limit = 50 } = req.query;

    const chat = await Chat.findOne({
      user: req.user._id,
      document: documentId
    });

    if (!chat) {
      return res.json({
        success: true,
        chat: null,
        messages: [],
        stats: {
          totalMessages: 0,
          sessionCount: 0,
          averageResponseTime: 0
        }
      });
    }

    // Return full chat with paginated messages
    const totalMessages = chat.messages.length;
    const paginatedMessages = chat.messages.slice(
      parseInt(skip), 
      parseInt(skip) + parseInt(limit)
    );

    res.json({
      success: true,
      chat: {
        _id: chat._id,
        title: chat.title,
        topic: chat.topic,
        isActive: chat.isActive,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        endedAt: chat.endedAt
      },
      messages: paginatedMessages,
      pagination: {
        total: totalMessages,
        skip: parseInt(skip),
        limit: parseInt(limit),
        hasMore: totalMessages > (parseInt(skip) + parseInt(limit))
      },
      stats: {
        totalMessages: chat.totalMessages || totalMessages,
        totalTokensUsed: chat.totalTokensUsed || 0,
        averageResponseTime: chat.averageResponseTime || 0,
        sessionDuration: chat.sessionDuration || (Date.now() - new Date(chat.createdAt).getTime())
      }
    });
  } catch (error) {
    console.error('❌ Get chat history error:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get multiple chat sessions for user
// @route   GET /api/chat
// @access  Private
export const getChatSessions = async (req, res) => {
  try {
    const { documentId, skip = 0, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (documentId) {
      query.document = documentId;
    }

    const chats = await Chat.find(query)
      .select('title topic isActive totalMessages totalTokensUsed createdAt updatedAt endedAt')
      .sort({ updatedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('document', 'title');

    const total = await Chat.countDocuments(query);

    res.json({
      success: true,
      sessions: chats,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get chat sessions error:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Clear chat history for document
// @route   DELETE /api/chat/:documentId
// @access  Private
export const clearChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const chat = await Chat.findOne({
      user: req.user._id,
      document: documentId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat history not found'
      });
    }

    chat.messages = [];
    await chat.save();

    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    console.error('❌ Clear chat history error:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete chat session permanently
// @route   DELETE /api/chat/:documentId/permanent
// @access  Private
export const deleteChatSession = async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await Chat.deleteOne({
      user: req.user._id,
      document: documentId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Log activity
    await Activity.create({
      user: req.user._id,
      type: 'chat-deleted',
      description: `Permanently deleted chat session`,
      document: documentId
    });

    console.log('✅ Chat session permanently deleted');

    res.json({
      success: true,
      message: 'Chat session permanently deleted'
    });
  } catch (error) {
    console.error('❌ Delete chat session error:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get AI status and configuration
// @route   GET /api/chat/status
// @access  Private
export const getAIStatus = async (req, res) => {
  try {
    const status = aiService.getAPIStatus();
    
    res.json({
      success: true,
      aiStatus: status,
      apiAvailable: aiService.isAPIKeyAvailable(),
      model: status.model || 'gemini-2.0-flash'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
