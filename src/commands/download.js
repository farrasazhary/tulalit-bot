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

      let buffer = null;

      // Only attempt downloading stream buffer if direct link is available
      if (info.isDirectLink !== false) {
        try {
          let videoResponse = await fetch(info.videoUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            },
          });

          // Fallback for Instagram if primary offload URL returned non-200
          if (!videoResponse.ok && info.shortcode) {
            const fallbackUrl = `https://ddinstagram.com/videos/${info.shortcode}/1.mp4`;
            try {
              const fallbackRes = await fetch(fallbackUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                },
              });
              if (fallbackRes.ok) {
                videoResponse = fallbackRes;
                info.videoUrl = fallbackUrl;
              }
            } catch (e) {
              console.warn('[Download Command] Fallback fetch failed:', e.message);
            }
          }

          if (videoResponse.ok) {
            const arrayBuffer = await videoResponse.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
          }
        } catch (fetchErr) {
          console.warn('[Download Command] Buffer fetch failed, using button fallback:', fetchErr.message);
        }
      }
      const MAX_DISCORD_SIZE = 25 * 1024 * 1024; // 25 MB

      if (buffer && buffer.length <= MAX_DISCORD_SIZE && buffer.length > 0) {
        // Under 25MB limit: Try attaching directly to Discord message
        try {
          const attachment = new AttachmentBuilder(buffer, { name: 'tulalit-video.mp4' });

          const embed = new EmbedBuilder()
            .setColor('#FF9F43')
            .setTitle(`🎬 ${info.platform} Downloader`)
            .setDescription(`**${info.title.length > 200 ? info.title.slice(0, 197) + '...' : info.title}**\n\n> 👤 **Author:** ${info.author}\n> 📦 **Ukuran:** ${(buffer.length / (1024 * 1024)).toFixed(2)} MB\n\n💡 *Video diputar langsung di Discord (Ukuran <= 25MB).*`)
            .setTimestamp();

          if (info.cover) {
            embed.setThumbnail(info.cover);
          }

          await interaction.editReply({
            embeds: [embed],
            files: [attachment],
          });
          return;
        } catch (uploadError) {
          console.warn('[Download Command] Direct file upload failed/timed out, falling back to link button. Error:', uploadError.message);
        }
      }

      // Over 25MB limit OR upload fallback: Provide direct download link button
      const sizeText = buffer ? `${(buffer.length / (1024 * 1024)).toFixed(2)} MB` : 'HD Media';
      const embed = new EmbedBuilder()
        .setColor('#FF9F43')
        .setTitle(`🎬 ${info.platform} Downloader`)
        .setDescription(`**${info.title}**\n\n> 📦 **Ukuran:** ${sizeText}\n\n💡 *Disajikan via tombol Download HD agar dapat diputar/diunduh dengan cepat.*\nKlik tombol di bawah ini untuk memutar / mengunduh video!`)
        .setTimestamp();

      const downloadButton = new ButtonBuilder()
        .setLabel('📥 Download Video HD')
        .setStyle(ButtonStyle.Link)
        .setURL(info.videoUrl);

      const row = new ActionRowBuilder().addComponents(downloadButton);

      await interaction.editReply({
        embeds: [],
        content: null,
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error('[Download Command Error]:', error);
      await interaction.editReply({
        content: `❌ **Gagal mendownload video!**\n> ${error.message || 'Terjadi kesalahan saat memproses link video.'}\n\n*Pastikan link yang dimasukkan adalah link video publik dari TikTok, Instagram, Facebook, atau Twitter.*`,
      });
    }
  },
};
