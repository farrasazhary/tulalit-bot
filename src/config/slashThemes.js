/**
 * Themes focused specifically on modern youth issues, including romance,
 * quarter-life crisis, mental health, and social life.
 * Used exclusively for the /motivasi slash command.
 */
export const SLASH_THEMES = {
  asmara: 'asmara, patah hati, hubungan percintaan, dan menyembuhkan luka hati',
  masadepan: 'quarter-life crisis, kecemasan masa depan, karir, dan arah hidup',
  selflove: 'mencintai diri sendiri (self-love), mengatasi insecure, dan berdamai dengan kekurangan diri',
  burnout: 'burnout, kelelahan mental akibat ekspektasi, dan pentingnya istirahat',
  kesepian: 'rasa kesepian, hubungan pertemanan, dan menemukan support system yang tulus',
  produktivitas: 'melawan kemalasan, disiplin belajar, konsistensi mengejar mimpi, dan produktivitas',
  kegagalan: 'bangkit dari kegagalan, berani mencoba lagi, dan melihat kegagalan sebagai proses belajar',
};

/**
 * Choices array formatted for Discord API Slash Command options.
 */
export const SLASH_THEME_CHOICES = [
  { name: '💔 Asmara & Patah Hati', value: SLASH_THEMES.asmara },
  { name: '🚀 Karir & Masa Depan (Quarter-Life Crisis)', value: SLASH_THEMES.masadepan },
  { name: '🌱 Self-Love & Rasa Insecure', value: SLASH_THEMES.selflove },
  { name: '🔋 Burnout & Kelelahan Mental', value: SLASH_THEMES.burnout },
  { name: '🤝 Hubungan Sosial & Kesepian', value: SLASH_THEMES.kesepian },
  { name: '🔥 Kemalasan & Produktivitas', value: SLASH_THEMES.produktivitas },
  { name: '🌈 Bangkit dari Kegagalan', value: SLASH_THEMES.kegagalan },
];
