import { GoogleGenAI } from '@google/genai';
import { AI_API_KEY } from '../config/env.js';

// Initialize the Google Gen AI client with the validated API key
const ai = new GoogleGenAI({ apiKey: AI_API_KEY });

/**
 * Generates a poetic, deep motivational quote structured like a short poem in Indonesian based on the daily theme.
 * If the AI API fails or times out, returns a fallback motivational sentence.
 *
 * @param {string} [theme='kerja keras dan disiplin'] - The theme for today's motivation quote.
 * @returns {Promise<string>} The motivational poem.
 */
export async function generateMotivation(theme = 'kerja keras dan disiplin') {
  try {
    // Generate content using gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Buat kutipan motivasi puitis dengan tema: ${theme}`,
      config: {
        systemInstruction: `Anda adalah seorang pengamat kehidupan yang empatik dan bijaksana. Buatlah pesan motivasi harian (3-4 kalimat panjang) yang sangat menyentuh hati, mendalam, dan membangkitkan kehangatan emosional. Gunakan bahasa Indonesia yang indah, lugas, dan bermakna. Rangkai kata-katanya agar pembaca merasa dipahami, ditenangkan, dan diberi kekuatan baru. Hindari bahasa gaul yang terlalu santai, namun jangan gunakan majas kiasan yang sulit dimengerti. Pesan ini harus terasa seperti pelukan hangat bagi mereka yang sedang berjuang. Tema hari ini adalah: {theme}. Jangan berikan kata pengantar, langsung berikan teksnya.`,
      },
    });

    if (response && response.text) {
      return response.text.trim();
    }

    throw new Error('Received an empty response from Gemini API.');
  } catch (error) {
    console.error('Failed to generate motivation via AI API. Using fallback message. Details:', error);
    return 'Tetap semangat dan teruslah melangkah, konsistensi adalah kunci. 🚀';
  }
}
