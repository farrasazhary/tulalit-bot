import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  AttachmentBuilder 
} from 'discord.js';
import { downloadVideo } from '../services/videoDownloader.js';

export const downloadCommand = {
  data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Download video dari TikTok (Tanpa WM), Instagram, Facebook, atau Twitter')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('Link URL video (TikTok, Instagram Reels, Facebook, Twitter)')
        .setRequired(true)
    ),

  /**
   * Executes the /download command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction.
   */
  async execute(interaction) {
    const rawUrl = interaction.options.getString('url', true).trim();

    // Basic URL validation
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      return interaction.reply({
        content: '❌ Link tidak valid! Pastikan link diawali dengan `http://` atau `https://`.',
        ephemeral: true,
      });
    }

    // Defer reply as downloading media might take a couple seconds
    await interaction.deferReply();

    try {
      // Resolve video download details
      const info = await downloadVideo(rawUrl);

      // Fetch the video file to check size and create buffer
      const videoResponse = await fetch(info.videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Gagal mengunduh berkas media (HTTP ${videoResponse.status}).`);
      }

      const arrayBuffer = await videoResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const MAX_DISCORD_SIZE = 25 * 1024 * 1024; // 25 MB

      if (buffer.length <= MAX_DISCORD_SIZE && buffer.length > 0) {
        // Under 25MB limit: Attach directly to Discord message
        const attachment = new AttachmentBuilder(buffer, { name: 'tulalit-video.mp4' });

        const embed = new EmbedBuilder()
          .setColor('#FF9F43')
          .setTitle(`🎬 ${info.platform} Downloader`)
          .setDescription(`**${info.title.length > 200 ? info.title.slice(0, 197) + '...' : info.title}**\n\n> 👤 **Author:** ${info.author}\n> 📦 **Ukuran:** ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`)
          .setTimestamp();

        if (info.cover) {
          embed.setThumbnail(info.cover);
        }

        await interaction.editReply({
          embeds: [embed],
          files: [attachment],
        });
      } else {
        // Over 25MB limit: Provide direct download link button
        const embed = new EmbedBuilder()
          .setColor('#FF9F43')
          .setTitle(`🎬 ${info.platform} Downloader`)
          .setDescription(`**${info.title}**\n\n⚠️ Ukuran video (**${(buffer.length / (1024 * 1024)).toFixed(2)} MB**) melebihi batas attachment Discord (25 MB).\nKlik tombol di bawah untuk mengunduh video HD secara langsung!`)
          .setTimestamp();

        const downloadButton = new ButtonBuilder()
          .setLabel('📥 Download Video HD')
          .setStyle(ButtonStyle.Link)
          .setURL(info.videoUrl);

        const row = new ActionRowBuilder().addComponents(downloadButton);

        await interaction.editReply({
          embeds: [embed],
          components: [row],
        });
      }
    } catch (error) {
      console.error('[Download Command Error]:', error);
      await interaction.editReply({
        content: `❌ **Gagal mendownload video!**\n> ${error.message || 'Terjadi kesalahan saat memproses link video.'}\n\n*Pastikan link yang dimasukkan adalah link video publik dari TikTok, Instagram, Facebook, atau Twitter.*`,
      });
    }
  },
};
