import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { generateMotivation } from '../services/aiService.js';
import { SLASH_THEMES, SLASH_THEME_CHOICES } from '../config/slashThemes.js';

export const motivasiCommand = {
  data: new SlashCommandBuilder()
    .setName('motivasi')
    .setDescription('Dapatkan kutipan motivasi harian yang menyentuh hati')
    .addStringOption(option =>
      option.setName('tema')
        .setDescription('Pilih tema spesifik terkait asmara, karir, atau diri sendiri (opsional)')
        .setRequired(false)
        .addChoices(...SLASH_THEME_CHOICES)
    ),

  /**
   * Executes the /motivasi slash command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    // Defer the reply since generating AI content can take a couple of seconds,
    // and Discord commands require a response within 3 seconds.
    await interaction.deferReply();

    try {
      // Get the selected theme from command option, or select a random youth theme
      let theme = interaction.options.getString('tema');
      if (!theme) {
        const themesArray = Object.values(SLASH_THEMES);
        theme = themesArray[Math.floor(Math.random() * themesArray.length)];
      }

      console.log(`[Slash Command] User "${interaction.user.tag}" requested quote for theme: "${theme}"`);

      // Generate the motivational quote from AI
      const quote = await generateMotivation(theme);

      // Build the premium light orange Embed card
      const embed = new EmbedBuilder()
        .setColor('#FF9F43') // Bold light orange border
        .setTitle('✨ Quotes Motivasi :')
        .setDescription(`*"${quote}"*\n\n— **Tulalit**`)
        .setTimestamp();

      // Send the embed as the deferred reply
      await interaction.editReply({
        embeds: [embed],
      });

      console.log(`[Slash Command Success] Replied to user "${interaction.user.tag}"`);
    } catch (error) {
      console.error('[Slash Command Error] Failed to execute motivasi command:', error);
      
      // Notify the user about the error (ephemerally so it doesn't clutter the chat)
      await interaction.editReply({
        content: 'Maaf, terjadi kesalahan saat mencoba mendapatkan motivasi. Silakan coba beberapa saat lagi!',
        ephemeral: true,
      });
    }
  },
};
