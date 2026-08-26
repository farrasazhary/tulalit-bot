import { GROQ_API_KEY } from '../config/env.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

/**
 * Sends a chat completion request to the Groq API using native fetch.
 * Uses the OpenAI-compatible endpoint format.
 *
 * @param {string} systemPrompt - The system instruction for the AI.
 * @param {string} userMessage - The user's message/prompt.
 * @returns {Promise<string>} The AI's response text.
 */
export async function groqChat(systemPrompt, userMessage) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
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

  return text.trim();
}
