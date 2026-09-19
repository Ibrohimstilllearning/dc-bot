const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('relapse')
    .setDescription('Lapor relapse (streak akan kena penalti sesuai jumlah relapse di run ini)'),

  async execute(interaction) {
    db.ensureUser(interaction.guildId, interaction.user.id, interaction.user.username);
    const result = db.reportRelapse(
      interaction.guildId,
      interaction.user.id,
      interaction.user.username
    );

    const embed = new EmbedBuilder()
      .setColor(result.reset ? 0xed4245 : 0xfee75c)
      .setTitle(result.reset ? '💥 Reset Total' : '⚠️ Relapse Dicatat')
      .setDescription(
        result.reset
          ? `Ini relapse ke-3 di run ini, jadi streak-nya reset total. Rekor terpanjang kamu (**${result.longestStreak} hari**) tetap tersimpan. Mulai lagi dari 0, kamu pasti bisa!`
          : `Relapse ke-**${result.relapseCount}** di run ini. Streak kamu sekarang **${result.currentStreak} hari** (kena penalti otomatis).`
      )
      .setFooter({ text: 'Jangan menyerah. Ketik /trigger kalau lagi kena godaan biar teman bisa bantu.' });

    await interaction.reply({ embeds: [embed] });
  },
};
