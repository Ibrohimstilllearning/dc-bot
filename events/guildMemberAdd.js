const { EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = async function guildMemberAdd(member) {
  const settings = db.getSettings(member.guild.id);
  if (!settings?.welcomeChannelId) return;

  const channel = await member.guild.channels.fetch(settings.welcomeChannelId).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`WOY ${member.user.username} AKHIRNYA NONGOL JUGA 👋`)
    .setDescription(
      `Selamat dateng, bro/sis. Lo baru aja masuk ke markas orang-orang yang niat banget mau lepas dari kebiasaan itu — dan lo gak sendirian di sini, jadi jangan sok kuat sendirian juga.\n\n` +
      `Sebelum kabur:\n` +
      `📜 Baca aturan di ${settings.rulesChannelId ? `<#${settings.rulesChannelId}>` : '#rules'}\n` +
      `🔥 Ketik \`/streak\` buat mulai ngitung hari lo\n` +
      `🚨 Kena godaan tengah malem? \`/trigger\`, jangan ditahan sendiri\n` +
      `🏆 \`/leaderboard\` kalo lo pengen liat siapa yang paling niat (atau pengen dikalahin)\n\n` +
      `Udah, gitu doang. Gas mulai dari sekarang, jangan besok-besok mulu 💪`
    );

  await channel.send({ content: `${member}`, embeds: [embed] });
};

