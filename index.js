require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.prefix = process.env.PREFIX || '=';

// Load slash commands
const commandFolders = ["moderation","leveling","tickets","games","utilities","message-tracking","invite-tracking","economy","giveaway"];
const allCommands = [];

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(commandsPath)) continue;
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      allCommands.push(command.data.toJSON());
    }
  }
}

// Register slash commands
const rest = new REST().setToken(process.env.TOKEN);
(async () => {
  try {
    console.log(`Registering ${allCommands.length} slash commands...`);
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: allCommands });
      console.log('Guild commands registered (instant).');
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: allCommands });
      console.log('Global commands registered (may take up to 1 hour).');
    }
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
})();

// Handle interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    const msg = { content: 'There was an error executing this command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

const logging = require('./events/logging');
const welcome = require('./events/welcome');
const leveling = require('./events/leveling');
const automod = require('./events/automod');
const inviteTracking = require('./events/inviteTracking');
const messageTracking = require('./events/messageTracking');
logging(client);
welcome(client);
leveling(client);
automod(client);
inviteTracking(client);
messageTracking(client);

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is online and ready!`);
});

client.login(process.env.TOKEN);

// Start dashboard
require('./dashboard/server');
