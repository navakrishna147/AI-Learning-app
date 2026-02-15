import Groq from 'groq-sdk';

/**
 * ============================================================================
 * GROQ AI SERVICE - PRODUCTION GRADE
 * ============================================================================
 * 
 * ✅ FIXED: Only uses Groq (removed Gemini/Anthropic)
 * ✅ Comprehensive error handling
 * ✅ Rate limit graceful degradation
 * ✅ JSON parsing with fallbacks
 * ✅ Type-safe responses
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant'; // Fast, reliable model

let groq = null;

// ✅ FIX: Initialize only Groq, no Gemini or Anthropic fallbacks
if (GROQ_API_KEY && GROQ_API_KEY.length > 5) {
  try {
    groq = new Groq({ apiKey: GROQ_API_KEY });
    console.log('✅ AI Service: Groq initialized');
    console.log(`   Model: ${GROQ_MODEL}`);
  } catch (err) {
    console.error('❌ Failed to initialize Groq:', err.message);
    groq = null;
  }
} else {
  console.warn('\n⚠️  GROQ_API_KEY not configured');
  console.warn('   AI features (Chat, Summary, Flashcards) will be disabled\n');
}

// ============================================================================
// ERROR HANDLING & UTILITIES
// ============================================================================

/**
 * Detect rate limit errors
 */
const isRateLimitError = (err) => {
  const msg = (err.message || '').toLowerCase();
  return msg.includes('429') || 
         msg.includes('rate limit') || 
         msg.includes('too many requests') ||
         msg.includes('quota exceeded');
};

/**
 * Return user-friendly error messages
 */
const sanitizeError = (err) => {
  const msg = (err.message || '').toLowerCase();

  if (isRateLimitError(err)) {
    return 'AI service is temporarily rate-limited. Please wait a moment and try again.';
  }
  if (msg.includes('authentication') || msg.includes('invalid api key')) {
    return 'AI service authentication failed. Check GROQ_API_KEY in backend/.env';
  }
  if (msg.includes('not found') || msg.includes('model')) {
    return 'AI model is temporarily unavailable. Please try again shortly.';
  }
  if (msg.includes('timeout')) {
    return 'AI service request timed out. Please try again.';
  }
  return 'AI service encountered an error. Please try again later.';
};

/**
 * Call Groq API with comprehensive error handling
 */
const callGroq = async (messages, systemInstruction = '', temperature = 0.7, maxTokens = 2048) => {
  // ✅ FIX: Fail clearly if Groq not configured
  if (!groq) {
    const error = new Error('AI service not configured. Set GROQ_API_KEY in backend/.env');
    error.statusCode = 503;
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: systemInstruction || 'You are an expert educational learning assistant.'
        },
        ...messages
      ],
      temperature: Math.max(0, Math.min(2, temperature)), // Clamp 0-2
      max_tokens: Math.min(maxTokens, 4096), // Groq max token limit
      top_p: 1,
      stream: false
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI service');
    }

    return content;

  } catch (err) {
    console.error('❌ Groq API Error:', err.message);
    
    const cleanMsg = sanitizeError(err);
    const error = new Error(cleanMsg);
    error.statusCode = isRateLimitError(err) ? 429 : 503;
    error.code = isRateLimitError(err) ? 'RATE_LIMITED' : 'API_ERROR';
    error.originalError = err;
    
    throw error;
  }
};

// ============================================================================
// PUBLIC API - CORE FUNCTIONS
// ============================================================================

/**
 * Chat with AI based on document content
 * @param {Array} messages - Array of {role, content} objects
 * @param {String} systemPrompt - System instruction for AI behavior
 * @returns {String} - AI response text
 */
export const chatWithClaude = async (messages, systemPrompt) => {
  const formattedMessages = messages.map(msg => ({
    role: msg.role || 'user',
    content: msg.content || ''
  }));

  return callGroq(formattedMessages, systemPrompt, 0.7, 2048);
};

/**
 * Generate system prompt for document-based interaction
 */
export const generateSystemPrompt = (documentContent, documentTitle) => {
  const contentPreview = documentContent.substring(0, 100000);
  const wordCount = documentContent.split(/\s+/).length;

  return `You are an expert educational learning assistant.

📚 DOCUMENT: "${documentTitle}" (~${wordCount} words)

📖 CONTENT EXCERPT:
${contentPreview}
${documentContent.length > 100000 ? '\n[… document truncated …]' : ''}

🎯 INSTRUCTIONS:
1. Answer ONLY from the document content above.
2. Explain clearly - avoid jargon.
3. Use bullet points, examples, and analogies.
4. If the document doesn't cover the topic, say so honestly.
5. Be friendly, encouraging, and educational.`;
};

/**
 * Generate document summary
 */
export const generateDocumentSummary = async (content, title) => {
  const prompt = `Summarize the document "${title}" in 2-3 clear paragraphs. Capture main ideas and key concepts.\n\nDOCUMENT:\n${content.substring(0, 50000)}`;
  const messages = [{ role: 'user', content: prompt }];

  return callGroq(messages, 'You are a document summarization expert. Be concise and clear.', 0.7, 1500);
};

/**
 * Generate study questions from document
 */
