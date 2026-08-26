import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEYS } from '../config/env.js';

// Initialize a client instance for each configured Gemini API key
const geminiClients = GEMINI_API_KEYS.map((key, index) => ({
  index: index + 1,
  keyPreview: `${key.slice(0, 6)}...${key.slice(-4)}`,
  client: new GoogleGenAI({ apiKey: key }),
}));

let currentKeyIndex = 0;

/**
 * Checks if an error is related to rate limiting, quota exhaustion, or temporary service unavailability.
 *
 * @param {any} error
 * @returns {boolean}
 */
export function isRateLimitError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('unavailable')
  );
}

/**
 * Generates content using the Gemini API Key Pool with automatic Round-Robin & Failover.
 * If Key #1 is rate limited or fails, it automatically falls over to Key #2, #3, etc.
 *
 * @param {object} options
 * @param {string} options.userPrompt - The prompt / message from the user.
 * @param {string} options.systemInstruction - The system prompt for the model.
 * @param {string} [options.model='gemini-2.5-flash'] - The Gemini model to use.
 * @returns {Promise<string>} The generated text response.
 */
export async function geminiGenerate({ userPrompt, systemInstruction, model = 'gemini-2.5-flash' }) {
  const totalKeys = geminiClients.length;
  let lastError = null;

  // Try across all keys in the pool starting from current round-robin index
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const activeIndex = (currentKeyIndex + attempt) % totalKeys;
    const { index, keyPreview, client } = geminiClients[activeIndex];

    try {
      const response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });

      if (response && response.text) {
        // Advance round-robin pointer for the next request
        currentKeyIndex = (activeIndex + 1) % totalKeys;
        return response.text.trim();
      }

      throw new Error('Received an empty text response from Gemini.');
    } catch (error) {
      lastError = error;
      const isLimit = isRateLimitError(error);

      console.warn(
        `[Gemini Pool] Key #${index} (${keyPreview}) ${isLimit ? 'hit rate limit / high demand' : 'failed'}: ${error.message}`
      );

      // If there are more keys in the pool, continue to the next key
      if (attempt < totalKeys - 1) {
        console.log(`[Gemini Pool] Auto-failover: Trying next Gemini key #${((activeIndex + 1) % totalKeys) + 1}...`);
      }
    }
  }

  // Advance pointer even on failure to avoid hitting the same exhausted key next time
  currentKeyIndex = (currentKeyIndex + 1) % totalKeys;
  throw lastError || new Error('All Gemini API keys in the pool failed.');
}
