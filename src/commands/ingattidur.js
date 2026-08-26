import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { generateSleepReminder } from '../services/aiService.js';

/**
 * Returns the appropriate sleep/wake type based on current time in Asia/Jakarta (WIB).
 *
 * @returns {string} The detected sleep context.
 */
function getJakartaSleepType() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()), 10);

  if (hour >= 5 && hour < 12) return 'Waktunya Bangun';
  if (hour >= 12 && hour < 18) return 'Tidur Siang';
  return 'Tidur Malam';
}

const SLEEP_ICONS = {
  'Waktunya Bangun': '⏰',
  'Tidur Siang': '💤',
  'Tidur Malam': '🛏️',
};

export const ingattidurCommand = {
  data: new SlashCommandBuilder()
    .setName('ingattidur')
    .setDescription('Pengingat tidur kocak dari AI — tag temanmu yang suka begadang atau dirimu sendiri!')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('Pilih teman yang mau disuruh tidur/diroast begadang (Default: dirimu sendiri)')
        .setRequired(false)
    ),

  /**
   * Executes the /ingattidur command.
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

    const sleepType = getJakartaSleepType();
    const icon = SLEEP_ICONS[sleepType] || '🌙';

    try {
      const reminderText = await generateSleepReminder(
        targetDisplayName,
        isSelf ? null : callerDisplayName,
        sleepType
      );

      const embed = new EmbedBuilder()
        .setColor('#5F27CD') // Night Purple
        .setTitle(`${icon} Woy, Waktunya ${sleepType}!`)
        .setDescription(`*"${reminderText}"*\n\n— **Tulalit** 🤖💙`)
        .setFooter({
          text: isSelf
            ? 'Pengingat Tidur • Stop overthinking & scroll HP 🌙'
            : `Pengingat Tidur • Dikirim atas permintaan ${callerDisplayName} 🌙`,
        })
        .setTimestamp();

      await interaction.editReply({
        content: `<@${targetUser.id}>`,
        embeds: [embed],
      });
    } catch (error) {
      console.error('[IngatTidur Command Error]:', error);
      await interaction.editReply({
        content: isSelf
          ? `Woy <@${targetUser.id}>! Udah jam segini masih melototin HP aja, taruh HP-nya dan buruan ${sleepType} sana! 🌙😴`
          : `Woy <@${targetUser.id}>! Disuruh ${sleepType} sama ${callerDisplayName} tuh, gak usah begadang nungguin chat yang gak bakal dibales! 🌙😴`,
      });
    }
  },
};
