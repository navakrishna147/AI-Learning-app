import Chat from '../models/Chat.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import aiService from '../services/aiService.js';

/**
 * PRODUCTION-GRADE CHAT CONTROLLER
 * Fixed error handling, proper validation, beginner-level explanations
 * Designed for educational deployment to students
 */

// @desc    Chat with AI about document
// @route   POST /api/chat/:documentId
// @access  Private
// @response Provides beginner-level explanations of document content
export const chatWithDocument = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // ==================== INPUT VALIDATION ====================
    const { message } = req.body;
    const { documentId } = req.params;
    const userId = req.user._id;

    // Validate message
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
        message: 'Question is too long (maximum 5000 characters)' 
      });
    }

    console.log(`\n[CHAT] Processing question for document ${documentId}`);
    console.log(`[CHAT] User: ${userId}`);
    console.log(`[CHAT] Question: "${trimmedMessage.substring(0, 60)}..."`);

    // ==================== DOCUMENT VALIDATION ====================
    // Find document - ensure user owns it
    const document = await Document.findOne({
      _id: documentId,
      user: userId
    });

    if (!document) {
      console.warn(`[CHAT] Document ${documentId} not found for user ${userId}`);
      return res.status(404).json({ 
        success: false,
        message: 'Document not found or you do not have access to it'
      });
    }

    console.log(`[CHAT] Document found: "${document.title}" (${document.content.length} chars)`);

    // ==================== API AVAILABILITY CHECK ====================
    const isAPIAvailable = aiService.isAPIKeyAvailable();
    
    if (!isAPIAvailable) {
      console.error('[CHAT] FATAL: API Key not configured');
      return res.status(503).json({ 
        success: false,
        message: 'AI service is not configured. Please contact your administrator.',
        errorCode: 'NO_API_KEY'
      });
    }

    console.log('[CHAT] API Status: READY');

    // ==================== GET/CREATE CHAT SESSION ====================
    let chatSession = await Chat.findOne({
      user: userId,
      document: documentId,
      isActive: true
    });

    if (!chatSession) {
      console.log('[CHAT] Creating new chat session');
      chatSession = await Chat.create({
        user: userId,
        document: documentId,
        title: `Learning: ${document.title.substring(0, 50)}`,
        topic: document.category || 'General Knowledge',
        messages: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`[CHAT] Chat session created: ${chatSession._id}`);
    } else {
      console.log(`[CHAT] Using existing session: ${chatSession._id}`);
    }

    // ==================== PREPARE CONTEXT ====================
    // Get recent conversation history for context
    const recentMessages = chatSession.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    console.log(`[CHAT] Including ${recentMessages.length} previous messages in context`);

    // Generate system prompt for beginner-level teaching
    const systemPrompt = aiService.generateSystemPrompt(
      document.title,
      document.content
    );

    // Prepare messages for API call
    const messagesForAPI = [
      ...recentMessages,
      { role: 'user', content: trimmedMessage }
    ];

    // ==================== CALL AI SERVICE ====================
    console.log(`[CHAT] Calling Claude API...`);
    let assistantMessage = '';

    try {
      // Call Claude with timeout
      const apiCallTimeout = setTimeout(() => {
        console.warn('[CHAT] API call timeout (30 seconds)');
      }, 30000);

      assistantMessage = await aiService.chatWithClaude(
        messagesForAPI,
        systemPrompt
      );

      clearTimeout(apiCallTimeout);

      if (!assistantMessage || assistantMessage.trim() === '') {
        console.error('[CHAT] Claude returned empty response');
        throw new Error('AI service returned empty response');
      }

      console.log(`[CHAT] Claude responded successfully (${assistantMessage.length} chars)`);

    } catch (claudeError) {
      console.error(`[CHAT] Claude API Error: ${claudeError.message}`);

      // Determine error type and respond appropriately
      const errorMsg = claudeError.message || '';
      
      // Rate limiting or quota errors
      if (claudeError.statusCode === 429 || errorMsg.includes('rate')) {
        console.warn('[CHAT] Rate limit detected');
        return res.status(429).json({
          success: false,
          message: 'Service is temporarily busy. Please try again in a moment.',
          errorCode: 'RATE_LIMITED'
        });
      }

      // Configuration/authentication errors
      if (errorMsg.includes('Authentication') || errorMsg.includes('unauthorized') || errorMsg.includes('Configuration')) {
        console.error('[CHAT] Authentication/Configuration error');
        return res.status(503).json({
          success: false,
          message: 'AI service configuration error. Please contact administrator.',
          errorCode: 'CONFIG_ERROR'
        });
      }

      // Timeout errors
      if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
        console.warn('[CHAT] Timeout error');
        return res.status(504).json({
          success: false,
          message: 'Request timed out. Please try again.',
          errorCode: 'TIMEOUT'
        });
      }

      // Any other error - generic response
      console.error(`[CHAT] Unhandled API error: ${errorMsg}`);
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.',
        errorCode: 'SERVICE_ERROR'
      });
    }

    // ==================== CALCULATE TOKENS ====================
    const inputTokens = Math.ceil(trimmedMessage.length / 4);
    const outputTokens = Math.ceil(assistantMessage.length / 4);
    const totalTokens = inputTokens + outputTokens;

    console.log(`[CHAT] Tokens - Input: ${inputTokens}, Output: ${outputTokens}, Total: ${totalTokens}`);

    // ==================== SAVE TO DATABASE ====================
    try {
      // Add messages to chat session
      chatSession.addMessage('user', trimmedMessage, inputTokens);
      chatSession.addMessage('assistant', assistantMessage, outputTokens);
      chatSession.updatedAt = new Date();

      // Update document stats
      document.chatCount = (document.chatCount || 0) + 1;
      document.lastChatDate = new Date();

      // Save both in parallel
      await Promise.all([
        chatSession.save(),
        document.save()
      ]);

      console.log('[CHAT] Chat saved successfully');

    } catch (saveError) {
      console.error('[CHAT] Error saving chat:', saveError.message);
      // Don't fail the response, just log it
      // The response was already sent to the user
    }

    // ==================== LOG ACTIVITY ====================
    try {
      await Activity.create({
        user: userId,
        action: 'chat_message',
        resource: 'document',
        resourceId: documentId,
        metadata: {
          messageLength: trimmedMessage.length,
          responseLength: assistantMessage.length,
          tokensUsed: totalTokens,
          responseTime: Date.now() - startTime,
          chatSessionId: chatSession._id
        }
      });
    } catch (activityError) {
      console.warn('[CHAT] Error logging activity:', activityError.message);
    }

    // ==================== SEND RESPONSE ====================
    const responseTime = Date.now() - startTime;
    console.log(`[CHAT] Complete in ${responseTime}ms`);

    res.status(200).json({
      success: true,
      response: assistantMessage,
      chatId: chatSession._id,
      metadata: {
        tokensUsed: totalTokens,
        responseTime,
        messageCount: chatSession.messages.length
      }
    });

  } catch (error) {
    console.error(`[CHAT] Unexpected error: ${error.message}`);
    console.error('[CHAT] Stack:', error.stack);

    // Don't send response if headers already sent
    if (res.headersSent) {
      console.warn('[CHAT] Headers already sent, cannot send error response');
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Get chat history for document
// @route   GET /api/chat/:documentId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    console.log(`[CHAT-GET] Fetching chat history for document ${documentId}`);

    // Verify document exists and user owns it
    const document = await Document.findOne({
      _id: documentId,
      user: userId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Get active chat for this document
    const chatSession = await Chat.findOne({
      user: userId,
      document: documentId,
      isActive: true
    }).sort({ createdAt: -1 });

    if (!chatSession) {
      return res.json({
        success: true,
        messages: [],
        chatId: null,
        documentTitle: document.title
      });
    }

    res.json({
      success: true,
      chatId: chatSession._id,
      messages: chatSession.messages,
      documentTitle: document.title,
      createdAt: chatSession.createdAt,
      messageCount: chatSession.messages.length
    });

  } catch (error) {
    console.error('[CHAT-GET] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/:documentId
// @access  Private
export const clearChat = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    console.log(`[CHAT-CLEAR] Clearing chat for document ${documentId}`);

    const result = await Chat.findOneAndUpdate(
      {
        user: userId,
        document: documentId,
        isActive: true
      },
      {
        isActive: false,
        messages: [],
        updatedAt: new Date()
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat cleared successfully'
    });

  } catch (error) {
    console.error('[CHAT-CLEAR] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat'
    });
  }
};

export default {
  chatWithDocument,
  getChatHistory,
  clearChat
};