export const generateDocumentQuestions = async (content, title, count = 5) => {
  const prompt = `Generate ${count} clear study questions for "${title}" numbered and concise.\n\nDOCUMENT:\n${content.substring(0, 50000)}`;
  const messages = [{ role: 'user', content: prompt }];
  const text = await callGroq(messages, 'Generate numbered study questions that test understanding.', 0.7, 1000);

  return text
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(q => q.length > 0)
    .slice(0, count);
};

/**
 * Generate answer to question about document
 */
export const generateAnswer = async (documentContent, question, title) => {
  const systemPrompt = generateSystemPrompt(documentContent, title);
  return chatWithClaude([{ role: 'user', content: question }], systemPrompt);
};

/**
 * Extract key concepts from document
 */
export const extractKeyConcepts = async (content, title) => {
  const prompt = `Extract 8-12 key concepts from "${title}". Format each as:
1. Concept Name: Brief definition (max 20 words)

DOCUMENT:
${content.substring(0, 50000)}`;

  const messages = [{ role: 'user', content: prompt }];
  const text = await callGroq(messages, 'Expert educational analyst. List only key concepts with brief definitions.', 0.7, 1000);

  return text
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      const m = l.match(/^\d+\.\s*(.+)/);
      return m ? m[1].trim() : l.trim();
    })
    .filter(c => c.length > 0 && !c.startsWith('#'))
    .slice(0, 12);
};

/**
 * Generate flashcards from document
 * Returns array: [{question, answer}, ...]
 */
export const generateFlashcards = async (content, title, count = 10) => {
  const prompt = `Generate exactly ${count} flashcards from "${title}".
Return ONLY valid JSON (no markdown or extra text):
[
  {"question": "Clear question", "answer": "2-3 sentence answer"}
]

DOCUMENT:
${content.substring(0, 40000)}`;

  const messages = [{ role: 'user', content: prompt }];
  const text = await callGroq(messages, 'Expert flashcard designer returning ONLY valid JSON array.', 0.5, 2000);

  try {
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    const arr = JSON.parse(jsonText);

    return arr
      .map(fc => ({
        question: String(fc.question || fc.q || fc.front || '').trim(),
        answer: String(fc.answer || fc.a || fc.back || '').trim()
      }))
      .filter(fc => fc.question.length > 5 && fc.answer.length > 5)
      .slice(0, count);

  } catch (parseErr) {
    console.warn('Failed to parse flashcards JSON, using text fallback');
    return extractFlashcardsFromText(text).slice(0, count);
  }
};

/**
 * Fallback: extract flashcards from plain text
 */
const extractFlashcardsFromText = (text) => {
  const cards = [];
  const lines = text.split('\n').filter(l => l.trim());

  for (let i = 0; i < lines.length - 1; i++) {
    const qMatch = lines[i].match(/^(?:Q\d*[:.]?\s*|Question\s*\d*[:.]?\s*|\d+\.\s*)(.*)/i);
    const aMatch = lines[i + 1]?.match(/^(?:A\d*[:.]?\s*|Answer\s*\d*[:.]?\s*)(.*)/i);

    if (qMatch?.1 && aMatch?.[1]) {
      cards.push({
        question: qMatch[1].trim(),
        answer: aMatch[1].trim()
      });
      i++;
    }
  }

  return cards;
};

/**
 * Generate quiz questions from document
 * Returns array: [{question, options: [], correctAnswer: 0, explanation}, ...]
 */
export const generateQuizQuestions = async (content, title, questionCount = 10) => {
  const prompt = `Generate exactly ${questionCount} multiple-choice questions from "${title}".
Each question needs:
- 4 options (A, B, C, D)
- One correct answer
- Explanation

Return ONLY valid JSON (no markdown):
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why correct"
  }
]

DOCUMENT:
${content.substring(0, 40000)}`;

  const messages = [{ role: 'user', content: prompt }];
  const text = await callGroq(messages, 'Expert quiz designer returning ONLY valid JSON array.', 0.5, 3000);

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    const arr = JSON.parse(jsonText);

    return arr
      .filter(q =>
        q.question?.length > 5 &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < 4 &&
        q.explanation?.length > 5
      )
      .slice(0, questionCount);

  } catch (parseErr) {
    console.warn('Failed to parse quiz JSON');
    return [];
  }
};

// ============================================================================
// STATUS & CONFIGURATION
// ============================================================================

/**
 * Check if Groq is available
 */
export const isAPIKeyAvailable = () => {
  return !!(groq && GROQ_API_KEY && GROQ_API_KEY.length > 5);
};

/**
 * Get API status object
 */
export const getAPIStatus = () => {
  const available = isAPIKeyAvailable();
  return {
    available,
    model: GROQ_MODEL,
    provider: 'Groq',
    status: available ? 'ready' : 'not_configured',
    features: available ? ['chat', 'summary', 'flashcards', 'quiz'] : []
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  chatWithClaude,
  generateSystemPrompt,
  generateDocumentSummary,
  generateDocumentQuestions,
  generateAnswer,
  extractKeyConcepts,
  generateFlashcards,
  generateQuizQuestions,
  isAPIKeyAvailable,
  getAPIStatus
};
