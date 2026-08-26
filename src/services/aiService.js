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

const MEAL_REMINDER_SYSTEM_PROMPT = `Anda adalah bot Discord bernama Tulalit yang kocak, asyik, dan suka menyindir para jomblo dengan cara yang lucu, menghibur, dan tetap penuh perhatian.

Tugas Anda:
Buatkan pesan pengingat makan untuk pengguna (jomblo).
Aturan:
1. Sebutkan nama mereka (atau sapaan akrab).
2. Buat lelucon santai / sindiran lucu tentang status jomblo mereka (misal: gak ada pacar yang ngingetin makan, jangan cuma makan ati/harapan kosong, butuh energi buat nge-crush yang gak peka, dsb).
3. Ingatkan untuk menikmati waktu makan tersebut dengan baik.
4. Gunakan bahasa Indonesia santai/gaul anak muda yang natural, 2-3 kalimat pendek, dan sertakan emoji yang relevan.
5. Jangan berikan kata pengantar, langsung berikan teks pesannya.`;

/**
 * Generates a humorous AI meal reminder teasing the single user with Gemini (primary) and Groq fallback.
 *
 * @param {string} userName - The name of the user who called the command.
 * @param {string} [mealType='Makan Siang'] - The meal time context (Sarapan, Makan Siang, Makan Malam, Ngemil, etc.).
 * @returns {Promise<string>} The generated meal reminder text.
 */
export async function generateMealReminder(userName, mealType = 'Makan Siang') {
  const userPrompt = `Buatkan pengingat untuk ${userName} agar segera ${mealType}.`;

  // ─── PRIMARY: Try Gemini first ───
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `${MEAL_REMINDER_SYSTEM_PROMPT} Waktu makan: ${mealType}.`,
      },
    });

    if (response && response.text) {
      return response.text.trim();
    }

    throw new Error('Received an empty response from Gemini API.');
  } catch (geminiError) {
    console.warn('[AI Service] Gemini failed for /ingatmakan. Details:', geminiError.message);

    // ─── FALLBACK: Switch to Groq if Gemini fails ───
    if (isRateLimitError(geminiError)) {
      console.log('[AI Service] Gemini rate limited. Switching to Groq fallback...');
    }

    try {
      const groqResponse = await groqChat(
        `${MEAL_REMINDER_SYSTEM_PROMPT} Waktu makan: ${mealType}.`,
        userPrompt
      );
      console.log('[AI Service] Groq fallback succeeded for /ingatmakan.');
      return groqResponse;
    } catch (groqError) {
      console.error('[AI Service] Groq fallback also failed. Details:', groqError.message);
      return `Woy ${userName}! Gak ada ayang yang ngingetin bukan berarti boleh skip ${mealType} ya. Buruan makan sana, jangan cuma makan ati! 🍜💔`;
    }
  }
}

