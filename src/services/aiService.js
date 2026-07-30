import { GoogleGenAI } from '@google/genai';
import { AI_API_KEY } from '../config/env.js';
import { groqChat } from './groqService.js';

// Initialize the Google Gen AI client with the validated API key
const ai = new GoogleGenAI({ apiKey: AI_API_KEY });

const MOTIVATION_SYSTEM_PROMPT = `Anda adalah seorang pengamat kehidupan yang empatik dan bijaksana. Buatlah pesan motivasi harian (3-4 kalimat panjang) yang sangat menyentuh hati, mendalam, dan membangkitkan kehangatan emosional. Gunakan bahasa Indonesia yang indah, lugas, dan bermakna. Rangkai kata-katanya agar pembaca merasa dipahami, ditenangkan, dan diberi kekuatan baru. Hindari bahasa gaul yang terlalu santai, namun jangan gunakan majas kiasan yang sulit dimengerti. Pesan ini harus terasa seperti pelukan hangat bagi mereka yang sedang berjuang. Jangan berikan kata pengantar, langsung berikan teksnya.`;

/**
 * Checks if an error is a rate limit / quota exhaustion error.
 * @param {Error} error
 * @returns {boolean}
 */
function isRateLimitError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
}

/**
 * Generates a motivational quote using Gemini (primary) with Groq fallback.
 * If Gemini hits rate limit (429), automatically switches to Groq.
 *
 * @param {string} [theme='kerja keras dan disiplin'] - The theme for the motivation quote.
 * @returns {Promise<string>} The motivational quote.
 */
export async function generateMotivation(theme = 'kerja keras dan disiplin') {
  const userPrompt = `Buat kutipan motivasi puitis dengan tema: ${theme}`;

  // ─── PRIMARY: Try Gemini first ───
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `${MOTIVATION_SYSTEM_PROMPT} Tema hari ini adalah: ${theme}.`,
      },
    });

    if (response && response.text) {
      return response.text.trim();
    }

    throw new Error('Received an empty response from Gemini API.');
  } catch (geminiError) {
    console.warn('[AI Service] Gemini failed for /motivasi. Details:', geminiError.message);

    // ─── FALLBACK: Switch to Groq if Gemini fails ───
    if (isRateLimitError(geminiError)) {
      console.log('[AI Service] Gemini rate limited. Switching to Groq fallback...');
    }

    try {
      const groqResponse = await groqChat(
        `${MOTIVATION_SYSTEM_PROMPT} Tema hari ini adalah: ${theme}.`,
        userPrompt
      );
      console.log('[AI Service] Groq fallback succeeded for /motivasi.');
      return groqResponse;
    } catch (groqError) {
      console.error('[AI Service] Groq fallback also failed. Details:', groqError.message);
      return 'Tetap semangat dan teruslah melangkah, konsistensi adalah kunci. 🚀';
    }
  }
}
