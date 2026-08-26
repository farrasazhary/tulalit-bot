import { geminiGenerate } from './geminiService.js';
import { groqChat } from './groqService.js';

const CURHAT_SYSTEM_PROMPT = `Anda adalah teman curhat yang sangat hangat, berempati tinggi, peka, dan bijaksana bernama Tulalit. 

Tugas Anda adalah mendengarkan keluh kesah pengguna dan memberikan tanggapan yang menenangkan (2-3 paragraf pendek, maksimal 8-10 kalimat secara total). 

Gunakan bahasa Indonesia yang santun, luwes, bersahabat, dan menyejukkan hati. Jalankan prinsip-prinsip konseling dasar:
1. Validasi emosi mereka (tunjukkan bahwa perasaan sedih, lelah, kecewa, atau bingung yang mereka rasakan adalah hal yang wajar).
2. Tunjukkan empati mendalam (misal: "Aku mengerti ini pasti terasa berat sekali bagimu...").
3. Berikan kata-kata penyemangat yang suportif dan tawarkan sudut pandang positif yang realistis tanpa bersikap menggurui atau menghakimi.
4. Jika curhatan mengarah pada topik melukai diri sendiri, bunuh diri, atau bahaya ekstrem, tetap berikan tanggapan yang hangat dan di akhir pesan sarankan dengan sangat halus serta penuh kasih untuk menghubungi profesional (psikolog/konselor/hotline kesehatan mental).

Tanggapi curhatan mereka secara langsung tanpa basa-basi pengantar seperti "Tentu, ini tanggapannya:". Posisikan diri Anda sebagai sahabat yang selalu ada untuk mereka.`;

/**
 * Generates an empathetic response using Gemini Multi-Key Pool with Groq Multi-Key fallback.
 *
 * @param {string} userMessage - The user's vent/curhat text.
 * @returns {Promise<string>} The empathetic AI response.
 */
export async function generateCurhatResponse(userMessage) {
  // ─── PRIMARY: Try Gemini Key Pool first ───
  try {
    return await geminiGenerate({
      userPrompt: userMessage,
      systemInstruction: CURHAT_SYSTEM_PROMPT,
    });
  } catch (geminiError) {
    console.warn('[Curhat Service] Gemini pool failed for /curhat. Switching to Groq pool...', geminiError.message);

    // ─── FALLBACK: Switch to Groq Key Pool ───
    try {
      const groqResponse = await groqChat(CURHAT_SYSTEM_PROMPT, userMessage);
      console.log('[Curhat Service] Groq fallback succeeded for /curhat.');
      return groqResponse;
    } catch (groqError) {
      console.error('[Curhat Service] Groq pool also failed. Details:', groqError.message);
      return 'Terima kasih banyak sudah mau berbagi cerita denganku. Aku tahu hari-harimu mungkin sedang terasa sangat berat, dan aku di sini untuk mendengarkanmu. Semoga beban di hatimu lekas mereda, ya. Kamu tidak sendirian. 💙';
    }
  }
}

