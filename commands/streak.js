const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('streak')
    .setDescription('Lihat streak nofap kamu saat ini'),

  async execute(interaction) {
    const user = db.ensureUser(interaction.guildId, interaction.user.id, interaction.user.username);
    const streak = db.currentStreakDays(user);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`Streak ${interaction.user.username}`)
      .addFields(
        { name: 'Hari berjalan', value: `${streak} hari`, inline: true },
        { name: 'Status', value: db.statusEmoji(streak), inline: true },
        { name: 'Jumlah relapse run ini', value: `${user.relapseCount}/3`, inline: true },
        { name: 'Rekor terpanjang', value: `${Math.max(user.longestStreak, streak)} hari`, inline: true }
      )
      .setFooter({ text: 'Semangat terus! Ketik /trigger kalau lagi kena godaan.' });

    await interaction.reply({ embeds: [embed] });
  },
};
