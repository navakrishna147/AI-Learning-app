import Chat from '../models/Chat.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import aiService from '../services/aiService.js';

/**
 * ============================================
 * PRODUCTION-GRADE CHAT CONTROLLER v2.0
 * ============================================
 * Fixed error handling, robust validation
 * Optimized for educational deployment
 * Designed for high reliability and beginner-friendly responses
 */

// @desc    Chat with AI about document - MAIN ENDPOINT
// @route   POST /api/chat/:documentId
// @access  Private
// @purpose Provide beginner-level explanations of document content
export const chatWithDocument = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // ==================== VALIDATE INPUT ====================
    const { message } = req.body;
    const { documentId } = req.params;
    const userId = req.user._id;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a question' 
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 5000) {
      return res.status(400).json({ 
        success: false,
        message: 'Question too long (max 5000 characters)' 
      });
    }

    console.log(`\n[CHAT] NEW REQUEST - Document: ${documentId}`);
    console.log(`[CHAT] User: ${userId}`);
    console.log(`[CHAT] Q: "${trimmedMessage.substring(0, 80).replace(/\n/g, ' ')}..."`);

    // ==================== VERIFY DOCUMENT ====================
    const document = await Document.findOne({
      _id: documentId,
      user: userId
    });

    if (!document) {
      console.warn(`[CHAT] Document not found or user not owner`);
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    console.log(`[CHAT] Doc: "${document.title}" (${document.content.length} chars)`);

    // ==================== CHECK API STATUS ====================
    if (!aiService.isAPIKeyAvailable()) {
      console.error('[CHAT] FATAL - API Key not configured');
      return res.status(503).json({ 
        success: false,
        message: 'AI service is not configured. Contact administrator.',
        errorCode: 'NO_API_KEY'
      });
    }

    // ==================== GET/CREATE CHAT SESSION ====================
    let chatSession = await Chat.findOne({
      user: userId,
      document: documentId,
      isActive: true
    });

    if (!chatSession) {
      chatSession = await Chat.create({
        user: userId,
        document: documentId,
        title: `Learning: ${document.title.substring(0, 50)}`,
        topic: document.category || 'General',
        messages: [],
        isActive: true
      });
      console.log(`[CHAT] New session: ${chatSession._id}`);
    }

    // ==================== PREPARE MESSAGE CONTEXT ====================
    const recentMessages = chatSession.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const systemPrompt = aiService.generateSystemPrompt(
      document.title,
      document.content
    );

    const messagesForAPI = [...recentMessages, { role: 'user', content: trimmedMessage }];

    // ==================== CALL CLAUDE API ====================
    console.log('[CHAT] Calling Claude...');
    let assistantMessage = '';

    try {
      assistantMessage = await aiService.chatWithClaude(
        messagesForAPI,
        systemPrompt
      );

      if (!assistantMessage || assistantMessage.trim() === '') {
        throw new Error('Empty response from API');
      }

      console.log(`[CHAT] Response OK (${assistantMessage.length} chars)`);

    } catch (claudeError) {
      console.error(`[CHAT] Claude error: ${claudeError.message}`);
      const errMsg = claudeError.message || '';

      // Rate limiting
      if (claudeError.statusCode === 429) {
        console.warn('[CHAT] Rate limited - 429');
        return res.status(429).json({
          success: false,
          message: 'Service busy. Please try again in a moment.',
          errorCode: 'RATE_LIMITED'
        });
      }

      // Configuration errors
      if (errMsg.includes('Authentication') || errMsg.includes('Configuration')) {
        console.error('[CHAT] Auth/config error');
        return res.status(503).json({
          success: false,
          message: 'Service configuration error. Contact admin.',
          errorCode: 'CONFIG_ERROR'
        });
      }

      // Timeout
      if (errMsg.includes('Timeout') || errMsg.includes('timeout')) {
        console.warn('[CHAT] Timeout - 504');
        return res.status(504).json({
          success: false,
          message: 'Request timed out. Try again.',
          errorCode: 'TIMEOUT'
        });
      }

      // Any other error
      console.error(`[CHAT] Generic error: ${errMsg}`);
      return res.status(503).json({
        success: false,
        message: 'Service unavailable. Try again later.',
        errorCode: 'SERVICE_ERROR'
      });
    }

    // ==================== SAVE TO DATABASE ====================
    try {
      const inputTokens = Math.ceil(trimmedMessage.length / 4);
      const outputTokens = Math.ceil(assistantMessage.length / 4);

      // Record message if Chat has addMessage method, fallback to direct push
      if (chatSession.addMessage) {
        chatSession.addMessage('user', trimmedMessage, inputTokens);
        chatSession.addMessage('assistant', assistantMessage, outputTokens);
      } else {
        chatSession.messages.push(
          { role: 'user', content: trimmedMessage, tokens: inputTokens },
          { role: 'assistant', content: assistantMessage, tokens: outputTokens }
        );
      }

      chatSession.updatedAt = new Date();
      document.lastChatDate = new Date();

      await Promise.all([chatSession.save(), document.save()]);
      console.log('[CHAT] Saved to DB');

    } catch (saveError) {
      console.warn(`[CHAT] Save error (non-blocking): ${saveError.message}`);
    }

    // ==================== LOG ACTIVITY ====================
    try {
      await Activity.create({
        user: userId,
        action: 'chat_message',
        resource: 'document',
        resourceId: documentId,
        metadata: {
          responseTime: Date.now() - startTime,
          messageLength: trimmedMessage.length,
          responseLength: assistantMessage.length
        }
      });
    } catch {
      // Silently fail activity logging
    }

    // ==================== SEND RESPONSE ====================
    const responseTime = Date.now() - startTime;
    console.log(`[CHAT] Complete: ${responseTime}ms\n`);

    res.status(200).json({
      success: true,
      response: assistantMessage,
      chatId: chatSession._id,
      metadata: {
        responseTime,
        messageCount: chatSession.messages.length
      }
    });

  } catch (error) {
    console.error(`[CHAT] FATAL: ${error.message}`);
    console.error('[CHAT] Stack:', error.stack);

    if (res.headersSent) return;

    res.status(500).json({
      success: false,
      message: 'Unexpected error. Try again.',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Get chat history for a document
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
          sessionCount: 0
        }
      });
    }

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
        updatedAt: chat.updatedAt
      },
      messages: paginatedMessages,
      pagination: {
        total: totalMessages,
        skip: parseInt(skip),
        limit: parseInt(limit),
        hasMore: totalMessages > (parseInt(skip) + parseInt(limit))
      },
      stats: {
        totalMessages: totalMessages,
        sessionDuration: Date.now() - new Date(chat.createdAt).getTime()
      }
    });
  } catch (error) {
    console.error('[CHAT-GET] Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load chat history'
    });
  }
};

