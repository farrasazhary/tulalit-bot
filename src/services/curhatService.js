import { GoogleGenAI } from '@google/genai';
import { AI_API_KEY } from '../config/env.js';

// Initialize the Google Gen AI client with the validated API key
const ai = new GoogleGenAI({ apiKey: AI_API_KEY });

/**
 * Generates an empathetic, warm, and supportive response to a user's venting (curhat) in Indonesian.
 * Uses gemini-2.5-flash with a therapeutic/counseling system instruction.
 *
 * @param {string} userMessage - The user's vent/curhat text.
 * @returns {Promise<string>} The empathetic AI response.
 */
export async function generateCurhatResponse(userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: `Anda adalah teman curhat yang sangat hangat, berempati tinggi, peka, dan bijaksana bernama Tulalit. 

Tugas Anda adalah mendengarkan keluh kesah pengguna dan memberikan tanggapan yang menenangkan (2-3 paragraf pendek, maksimal 8-10 kalimat secara total). 

Gunakan bahasa Indonesia yang santun, luwes, bersahabat, dan menyejukkan hati. Jalankan prinsip-prinsip konseling dasar:
1. Validasi emosi mereka (tunjukkan bahwa perasaan sedih, lelah, kecewa, atau bingung yang mereka rasakan adalah hal yang wajar).
2. Tunjukkan empati mendalam (misal: "Aku mengerti ini pasti terasa berat sekali bagimu...").
3. Berikan kata-kata penyemangat yang suportif dan tawarkan sudut pandang positif yang realistis tanpa bersikap menggurui atau menghakimi.
4. Jika curhatan mengarah pada topik melukai diri sendiri, bunuh diri, atau bahaya ekstrem, tetap berikan tanggapan yang hangat dan di akhir pesan sarankan dengan sangat halus serta penuh kasih untuk menghubungi profesional (psikolog/konselor/hotline kesehatan mental).

Tanggapi curhatan mereka secara langsung tanpa basa-basi pengantar seperti "Tentu, ini tanggapannya:". Posisikan diri Anda sebagai sahabat yang selalu ada untuk mereka.`,
      },
    });

    if (response && response.text) {
      return response.text.trim();
    }

    throw new Error('Received an empty response from Gemini API for curhat.');
  } catch (error) {
    console.error('Failed to generate curhat response via AI API. Details:', error);
    return 'Terima kasih banyak sudah mau berbagi cerita denganku. Aku tahu hari-harimu mungkin sedang terasa sangat berat, dan aku di sini untuk mendengarkanmu. Semoga beban di hatimu lekas mereda, ya. Kamu tidak sendirian. 💙';
  }
}
