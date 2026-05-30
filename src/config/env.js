import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const requiredEnv = ['DISCORD_TOKEN', 'CHANNEL_ID', 'CONFESSION_CHANNEL_ID', 'AI_API_KEY'];
const missingEnv = [];

for (const key of requiredEnv) {
  if (!process.env[key] || process.env[key].trim() === '') {
    missingEnv.push(key);
  }
}

if (missingEnv.length > 0) {
  const errorMessage = `Missing required environment variables: ${missingEnv.join(', ')}`;
  console.error(`[FATAL] ${errorMessage}`);
  throw new Error(errorMessage);
}

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
 * Google Gen AI API Key
 * @type {string}
 */
export const AI_API_KEY = process.env.AI_API_KEY;
