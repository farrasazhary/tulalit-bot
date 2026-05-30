import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import { CHANNEL_ID } from '../config/env.js';
import { generateMotivation } from '../services/aiService.js';

// Map day of the week (0-6) to specific Indonesian themes
const DAILY_THEMES = {
  1: 'Logika, membangun fondasi masa depan, dan dedikasi memecahkan masalah',
  2: 'Kesabaran, menjaga komitmen, dan keteguhan hati menjembatani jarak',
  3: 'Strategi, menghadapi tantangan berat, dan bangkit dari kalah',
  4: 'Empati, menjadi secercah harapan di tengah badai, dan merawat kehidupan',
  5: 'Imajinasi, kreativitas, dan mewujudkan visi menjadi realitas',
  6: 'Refleksi diri dan mensyukuri perjalanan',
  0: 'Istirahat, memulihkan energi, dan kedamaian batin',
};

/**
 * Starts the daily motivational quote cron job.
 * Schedules a task to run every day at 07:00 AM (Asia/Jakarta timezone).
 *
 * @param {import('discord.js').Client} discordClient - The Discord client instance.
 */
export function startDailyQuoteJob(discordClient) {
  console.log('[Scheduler] Initializing daily motivational quote job scheduled for 07:00 AM Asia/Jakarta.');

  cron.schedule(
    '0 7 * * *',
    async () => {
      console.log('[Scheduler] Triggered daily motivational quote job.');
      try {
        // Fetch target channel from the cache
        const channel = discordClient.channels.cache.get(CHANNEL_ID);
        if (!channel) {
          console.error(`[Scheduler Error] Target channel ID "${CHANNEL_ID}" not found in Discord cache.`);
          return;
        }

        // Determine today's theme based on day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = new Date().getDay();
        const todayTheme = DAILY_THEMES[dayOfWeek];
        console.log(`[Scheduler] Today's theme (${dayOfWeek}): "${todayTheme}"`);

        // Generate motivation quote
        const quote = await generateMotivation(todayTheme);

        // Build premium Embed card
        const embed = new EmbedBuilder()
          .setColor('#FF9F43') // Bold light orange border
          .setTitle('✨ Quotes Hari Ini :')
          .setDescription(`*"${quote}"*\n\n— **Tulalit**`)
          .setTimestamp();

        // Send Embed with @everyone mention to ping members
        const message = await channel.send({
          content: '@everyone',
          embeds: [embed],
        });

        // Add default reactions for mood tracking
        try {
          await message.react('😊');
          await message.react('😐');
          await message.react('😢');
          await message.react('😡');
        } catch (reactError) {
          console.error('[Scheduler Warning] Failed to add reactions for mood tracking:', reactError);
        }

        console.log(`[Scheduler Success] Daily motivation successfully sent to channel "${CHANNEL_ID}": "${quote}"`);
      } catch (error) {
        console.error('[Scheduler Error] Error executing daily motivational quote job:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Jakarta',
    }
  );
}
