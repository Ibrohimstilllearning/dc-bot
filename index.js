require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  // PENTING: Wajib aktifkan "Server Members Intent" di Discord Developer Portal
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Bot online sebagai ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() && interaction.customId === 'agree_rules') {
    const db = require('./db');
    const settings = db.getSettings(interaction.guildId);

    if (!settings?.verifiedRoleId) {
      await interaction.reply({ content: 'Role verifikasi belum di-setup admin. Hubungi admin server.', ephemeral: true });
      return;
    }

    try {
      await interaction.member.roles.add(settings.verifiedRoleId);
      await interaction.reply({ content: 'Sip, kamu sekarang udah bisa akses semua channel! Selamat gabung 🎉', ephemeral: true });
    } catch (err) {
      console.error('Gagal kasih role verified:', err);
      await interaction.reply({ content: 'Gagal kasih akses, kemungkinan role bot posisinya di bawah role verified. Hubungi admin.', ephemeral: true });
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error di command ${interaction.commandName}:`, error);
    const errorMessage = { content: 'Waduh, ada error pas jalanin command ini.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const eventName = path.basename(file, '.js');
    const handler = require(path.join(eventsPath, file));
    client.on(eventName, handler);
  }
}

client.login(process.env.DISCORD_TOKEN);
