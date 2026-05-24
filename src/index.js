import { Client, GatewayIntentBits } from 'discord.js';
import { DISCORD_TOKEN } from './config/env.js';
import { startDailyQuoteJob } from './jobs/dailyQuote.js';

// Setup global error handling to prevent silent failure
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Global Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Global Error] Uncaught Exception thrown:', error);
});

// Initialize the Discord Client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// On Ready event
client.once('ready', () => {
  console.log(`[Discord Bot] Successfully logged in as ${client.user.tag}!`);
  
  // Initialize scheduled jobs
  startDailyQuoteJob(client);
});

// Log in the client
console.log('[Discord Bot] Authenticating with Discord...');
client.login(DISCORD_TOKEN);
