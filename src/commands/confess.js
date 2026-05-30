import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CONFESSION_CHANNEL_ID } from '../config/env.js';
import { getNextConfessionId } from '../services/confessionStore.js';

export const confessCommand = {
  data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Kirim confession atau pesan rahasia secara anonim ke channel confession')
    .addStringOption(option =>
      option.setName('pesan')
        .setDescription('Tulis pesan rahasiamu di sini (maksimal 1500 karakter)')
        .setRequired(true)
    ),

  /**
   * Executes the /confess slash command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The command interaction.
   */
  async execute(interaction) {
    // Acknowledge the interaction privately first
    await interaction.deferReply({ ephemeral: true });

    try {
      const confessionText = interaction.options.getString('pesan');

      // Fetch the target confession channel
      const targetChannel = interaction.client.channels.cache.get(CONFESSION_CHANNEL_ID);
      if (!targetChannel) {
        console.error(`[Confession Error] Confession channel ID "${CONFESSION_CHANNEL_ID}" not found in Discord cache.`);
        return await interaction.editReply({
          content: 'Waduh, maaf! Channel confession belum disetup dengan benar di bot. Hubungi admin server ya!',
          ephemeral: true,
        });
      }

      // Get sequential confession ID
      const confessionId = getNextConfessionId();

      // Build the premium pastel purple Embed
      const embed = new EmbedBuilder()
        .setColor('#A29BFE') // Soft pastel purple
        .setTitle(`🕊️ Confession #${confessionId}`)
        .setDescription(`*"${confessionText}"*`)
        .setTimestamp();

      // Post confession to target channel
      await targetChannel.send({
        embeds: [embed],
      });

      console.log(`[Confession Success] Posted confession #${confessionId} anonymously`);

      // Reply to user confirming success
      await interaction.editReply({
        content: `Confession rahasiamu berhasil dikirim ke <#${CONFESSION_CHANNEL_ID}>! 🕊️ (Nomor: #${confessionId})`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('[Confession Error] Failed to send confession:', error);
      await interaction.editReply({
        content: 'Terjadi kesalahan saat mengirim confession. Pastikan bot memiliki izin menulis di channel confession!',
        ephemeral: true,
      });
    }
  },
};
