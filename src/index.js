import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { DISCORD_TOKEN } from './config/env.js';
import { startDailyQuoteJob } from './jobs/dailyQuote.js';
import { motivasiCommand } from './commands/motivasi.js';
import { curhatCommand } from './commands/curhat.js';
import { confessCommand } from './commands/confess.js';
import { startWeeklyMoodJob } from './jobs/weeklyMoodReport.js';

// Setup global error handling to prevent silent failure
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Global Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Global Error] Uncaught Exception thrown:', error);
});

// Initialize the Discord Client with Guilds, Messages, and Reactions intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Map to store registered slash commands
const commands = new Map();
commands.set(motivasiCommand.data.name, motivasiCommand);
commands.set(curhatCommand.data.name, curhatCommand);
commands.set(confessCommand.data.name, confessCommand);

// Listen for slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[Error] Execution failed for command /${interaction.commandName}:`, error);
    
    // Wrap the error response in a try-catch to prevent crashing the bot
    // if the interaction token has already expired (e.g. due to lag or startup delay)
    try {
      const replyPayload = {
        content: 'Terjadi kesalahan saat menjalankan perintah ini.',
        ephemeral: true,
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(replyPayload);
      } else {
        await interaction.reply(replyPayload);
      }
    } catch (replyError) {
      console.error('[Error] Failed to send error response to Discord (interaction might have expired):', replyError);
    }
  }
});

// On Ready event
client.once('ready', async () => {
  console.log(`[Discord Bot] Successfully logged in as ${client.user.tag}!`);

  // Register slash commands automatically on startup
  try {
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    console.log('[Discord Bot] Registering global slash commands...');
    
    const commandData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commandData }
    );
    
    console.log('[Discord Bot] Successfully registered global slash commands!');
  } catch (error) {
    console.error('[Discord Bot] Error registering slash commands:', error);
  }
  
  // Initialize scheduled jobs
  startDailyQuoteJob(client);
  startWeeklyMoodJob(client);
});

// Log in the client
console.log('[Discord Bot] Authenticating with Discord...');
client.login(DISCORD_TOKEN);
