import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import { CHANNEL_ID } from '../config/env.js';

/**
 * Creates a visual progress bar chart using block characters.
 *
 * @param {number} count - The count for this specific reaction.
 * @param {number} total - The total reactions count.
 * @returns {string} The formatted progress bar.
 */
function createProgressBar(count, total) {
  const maxBlocks = 10;
  if (total === 0) return '░░░░░░░░░░ 0 (0%)';
  const filledBlocks = Math.round((count / total) * maxBlocks);
  const emptyBlocks = maxBlocks - filledBlocks;
  const percentage = Math.round((count / total) * 100);
  return `${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)} **${count}** orang (${percentage}%)`;
}

/**
 * Starts the weekly mood tracking report job.
 * Runs every Sunday at 08:00 PM (20:00) Asia/Jakarta.
 *
 * @param {import('discord.js').Client} client - The Discord client.
 */
export function startWeeklyMoodJob(client) {
  console.log('[Scheduler] Initializing weekly mood report job scheduled for Sundays at 08:00 PM Asia/Jakarta.');

  cron.schedule(
    '0 20 * * 0', // 20:00 on Sunday
    async () => {
      console.log('[Scheduler] Triggered weekly mood report job.');
      try {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) {
          console.error(`[Scheduler Error] Target channel ID "${CHANNEL_ID}" not found in Discord cache.`);
          return;
        }

        // Fetch last 100 messages to cover the week
        const messages = await channel.messages.fetch({ limit: 100 });
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        // Filter for messages sent by this bot that are daily quotes from the past 7 days
        const dailyQuotes = messages.filter(msg => {
          const isBot = msg.author.id === client.user.id;
          const isQuote = msg.embeds.length > 0 && msg.embeds[0].title === '✨ Quotes Hari Ini :';
          const isRecent = msg.createdTimestamp >= sevenDaysAgo;
          return isBot && isQuote && isRecent;
        });

        console.log(`[Scheduler] Found ${dailyQuotes.size} daily quote messages from the last 7 days.`);

        let stats = {
          '😊': 0,
          '😐': 0,
          '😢': 0,
          '😡': 0,
        };

        // Aggregate reaction counts (ignoring the bot's own self-reactions)
        for (const msg of dailyQuotes.values()) {
          for (const emoji of Object.keys(stats)) {
            const reaction = msg.reactions.cache.get(emoji);
            if (reaction) {
              const botReacted = reaction.me;
              const count = reaction.count || 0;
              // Subtract 1 if the bot itself reacted to create the option
              stats[emoji] += botReacted ? Math.max(0, count - 1) : count;
            }
          }
        }

        const totalVotes = Object.values(stats).reduce((a, b) => a + b, 0);
        console.log(`[Scheduler] Aggregated ${totalVotes} total mood reactions.`);

        // Build the Embed report
        const embed = new EmbedBuilder()
          .setColor('#00CEC9') // Therapeutic turquoise/green
          .setTitle('📊 Laporan Mood Mingguan Server')
          .setDescription(`Berikut adalah rangkuman suasana hati (mood) warga server dari reaksi quotes harian selama seminggu terakhir.\n\nTotal kontribusi: **${totalVotes}** suara.`)
          .addFields(
            { name: '😊 Senang / Terinspirasi', value: createProgressBar(stats['😊'], totalVotes) },
            { name: '😐 Biasa Saja / Tenang', value: createProgressBar(stats['😐'], totalVotes) },
            { name: '😢 Sedih / Lelah', value: createProgressBar(stats['😢'], totalVotes) },
            { name: '😡 Kesal / Stress', value: createProgressBar(stats['😡'], totalVotes) }
          )
          .setTimestamp();

        await channel.send({
          embeds: [embed],
        });

        console.log('[Scheduler Success] Weekly mood report posted successfully.');
      } catch (error) {
        console.error('[Scheduler Error] Failed to generate weekly mood report:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Jakarta',
    }
  );
}
