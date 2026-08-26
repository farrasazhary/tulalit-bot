import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { generateMealReminder } from '../services/aiService.js';

/**
 * Returns the appropriate meal type based on current time in Asia/Jakarta (WIB).
 *
 * @returns {string} The detected meal type.
 */
function getJakartaMealType() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()), 10);

  if (hour >= 5 && hour < 10) return 'Sarapan';
  if (hour >= 10 && hour < 15) return 'Makan Siang';
  if (hour >= 15 && hour < 18) return 'Ngemil Sore';
  if (hour >= 18 && hour < 23) return 'Makan Malam';
  return 'Makan Tengah Malam';
}

const MEAL_CONFIG = {
  'Sarapan': { icon: '🍳', label: 'Sarapan' },
  'Makan Siang': { icon: '🍜', label: 'Makan Siang' },
  'Ngemil Sore': { icon: '🍿', label: 'Ngemil Sore' },
  'Makan Malam': { icon: '🍛', label: 'Makan Malam' },
  'Makan Tengah Malam': { icon: '🌙', label: 'Makan Tengah Malam' },
};

export const ingatmakanCommand = {
  data: new SlashCommandBuilder()
    .setName('ingatmakan')
    .setDescription('Pengingat makan buat lo semua wok'),

  /**
   * Executes the /ingatmakan command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction.
   */
  async execute(interaction) {
    // Defer reply as AI generation might take 1-3 seconds
    await interaction.deferReply();

    const mealType = getJakartaMealType();
    const config = MEAL_CONFIG[mealType] || { icon: '🍽️', label: mealType };

    // Get user's display name or username
    const user = interaction.user;
    const displayName = interaction.member?.displayName || user.displayName || user.username;

    try {
      // Generate AI reminder
      const reminderText = await generateMealReminder(displayName, config.label);

      const embed = new EmbedBuilder()
        .setColor('#FF9F43')
        .setTitle(`${config.icon} Woy, Waktunya ${config.label}!`)
        .setDescription(`*"${reminderText}"*\n\n— **Tulalit** 🤖💙`)
        .setFooter({ text: 'Pengingat Makan Jomblo • Biar gak cuma makan ati 💔' })
        .setTimestamp();

      // Send publicly tagging the user who invoked the command
      await interaction.editReply({
        content: `<@${user.id}>`,
        embeds: [embed],
      });
    } catch (error) {
      console.error('[IngatMakan Command Error]:', error);
      await interaction.editReply({
        content: `Woy <@${user.id}>! Gak ada ayang yang ngingetin bukan berarti boleh skip ${config.label} ya! Buruan isi bensin dulu sana! 🍽️💔`,
      });
    }
  },
};
