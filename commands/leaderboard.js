const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Lihat ranking streak nofap semua member di server ini'),

  async execute(interaction) {
    const board = db.getLeaderboard(interaction.guildId);

    if (board.length === 0) {
      await interaction.reply('Belum ada yang mulai streak di server ini. Ketik /streak buat mulai!');
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const lines = board
      .slice(0, 15)
      .map((u, i) => {
        const rank = medals[i] ?? `${i + 1}.`;
        return `${rank} **${u.username}** — ${u.currentStreak} hari ${db.statusEmoji(u.currentStreak)}`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🏆 Leaderboard Streak Nofap')
      .setDescription(lines);

    await interaction.reply({ embeds: [embed] });
  },
};
