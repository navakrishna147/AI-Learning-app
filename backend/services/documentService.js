import pdf from 'pdf-parse';
import fs from 'fs';

/**
 * Extract text from PDF file
 */
export const extractPDFText = async (filePath) => {
  try {
    console.log('📄 Extracting text from PDF:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const dataBuffer = await fs.promises.readFile(filePath);
    
    if (!dataBuffer || dataBuffer.length === 0) {
      throw new Error('PDF file is empty');
    }

    const data = await pdf(dataBuffer);

    // Validate extracted data
    if (!data || !data.text) {
      throw new Error('No text extracted from PDF');
    }

    if (data.text.trim().length === 0) {
      throw new Error('PDF appears to be empty or contains no readable text');
    }

    console.log(`✅ PDF parsed successfully - ${data.numpages} pages, ${data.text.length} characters`);

    return {
      text: data.text,
      pages: data.numpages || 0,
      metadata: data.info || {},
      version: data.version || 'unknown'
    };
  } catch (error) {
    console.error('❌ PDF extraction error:', error.message);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Clean extracted text
 */
export const cleanText = (text) => {
  try {
    // Remove extra whitespace
    let cleaned = text.replace(/\s+/g, ' ').trim();

    // Remove special characters that might cause issues (but keep basic punctuation)
    cleaned = cleaned.replace(/[^\w\s.,!?;:\-()[\]{}'"]/g, '');

    // Remove multiple consecutive punctuation
    cleaned = cleaned.replace(/([.!?;:,])\1{2,}/g, '$1');

    return cleaned;
  } catch (error) {
    console.error('❌ Text cleaning error:', error);
    return text;
  }
};

/**
 * Get text preview (first N characters)
 */
export const getTextPreview = (text, length = 500) => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};

/**
 * Calculate text statistics
 */
export const getTextStatistics = (text) => {
  try {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Average words per sentence
    const avgWordsPerSentence = words.length > 0 && sentences.length > 0 
      ? (words.length / sentences.length).toFixed(1)
      : 0;

    // Estimate reading time (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(words.length / 200);

    return {
      totalCharacters: text.length,
      totalWords: words.length,
      totalSentences: sentences.length,
      totalParagraphs: paragraphs.length,
      avgWordsPerSentence: parseFloat(avgWordsPerSentence),
      estimatedReadingTimeMinutes: readingTimeMinutes
    };
  } catch (error) {
    console.error('❌ Statistics calculation error:', error);
    return null;
  }
};

/**
 * Split text into chunks for processing
 */
export const splitTextIntoChunks = (text, chunkSize = 5000, overlapSize = 500) => {
  try {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.substring(start, end);
      chunks.push(chunk);

      start = end - overlapSize;
      if (start < 0) start = 0;

      // Break if we're at the end
      if (end === text.length) break;
    }

    return chunks;
  } catch (error) {
    console.error('❌ Text chunking error:', error);
    return [text];
  }
};

/**
 * Validate document content
 */
export const validateDocumentContent = (content, minLength = 100, maxLength = 10000000) => {
  const errors = [];

  if (!content || typeof content !== 'string') {
    errors.push('Content must be a non-empty string');
  } else if (content.length < minLength) {
    errors.push(`Content is too short (minimum ${minLength} characters)`);
  } else if (content.length > maxLength) {
    errors.push(`Content is too long (maximum ${maxLength} characters)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    contentLength: content?.length || 0
  };
};

/**
 * Extract keywords from text
 */
export const extractKeywords = (text, count = 10) => {
  try {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3); // Words longer than 3 chars

    // Count word frequency
    const frequency = {};
    words.forEach(word => {
      // Remove punctuation
      const cleanWord = word.replace(/[.,!?;:\-()[\]{}'"]/g, '');
      if (cleanWord.length > 3) {
        frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
      }
    });

    // Sort by frequency and get top keywords
    const keywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word);

    return keywords;
  } catch (error) {
    console.error('❌ Keyword extraction error:', error);
    return [];
  }
};

/**
 * Process file size
 */
export const getFileSizeReadable = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Complete document processing pipeline
 */
export const processDocument = async (filePath, filename) => {
  try {
    console.log('🔄 DOCUMENT PROCESSING PIPELINE START');
    console.log('File:', filename);
    console.log('Path:', filePath);

    // Step 1: Extract PDF text
    console.log('Step 1️⃣ : Extracting PDF text...');
    let pdfData;
    try {
      pdfData = await extractPDFText(filePath);
      console.log('✅ PDF extraction completed');
    } catch (extractError) {
      console.error('❌ PDF extraction failed:', extractError.message);
      throw new Error(`Failed to extract PDF: ${extractError.message}`);
    }

    // Step 2: Clean text
    console.log('Step 2️⃣ : Cleaning text...');
    let cleanedText;
    try {
      cleanedText = cleanText(pdfData.text);
      console.log(`✅ Text cleaned - Original: ${pdfData.text.length} chars, Cleaned: ${cleanedText.length} chars`);
    } catch (cleanError) {
      console.error('❌ Text cleaning failed:', cleanError.message);
      throw new Error(`Failed to clean text: ${cleanError.message}`);
    }

    // Step 3: Validate content
    console.log('Step 3️⃣ : Validating content...');
    const validation = validateDocumentContent(cleanedText);
    if (!validation.valid) {
      console.error('❌ Validation failed:', validation.errors);
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }
    console.log('✅ Content validation passed');

    // Step 4: Calculate statistics
    console.log('Step 4️⃣ : Calculating statistics...');
    let stats;
    try {
      stats = getTextStatistics(cleanedText);
      if (!stats) {
        throw new Error('Statistics calculation returned null');
      }
      console.log('✅ Statistics calculated:', {
        words: stats.totalWords,
        sentences: stats.totalSentences,
        readTime: stats.estimatedReadingTimeMinutes
      });
    } catch (statsError) {
      console.error('❌ Statistics calculation failed:', statsError.message);
      stats = {
        totalCharacters: cleanedText.length,
        totalWords: 0,
        totalSentences: 0,
        totalParagraphs: 0,
        avgWordsPerSentence: 0,
        estimatedReadingTimeMinutes: 0
      };
    }

    // Step 5: Extract keywords
    console.log('Step 5️⃣ : Extracting keywords...');
    let keywords;
    try {
      keywords = extractKeywords(cleanedText, 10);
      console.log('✅ Keywords extracted:', keywords.length, 'keywords');
    } catch (keywordError) {
      console.error('⚠️ Keyword extraction failed:', keywordError.message);
      keywords = [];
    }

    console.log('✅ DOCUMENT PROCESSING PIPELINE COMPLETED');

    return {
      success: true,
      content: cleanedText,
      metadata: {
        filename,
        pages: pdfData.pages,
        pdfVersion: pdfData.version,
        keywords,
        stats,
        preview: getTextPreview(cleanedText, 300)
      }
    };
  } catch (error) {
    console.error('❌ DOCUMENT PROCESSING PIPELINE ERROR');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

export default {
  extractPDFText,
  cleanText,
  getTextPreview,
  getTextStatistics,
  splitTextIntoChunks,
  validateDocumentContent,
  extractKeywords,
  getFileSizeReadable,
  processDocument
};