// @desc    Get all chat sessions for user
// @route   GET /api/chat/sessions
// @access  Private
export const getChatSessions = async (req, res) => {
  try {
    const { documentId, skip = 0, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (documentId) {
      query.document = documentId;
    }

    const chats = await Chat.find(query)
      .select('title topic isActive totalMessages createdAt updatedAt')
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
    console.error('[CHAT-SESSIONS] Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load sessions'
    });
  }
};

// @desc    Clear chat history for a document
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
    chat.updatedAt = new Date();
    await chat.save();

    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    console.error('[CHAT-CLEAR] Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to clear chat'
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

    await Activity.create({
      user: req.user._id,
      action: 'chat_deleted',
      resource: 'chat',
      resourceId: documentId
    });

    res.json({
      success: true,
      message: 'Chat session deleted'
    });
  } catch (error) {
    console.error('[CHAT-DELETE] Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete chat'
    });
  }
};

// @desc    Get AI service status
// @route   GET /api/chat/status
// @access  Private
export const getAIStatus = async (req, res) => {
  try {
    const status = aiService.getAPIStatus();
    
    res.json({
      success: true,
      aiStatus: status,
      available: aiService.isAPIKeyAvailable(),
      model: 'claude-3-5-sonnet-20241022'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI status'
    });
  }
};

export default {
  chatWithDocument,
  getChatHistory,
  getChatSessions,
  clearChatHistory,
  deleteChatSession,
  getAIStatus
};
