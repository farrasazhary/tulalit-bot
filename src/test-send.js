import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { DISCORD_TOKEN, CHANNEL_ID } from './config/env.js';
import { generateMotivation } from './services/aiService.js';

console.log('[Test] Initiating test run...');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log(`[Test] Logged in as ${client.user.tag}.`);
  console.log(`[Test] Fetching channel ${CHANNEL_ID}...`);

  try {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) {
      console.error(`[Test Error] Channel ID "${CHANNEL_ID}" was not found in the bot's cache.`);
      console.error('Make sure the bot is invited to the server and has access to this channel.');
      client.destroy();
      process.exit(1);
    }

    // Map day of the week (0-6) to specific Indonesian themes
    const DAILY_THEMES = {
      1: 'Logika, membangun fondasi masa depan, dan dedikasi memecahkan masalah',
      2: 'Kesabaran, menjaga komitmen, dan keteguhan hati menjembatani jarak',
      3: 'Strategi, menghadapi tantangan berat, dan bangkit dari kekalahan',
      4: 'Empati, menjadi secercah harapan di tengah badai, dan merawat kehidupan',
      5: 'Imajinasi, kreativitas, dan mewujudkan visi menjadi realitas',
      6: 'Refleksi diri dan mensyukuri perjalanan',
      0: 'Istirahat, memulihkan energi, dan kedamaian batin',
    };

    const dayOfWeek = new Date().getDay();
    const todayTheme = DAILY_THEMES[dayOfWeek];
    console.log(`[Test] Today's theme (${dayOfWeek}): "${todayTheme}"`);

    console.log('[Test] Generating motivation quote from Gemini...');
    const quote = await generateMotivation(todayTheme);

    console.log(`[Test] Sending message to channel...`);

    // Build test Embed card
    const embed = new EmbedBuilder()
      .setColor('#FF9F43') // Bold light orange border
      .setTitle('✨ Quotes Hari Ini :')
      .setDescription(`*"${quote}"*\n\n— **Tulalit**`)
      .setTimestamp();

    await channel.send({
      content: '@everyone',
      embeds: [embed],
    });

    console.log('[Test Success] Message sent successfully!');
    client.destroy();
    process.exit(0);
  } catch (error) {
    console.error('[Test Error] An error occurred during the test run:', error);
    client.destroy();
    process.exit(1);
  }
});

client.login(DISCORD_TOKEN);
