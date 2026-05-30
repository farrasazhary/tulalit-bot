import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { generateCurhatResponse } from '../services/curhatService.js';

export const curhatCommand = {
  data: new SlashCommandBuilder()
    .setName('curhat')
    .setDescription('Tumpahkan keluh kesahmu secara privat kepada Tulalit')
    .addStringOption(option =>
      option.setName('pesan')
        .setDescription('Tulis curhatanmu di sini (hanya Anda yang dapat melihat pesan ini)')
        .setRequired(true)
    ),

  /**
   * Executes the /curhat command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction.
   */
  async execute(interaction) {
    // Keep it private (ephemeral) so other users can't see the curhat or the bot's response
    await interaction.deferReply({ ephemeral: true });

    try {
      const userMessage = interaction.options.getString('pesan');
      
      console.log(`[Slash Command] User "${interaction.user.tag}" triggered /curhat`);

      // Generate the empathetic response from the AI
      const response = await generateCurhatResponse(userMessage);

      // Build the calming soft blue Embed
      const embed = new EmbedBuilder()
        .setColor('#74B9FF') // Soft therapeutic blue
        .setTitle('💙 Ruang Curhat Tulalit')
        .addFields(
          { name: 'Curhatanmu:', value: `*"${userMessage}"*` },
          { name: 'Balasan Tulalit:', value: response }
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
      });

      console.log(`[Slash Command Success] Responded to /curhat from "${interaction.user.tag}"`);
    } catch (error) {
      console.error('[Slash Command Error] Failed in /curhat:', error);
      await interaction.editReply({
        content: 'Aduh, maaf ya. Tulalit sedang agak pusing, coba kirim curhatannya beberapa saat lagi ya. 🥺',
        ephemeral: true,
      });
    }
  },
};
