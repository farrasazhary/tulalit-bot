import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { generateBathReminder } from '../services/aiService.js';

/**
 * Returns the appropriate bath type based on current time in Asia/Jakarta (WIB).
 *
 * @returns {string} The detected bath context.
 */
function getJakartaBathType() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()), 10);

  if (hour >= 5 && hour < 12) return 'Mandi Pagi';
  if (hour >= 12 && hour < 18) return 'Mandi Sore';
  return 'Mandi Malam';
}

const BATH_ICONS = {
  'Mandi Pagi': '🚿',
  'Mandi Sore': '🧼',
  'Mandi Malam': '🛁',
};

export const ingatmandiCommand = {
  data: new SlashCommandBuilder()
    .setName('ingatmandi')
    .setDescription('Pengingat mandi kocak dari AI — tag temanmu atau dirimu sendiri!')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('Pilih teman yang mau diingatkan mandi (Default: dirimu sendiri)')
        .setRequired(false)
    ),

  /**
   * Executes the /ingatmandi command.
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction - The interaction.
   */
  async execute(interaction) {
    // Defer reply as AI generation takes 1-3 seconds
    await interaction.deferReply();

    const caller = interaction.user;
    const targetUser = interaction.options.getUser('target') || caller;
    const isSelf = targetUser.id === caller.id;

    // Get display names
    const callerDisplayName = interaction.member?.displayName || caller.displayName || caller.username;
    let targetDisplayName = targetUser.displayName || targetUser.username;

    if (interaction.guild && !isSelf) {
      try {
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        if (targetMember) targetDisplayName = targetMember.displayName;
      } catch {
        // Fallback to user displayName
      }
    }

    const bathType = getJakartaBathType();
    const icon = BATH_ICONS[bathType] || '🚿';

    try {
      const reminderText = await generateBathReminder(
        targetDisplayName,
        isSelf ? null : callerDisplayName,
        bathType
      );

      const embed = new EmbedBuilder()
        .setColor('#00D2D3') // Fresh Aqua Cyan
        .setTitle(`${icon} Woy, Waktunya ${bathType}!`)
        .setDescription(`*"${reminderText}"*\n\n— **Tulalit** 🤖💙`)
        .setFooter({
          text: isSelf
            ? 'Pengingat Mandi • Biar gak bau kasur & tetep wangi 🧼'
            : `Pengingat Mandi • Dikirim atas permintaan ${callerDisplayName} 🧼`,
        })
        .setTimestamp();

      await interaction.editReply({
        content: `<@${targetUser.id}>`,
        embeds: [embed],
      });
    } catch (error) {
      console.error('[IngatMandi Command Error]:', error);
      await interaction.editReply({
        content: isSelf
          ? `Woy <@${targetUser.id}>! Badan lo udah mulai lecek tuh dari tadi, buruan ${bathType} sana biar seger & wangi! 🧼🚿`
          : `Woy <@${targetUser.id}>! Kata ${callerDisplayName} badan lo udah mulai lecek tuh, buruan ${bathType} sana biar seger & wangi! 🧼🚿`,
      });
    }
  },
};
