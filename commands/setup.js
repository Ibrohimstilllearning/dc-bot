const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('(Admin) Atur channel & role buat sistem trigger report')
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Channel buat laporan trigger').setRequired(false)
    )
    .addRoleOption((option) =>
      option.setName('role').setDescription('Role yang akan di-mention saat ada trigger').setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName('welcome_channel').setDescription('Channel buat pesan sambutan member baru').setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName('rules_channel').setDescription('Channel tempat /rules akan post aturan').setRequired(false)
    )
    .addRoleOption((option) =>
      option.setName('verified_role').setDescription('Role yang dikasih otomatis setelah klik Saya Setuju').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const welcomeChannel = interaction.options.getChannel('welcome_channel');
    const rulesChannel = interaction.options.getChannel('rules_channel');
    const verifiedRole = interaction.options.getRole('verified_role');

    if (!channel && !role && !welcomeChannel && !rulesChannel && !verifiedRole) {
      const current = db.getSettings(interaction.guildId);
      await interaction.reply({
        content: current
          ? `Setup saat ini:\nChannel trigger: ${current.triggerChannelId ? `<#${current.triggerChannelId}>` : '_belum diatur_'}\nRole bantuan: ${current.supportRoleId ? `<@&${current.supportRoleId}>` : '_belum diatur_'}\nChannel welcome: ${current.welcomeChannelId ? `<#${current.welcomeChannelId}>` : '_belum diatur_'}\nChannel rules: ${current.rulesChannelId ? `<#${current.rulesChannelId}>` : '_belum diatur_'}\nRole verified: ${current.verifiedRoleId ? `<@&${current.verifiedRoleId}>` : '_belum diatur_'}`
          : 'Belum ada setup sama sekali. Pakai `/setup channel:#nama-channel role:@NamaRole` untuk atur.',
        ephemeral: true,
      });
      return;
    }

    db.setSettings(interaction.guildId, {
      triggerChannelId: channel?.id,
      supportRoleId: role?.id,
      welcomeChannelId: welcomeChannel?.id,
      rulesChannelId: rulesChannel?.id,
      verifiedRoleId: verifiedRole?.id,
    });

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('✅ Setup tersimpan')
      .addFields(
        { name: 'Channel trigger', value: channel ? `<#${channel.id}>` : '_tidak diubah_' },
        { name: 'Role bantuan', value: role ? `<@&${role.id}>` : '_tidak diubah_' },
        { name: 'Channel welcome', value: welcomeChannel ? `<#${welcomeChannel.id}>` : '_tidak diubah_' },
        { name: 'Channel rules', value: rulesChannel ? `<#${rulesChannel.id}>` : '_tidak diubah_' },
        { name: 'Role verified', value: verifiedRole ? `<@&${verifiedRole.id}>` : '_tidak diubah_' }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
