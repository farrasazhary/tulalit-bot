import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const requiredEnv = ['DISCORD_TOKEN', 'CHANNEL_ID', 'CONFESSION_CHANNEL_ID'];
const missingEnv = [];

for (const key of requiredEnv) {
  if (!process.env[key] || process.env[key].trim() === '') {
    missingEnv.push(key);
  }
}

// Parse Gemini API Keys (supports AI_API_KEYS="key1,key2" or AI_API_KEY="key1")
const rawGeminiKeys = process.env.AI_API_KEYS || process.env.AI_API_KEY || '';
const geminiKeys = rawGeminiKeys
  .split(',')
  .map((k) => k.trim())
  .filter((k) => k.length > 0);

if (geminiKeys.length === 0) {
  missingEnv.push('AI_API_KEY or AI_API_KEYS');
}

if (missingEnv.length > 0) {
  const errorMessage = `Missing required environment variables: ${missingEnv.join(', ')}`;
  console.error(`[FATAL] ${errorMessage}`);
  throw new Error(errorMessage);
}

// Parse Groq API Keys (supports GROQ_API_KEYS="key1,key2" or GROQ_API_KEY="key1")
const rawGroqKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
const groqKeys = rawGroqKeys
  .split(',')
  .map((k) => k.trim())
  .filter((k) => k.length > 0);

/**
 * Validated Discord Bot Token
 * @type {string}
 */
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

/**
 * Target Discord Channel ID
 * @type {string}
 */
export const CHANNEL_ID = process.env.CHANNEL_ID;

/**
 * Target Confession Channel ID
 * @type {string}
 */
export const CONFESSION_CHANNEL_ID = process.env.CONFESSION_CHANNEL_ID;

/**
 * Primary Google Gen AI API Key (First available)
 * @type {string}
 */
export const AI_API_KEY = geminiKeys[0];

/**
 * All Google Gen AI API Keys Pool
 * @type {string[]}
 */
export const GEMINI_API_KEYS = geminiKeys;

/**
 * Primary Groq AI API Key (First available)
 * @type {string|undefined}
 */
export const GROQ_API_KEY = groqKeys[0] || undefined;

/**
 * All Groq AI API Keys Pool
 * @type {string[]}
 */
export const GROQ_API_KEYS = groqKeys;

/**
 * Web Server Port Configuration
 * @type {number}
 */
export const PORT = parseInt(process.env.PORT || '3005', 10);

