const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trigger')
    .setDescription('Lapor kalau lagi kena godaan, teman-teman akan dinotif buat bantu')
    .addStringOption((option) =>
      option.setName('catatan').setDescription('Ceritakan situasinya (opsional)').setRequired(false)
    ),

  async execute(interaction) {
    const settings = db.getSettings(interaction.guildId);
    const note = interaction.options.getString('catatan') ?? '_(tidak ada catatan)_';

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('🚨 Trigger Alert')
      .setDescription(
        `**${interaction.user.username}** lagi kena godaan dan butuh dukungan sekarang juga!\n\n**Catatan:** ${note}`
      )
      .setFooter({ text: 'Ini 15-20 menit paling kritis. Ajak ngobrol / telepon dia sekarang.' })
      .setTimestamp();

    const mention = settings?.supportRoleId ? `<@&${settings.supportRoleId}>` : '';

    if (settings?.triggerChannelId) {
      const channel = await interaction.client.channels
        .fetch(settings.triggerChannelId)
        .catch(() => null);
      if (channel) {
        await channel.send({ content: mention, embeds: [embed] });
        await interaction.reply({
          content: 'Laporan trigger terkirim ke channel bantuan. Tahan dulu, teman-teman segera bantu 💪',
          ephemeral: true,
        });
        return;
      }
    }

    // Fallback kalau channel bantuan belum di-setup admin
    await interaction.reply({ content: mention || undefined, embeds: [embed] });
  },
};
