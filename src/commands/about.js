import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const aboutCommand = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Tampilkan informasi pengenal dan mengenai bot Tulalit'),

  /**
   * Executes the /about command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction.
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF9F43')
      .setTitle('🤖 Tentang Bot Tulalit')
      .setDescription(
        'Hai! Aku **Tulalit**, bot teman virtual multiguna yang siap meramaikan dan menemani komunitas server Discord kamu! 💙\n\n' +
        'Berikut adalah ringkasan fitur utama & cara kerja bot:'
      )
      .addFields(
        {
          name: '✨ Motivasi AI & Daily Quotes',
          value: '• Kutipan motivasi puitis harian setiap jam 07:00 pagi WIB.\n• Bisa panggil kapan saja via `/motivasi [tema]`.',
        },
        {
          name: '💙 Curhat Privat & Confession Anonim',
          value: '• `/curhat <pesan>`: Curhat privat 100% rahasia ke AI Tulalit (hanya kamu yang bisa lihat).\n• `/confess <pesan>`: Kirim pesan anonim rahasia ke channel confession.',
        },
        {
          name: '📊 Mood Tracker Server',
          value: '• Rekap ekspresi & mood mingguan server setiap hari Minggu jam 20:00 WIB.',
        },
        {
          name: '🎬 Social Media Downloader (`/download`)',
          value: '• **Video <= 25MB**: Otomatis di-stream & di-upload langsung di chat Discord agar bisa diputar langsung.\n• **Video > 25MB / Server Sibuk**: Disajikan berupa tombol **Download HD** menuju video beresolusi tinggi.',
        }
      )
      .setFooter({ text: 'Tulalit Bot • Ketik /help untuk panduan perintah lengkap' })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
