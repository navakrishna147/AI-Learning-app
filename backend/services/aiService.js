import Groq from 'groq-sdk';

// ── Initialize Groq Client ──
const GROQ_API_KEY = process.env.GROQ_API_KEY;

let groq = null;
const GROQ_MODEL = 'llama-3.1-8b-instant'; // Fast, available model

if (GROQ_API_KEY && GROQ_API_KEY.length > 5) {
  try {
    groq = new Groq({ apiKey: GROQ_API_KEY });
    console.log('✅ AI Service: Groq initialized with model:', GROQ_MODEL);
    console.log('✅ Groq API Key loaded successfully');
  } catch (err) {
    console.error('❌ Failed to initialize Groq:', err.message);
    groq = null;
  }
} else {
  console.warn('⚠️ AI Service: GROQ_API_KEY not configured or empty');
  console.warn('   Chat, Summary, Flashcards, and Quizzes will NOT work');
  console.warn('   Solution: Add GROQ_API_KEY to backend/.env file');
}

// ─────────────────────────────────────────────
// Low-level helpers
// ─────────────────────────────────────────────

/**
 * Detect whether an error is a rate-limit or API error
 */
const isRateLimitError = (err) => {
  const msg = (err.message || '').toLowerCase();
  return msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests');
};

/**
 * Return a clean, user-friendly error message
 */
const sanitizeError = (err) => {
  if (isRateLimitError(err)) {
    return 'AI service is temporarily rate-limited. Please wait a minute and try again.';
  }
  if ((err.message || '').toLowerCase().includes('authentication') || (err.message || '').toLowerCase().includes('invalid api key')) {
    return 'AI service authentication failed. Please check your API key configuration.';
  }
  if ((err.message || '').toLowerCase().includes('not found')) {
    return 'AI model is temporarily unavailable. Please try again shortly.';
  }
  return 'AI service encountered an error. Please try again later.';
};

/**
 * Call Groq API with proper error handling
 */
const callGroq = async (messages, systemInstruction = '', temperature = 0.7, maxTokens = 2048) => {
  if (!groq) {
    const err = new Error('AI service is not configured. Please set GROQ_API_KEY in .env');
    err.statusCode = 503;
    throw err;
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
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  } catch (err) {
    console.error('❌ Groq API Error:', err.message);
    const cleanMsg = sanitizeError(err);
    const error = new Error(cleanMsg);
    error.statusCode = isRateLimitError(err) ? 429 : 503;
    throw error;
  }
};



// ─────────────────────────────────────────────
// Public API - Core Functions
// ─────────────────────────────────────────────

/**
 * Chat with AI (non-streaming)
 * Takes message array and system prompt
 */
export const chatWithClaude = async (messages, systemPrompt) => {
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  return callGroq(formattedMessages, systemPrompt, 0.7, 2048);
};

/**
 * Generate system prompt for document-based chat
 */
export const generateSystemPrompt = (documentContent, documentTitle) => {
  const contentPreview = documentContent.substring(0, 100000);
  const wordCount = documentContent.split(/\s+/).length;

  return `You are an expert educational learning assistant.

📚 DOCUMENT: "${documentTitle}" (~${wordCount} words)

📖 DOCUMENT CONTENT:
${contentPreview}
${documentContent.length > 100000 ? '\n[…document truncated]' : ''}

🎯 INSTRUCTIONS:
1. Answer ONLY from the document content above.
2. Explain clearly at a basic level — avoid jargon.
3. Use bullet points, examples, and analogies.
4. If the document doesn't cover the question, say so honestly.
5. Be friendly, encouraging, and educational.`;
};

/**
 * Generate document summary
 */
export const generateDocumentSummary = async (content, title) => {
  const prompt = `Summarise the following document titled "${title}" in 2-3 clear paragraphs. Capture the main ideas and highlight key concepts.\n\nDOCUMENT:\n${content.substring(0, 50000)}`;
  const systemInstruction = 'You are a document summarisation expert. Be concise, clear, and organised.';

  const messages = [
    { role: 'user', content: prompt }
  ];

  return callGroq(messages, systemInstruction, 0.7, 1500);
};

/**
 * Generate study questions from document
 */
export const generateDocumentQuestions = async (content, title, count = 5) => {
  const prompt = `Generate ${count} clear study questions for the document titled "${title}".\nNumber each question.\n\nDOCUMENT:\n${content.substring(0, 50000)}`;
  const systemInstruction = 'You are an educational assistant. Generate numbered questions that test understanding.';

  const messages = [
    { role: 'user', content: prompt }
  ];

  const text = await callGroq(messages, systemInstruction, 0.7, 1000);
  return text
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(q => q.length > 0);
};

/**
 * Generate answer to a question about a document
 */
