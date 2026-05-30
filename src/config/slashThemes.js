/**
 * Themes focused specifically on modern youth issues, including romance,
 * quarter-life crisis, mental health, and social life.
 * Used exclusively for the /motivasi slash command.
 */
export const SLASH_THEMES = {
  jatuh_cinta: 'jatuh cinta, menaruh harapan, keindahan awal hubungan, dan membuka hati',
  patah_hati: 'patah hati, kesedihan setelah berpisah, kekecewaan, dan memproses rasa sakit',
  move_on: 'proses move on, merelakan masa lalu, dan melangkah maju mencari kebahagiaan baru',
  cinta_sebelah: 'cinta bertepuk sebelah tangan, perasaan tidak terbalas, pertemanan (friendzone), dan keikhlasan',
  ldr: 'LDR (hubungan jarak jauh), rindu, menjaga kepercayaan di tengah jarak, dan komitmen',
  toxic_relationship: 'toxic relationship, keberanian keluar dari hubungan merusak, dan menyadari red flags',
  overthinking: 'overthinking, meredakan kecemasan pikiran, beristirahat dari kekhawatiran berlebih',
  insecure: 'mengatasi insecure, rasa tidak percaya diri, membandingkan diri, dan mengapresiasi diri sendiri',
  self_love: 'mencintai diri sendiri (self-love), menerima kekurangan, dan berdamai dengan masa lalu',
  burnout: 'burnout, lelah mental karena terlalu memaksa diri, dan pentingnya jeda istirahat',
  healing: 'healing, memulihkan luka batin, mencari ketenangan jiwa, dan berproses menjadi utuh',
  people_pleasing: 'menghentikan people pleasing, berani berkata tidak, dan membangun batasan diri yang sehat',
  kesepian: 'mengatasi rasa kesepian, merasa sendirian di tengah keramaian, dan menemukan ketenangan',
  akademik: 'tekanan akademik, stress kuliah/sekolah, tugas menumpuk, dan menjaga motivasi belajar',
  quarter_life: 'quarter-life crisis, kebingungan arah hidup di usia 20-an, dan berdamai dengan ketidakpastian',
  imposter: 'mengatasi imposter syndrome, meragukan kesuksesan sendiri, dan meyakinkan diri atas kemampuan',
  fresh_grad: 'perjuangan fresh graduate, mencari kerja pertama, menghadapi penolakan, dan ketabahan',
  toxic_friend: 'pertemanan toxic, menyadari teman palsu, dan keberanian membatasi pergaulan buruk',
  social_comparison: 'membandingkan hidup di media sosial, melepaskan ekspektasi semu, dan fokus pada jalur sendiri',
  support_system: 'pentingnya support system, mencari teman seperjuangan, dan terbuka menerima bantuan',
  bangkit: 'bangkit dari kegagalan, bangkit setelah jatuh, keberanian mencoba lagi, dan kegigihan',
  zona_nyaman: 'keluar dari zona nyaman, keberanian mencoba tantangan baru, dan tidak takut bertumbuh',
  konsistensi: 'disiplin harian, konsistensi dalam usaha kecil, dan tidak menyerah di tengah jalan',
  bersyukur: 'bersyukur atas hal kecil hari ini, meredakan ambisi melelahkan, dan menikmati proses',
  kemandirian: 'belajar mandiri, ngekos, jauh dari orang tua, dan kedewasaan hidup sendiri',
};

/**
 * Choices array formatted for Discord API Slash Command options.
 * Max 25 choices allowed by Discord API.
 */
export const SLASH_THEME_CHOICES = [
  // Romansa & Hubungan
  { name: '💕 Jatuh Cinta', value: SLASH_THEMES.jatuh_cinta },
  { name: '💔 Patah Hati', value: SLASH_THEMES.patah_hati },
  { name: '🚶 Move On', value: SLASH_THEMES.move_on },
  { name: '🥀 Cinta Bertepuk Sebelah Tangan', value: SLASH_THEMES.cinta_sebelah },
  { name: '🌏 LDR (Hubungan Jarak Jauh)', value: SLASH_THEMES.ldr },
  { name: '⛓️ Toxic Relationship', value: SLASH_THEMES.toxic_relationship },

  // Kesehatan Mental
  { name: '🌀 Overthinking', value: SLASH_THEMES.overthinking },
  { name: '😶 Insecurity & Percaya Diri', value: SLASH_THEMES.insecure },
  { name: '🪞 Self-Love & Penerimaan Diri', value: SLASH_THEMES.self_love },
  { name: '🔋 Burnout & Lelah Mental', value: SLASH_THEMES.burnout },
  { name: '🩹 Healing & Luka Batin', value: SLASH_THEMES.healing },
  { name: '😊 People Pleasing', value: SLASH_THEMES.people_pleasing },
  { name: '🌙 Mengatasi Kesepian', value: SLASH_THEMES.kesepian },

  // Karir & Pendidikan
  { name: '📚 Tekanan Akademik', value: SLASH_THEMES.akademik },
  { name: '🧭 Quarter-Life Crisis', value: SLASH_THEMES.quarter_life },
  { name: '🎭 Imposter Syndrome', value: SLASH_THEMES.imposter },
  { name: '🎓 Perjuangan Fresh Graduate', value: SLASH_THEMES.fresh_grad },

  // Sosial & Pergaulan
  { name: '🐍 Pertemanan Toxic', value: SLASH_THEMES.toxic_friend },
  { name: '📱 Social Comparison', value: SLASH_THEMES.social_comparison },
  { name: '🤝 Support System', value: SLASH_THEMES.support_system },

  // Pertumbuhan Diri
  { name: '🌈 Bangkit dari Kegagalan', value: SLASH_THEMES.bangkit },
  { name: '🚀 Keluar dari Zona Nyaman', value: SLASH_THEMES.zona_nyaman },
  { name: '🔥 Konsistensi & Kedisiplinan', value: SLASH_THEMES.konsistensi },
  { name: '🙏 Rasa Bersyukur', value: SLASH_THEMES.bersyukur },
  { name: '🏠 Kemandirian & Merantau', value: SLASH_THEMES.kemandirian },
];
