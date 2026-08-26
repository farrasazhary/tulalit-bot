import { GROQ_API_KEYS } from '../config/env.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

let currentGroqIndex = 0;

/**
 * Sends a chat completion request to the Groq API using the Groq API Key Pool.
 * Supports automatic Round-Robin & Failover if multiple Groq keys are configured.
 *
 * @param {string} systemPrompt - The system instruction for the AI.
 * @param {string} userMessage - The user's message/prompt.
 * @returns {Promise<string>} The AI's response text.
 */
export async function groqChat(systemPrompt, userMessage) {
  if (!GROQ_API_KEYS || GROQ_API_KEYS.length === 0) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const totalKeys = GROQ_API_KEYS.length;
  let lastError = null;

  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const activeIndex = (currentGroqIndex + attempt) % totalKeys;
    const apiKey = GROQ_API_KEYS[activeIndex];
    const keyPreview = `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.8,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('Received an empty response from Groq API.');
      }

      currentGroqIndex = (activeIndex + 1) % totalKeys;
      return text.trim();
    } catch (error) {
      lastError = error;
      console.warn(`[Groq Pool] Key #${activeIndex + 1} (${keyPreview}) failed: ${error.message}`);

      if (attempt < totalKeys - 1) {
        console.log(`[Groq Pool] Auto-failover: Trying next Groq key #${((activeIndex + 1) % totalKeys) + 1}...`);
      }
    }
  }

  currentGroqIndex = (currentGroqIndex + 1) % totalKeys;
  throw lastError || new Error('All Groq API keys in the pool failed.');
}

