import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Tampilkan panduan lengkap penggunaan bot Tulalit'),

  /**
   * Executes the /help command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction.
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF9F43')
      .setTitle('📖 Panduan Bot Tulalit')
      .setDescription('Hai! Aku **Tulalit**, teman virtualmu yang siap menemani hari-harimu. Berikut adalah daftar fitur yang bisa kamu gunakan:')
      .addFields(
        {
          name: '✨ /motivasi [tema]',
          value: '> Dapatkan kutipan motivasi dari AI.\n> Pilih tema spesifik dari dropdown (asmara, karir, self-love, dll) atau biarkan kosong untuk tema acak.\n> *Contoh:* `/motivasi` atau `/motivasi tema: 💔 Patah Hati`',
        },
        {
          name: '💙 /curhat <pesan>',
          value: '> Ceritakan keluh kesahmu secara **privat** ke Tulalit.\n> Tulalit akan merespons dengan empati dan dukungan. Pesan hanya terlihat olehmu.\n> *Contoh:* `/curhat pesan: aku lagi capek banget akhir-akhir ini`',
        },
        {
          name: '🕊️ /confess <pesan>',
          value: '> Kirim pesan rahasia secara **anonim** ke channel confession.\n> Identitasmu dijamin aman, tidak ada yang tahu siapa pengirimnya.\n> *Contoh:* `/confess pesan: aku diam-diam suka sama temen sekelas`',
        },
        {
          name: '📊 Mood Tracker',
          value: '> Setiap pagi jam 07:00 WIB, Tulalit mengirim quotes harian dengan 4 emoji reaksi.\n> Klik emoji yang sesuai mood kamu: 😊 😐 😢 😡\n> Setiap **Minggu malam jam 20:00**, Tulalit akan merangkum mood mingguan server!',
        },
        {
          name: '❓ /help',
          value: '> Menampilkan panduan ini.',
        }
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