export const generateAnswer = async (documentContent, question, title) => {
  const systemPrompt = generateSystemPrompt(documentContent, title);
  return chatWithClaude([{ role: 'user', content: question }], systemPrompt);
};

/**
 * Extract key concepts from document
 */
export const extractKeyConcepts = async (content, title) => {
  const prompt = `Extract 8-12 key concepts from the document titled "${title}".

Format each concept on its own line as:
1. Concept Name: Brief definition (max 20 words)

DOCUMENT:
${content.substring(0, 50000)}`;
  
  const systemInstruction = 'You are an expert educational analyst. List only key concepts with brief definitions.';

  const messages = [
    { role: 'user', content: prompt }
  ];

  const text = await callGroq(messages, systemInstruction, 0.7, 1000);
  return text
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      const m = l.match(/^\d+\.\s*(.+)/);
      return m ? m[1].trim() : l.trim();
    })
    .filter(c => c.length > 0 && !c.startsWith('#'));
};

/**
 * Generate flashcards from document content
 * Returns structured JSON array with question/answer pairs
 */
export const generateFlashcards = async (content, title, count = 10) => {
  const prompt = `Generate exactly ${count} study flashcards from the document titled "${title}".

Each flashcard should test understanding of a key concept.
Return ONLY valid JSON — no markdown fences, no extra text.

Format:
[
  { "question": "Clear question", "answer": "Detailed 2-3 sentence answer" }
]

DOCUMENT:
${content.substring(0, 40000)}`;

  const systemInstruction = 'You are an expert flashcard designer. Return ONLY a JSON array of flashcards. Each object must have "question" and "answer" fields.';

  const messages = [
    { role: 'user', content: prompt }
  ];

  const text = await callGroq(messages, systemInstruction, 0.5, 2000);

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const arr = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    
    return arr
      .map(fc => ({
        question: (fc.question || fc.q || fc.front || '').toString().trim(),
        answer: (fc.answer || fc.a || fc.back || '').toString().trim(),
      }))
      .filter(fc => fc.question.length > 0 && fc.answer.length > 0)
      .slice(0, count);
  } catch (parseErr) {
    console.error('❌ Failed to parse flashcards JSON:', parseErr.message);
    // Attempt line-by-line extraction as fallback
    return extractFlashcardsFromText(text);
  }
};

/**
 * Fallback parser: extracts Q/A pairs from plain text
 */
const extractFlashcardsFromText = (text) => {
  const cards = [];
  const lines = text.split('\n').filter(l => l.trim());
  for (let i = 0; i < lines.length - 1; i++) {
    const qMatch = lines[i].match(/^(?:Q\d*[:.]?\s*|Question\s*\d*[:.]?\s*|\d+\.\s*)(.*)/i);
    const aMatch = lines[i + 1]?.match(/^(?:A\d*[:.]?\s*|Answer\s*\d*[:.]?\s*)(.*)/i);
    if (qMatch && aMatch) {
      cards.push({ question: qMatch[1].trim(), answer: aMatch[1].trim() });
      i++; // skip the answer line
    }
  }
  return cards;
};

/**
 * Generate quiz questions from document content
 * Returns structured JSON array with MCQ format
 */
export const generateQuizQuestions = async (content, title, questionCount = 10) => {
  const prompt = `Generate exactly ${questionCount} multiple-choice questions from the document titled "${title}".

Requirements:
- Mix of recall (30%), application (40%), analysis (30%)
- 4 options per question, one correct
- Include explanation for correct answer
- Return ONLY valid JSON — no markdown fences

Format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct"
  }
]

DOCUMENT:
${content.substring(0, 40000)}`;

  const systemInstruction = 'You are an expert quiz designer. Return ONLY a valid JSON array of quiz questions. Each question must have "question", "options" (4 strings), "correctAnswer" (0-3), and "explanation" fields.';

  const messages = [
    { role: 'user', content: prompt }
  ];

  const text = await callGroq(messages, systemInstruction, 0.5, 3000);

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const arr = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    
    return arr
      .filter(q =>
        q.question &&
        q.options && Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 && q.correctAnswer < 4
      )
      .slice(0, questionCount);
  } catch (parseErr) {
    console.error('❌ Failed to parse quiz JSON:', parseErr.message);
    return [];
  }
};

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────

export const isAPIKeyAvailable = () => {
  return !!(groq && GROQ_API_KEY && GROQ_API_KEY.length > 5);
};

export const getAPIStatus = () => {
  const available = isAPIKeyAvailable();
  return {
    available,
    model: GROQ_MODEL,
    provider: 'Groq',
    status: available ? 'ready' : 'not_configured'
  };
};

// Default export for controllers that use `import aiService from …`
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
  getAPIStatus,
};
