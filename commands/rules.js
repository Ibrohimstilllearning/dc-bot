const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Tampilkan peraturan server'),

  async execute(interaction) {
    const settings = db.getSettings(interaction.guildId);
    
    // Replace #trigger-alert with actual channel mention if set
    const triggerChannelText = settings?.triggerChannelId 
      ? `<#${settings.triggerChannelId}>` 
      : '#trigger-alert';

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('📜 PERATURAN, WAJIB BACA GOBLOK (canda, tapi serius)')
      .setDescription('Woy selamat datang di server nofap paling niat se-Discord. Sebelum lo asal pencet-pencet channel, baca dulu nih aturannya, males-males amat sih:')
      .addFields(
        { 
          name: '1️⃣ JANGAN NYINYIR', 
          value: 'Lo relapse, orang relapse, ya udah. Jangan pada sok suci ngejek-ngejek. Kita di sini bukan buat war siapa paling tahan, tapi saling angkat pas ada yang jatoh.' 
        },
        { 
          name: '2️⃣ MULUT DIJAGA, BOCORAN JANGAN', 
          value: 'Apa yang dicurhatin di sini — trigger, relapse, insecurity — stay di sini aja. Ketauan nyebar ke luar, siap-siap di-kick tanpa ba-bi-bu.' 
        },
        { 
          name: '3️⃣ JUJUR AJA, GAK ADA YANG NILAI', 
          value: 'Sistem /relapse itu based on kejujuran lo sendiri. Bohong ke bot cuma bikin lo boong ke diri sendiri, percuma. Mendingan jujur biar progress-nya valid.' 
        },
        { 
          name: '4️⃣ CHANNEL ADA FUNGSINYA, JANGAN ASAL', 
          value: `Kena godaan? Langsung /trigger atau lempar ke ${triggerChannelText}, jangan dipendem sendiri kayak orang bego.\nMau curhat panjang lebar? #curhat.\nPengen pamer streak? #leaderboard, silakan flexing di sana.` 
        },
        { 
          name: '5️⃣ NO KONTEN NGERES', 
          value: 'Share/bahas konten begituan di sini = ban instan, gak pake nanya-nanya dulu. Lo di sini buat nofap, bukan nyari bahan.' 
        },
        { 
          name: '6️⃣ SALING DUKUNG, BUKAN SALING NGEJATOHIN', 
          value: 'Leaderboard itu buat semangat-semangatan doang, bukan ajang lo ngerendahin orang yang streak-nya masih pendek. Semua pernah mulai dari nol, jangan songong.' 
        }
      )
      .setFooter({ text: 'Klik "I Agree" kalo lo emang niat dan gak cuma numpang lewat doang. 🌱' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('agree_rules')
        .setLabel('✅ Saya Setuju')
        .setStyle(ButtonStyle.Success)
    );

    if (settings?.rulesChannelId && interaction.channelId !== settings.rulesChannelId) {
      try {
        const rulesChannel = await interaction.client.channels.fetch(settings.rulesChannelId);
        if (rulesChannel) {
          await rulesChannel.send({ embeds: [embed], components: [row] });
          await interaction.reply({ content: `Aturan sudah dikirim ke <#${settings.rulesChannelId}>`, ephemeral: true });
          return;
        }
      } catch (error) {
        console.error('Gagal fetch rulesChannel:', error);
      }
    }

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
