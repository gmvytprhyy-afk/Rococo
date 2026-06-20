const { EmbedBuilder } = require('discord.js');

module.exports = function (client) {
  client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome' || c.name === 'general' || c.name === 'lobby');
    if (!welcomeChannel) return;
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Welcome to ${member.guild.name}! 🎉`)
      .setDescription(`Hey ${member}, welcome to the server! You are member **#${member.guild.memberCount}**.`)
      .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
      .setTimestamp();
    welcomeChannel.send({ embeds: [embed] });
    // Optional: assign a default role
    // const defaultRole = member.guild.roles.cache.find(r => r.name === 'Member');
    // if (defaultRole) member.roles.add(defaultRole);
  });

  client.on('guildMemberRemove', async (member) => {
    const leaveChannel = member.guild.channels.cache.find(c => c.name === 'welcome' || c.name === 'general' || c.name === 'lobby');
    if (!leaveChannel) return;
    const embed = new EmbedBuilder()
      .setColor(0xFF4444)
      .setDescription(`**${member.user.tag}** has left the server. Goodbye! 👋`)
      .setTimestamp();
    leaveChannel.send({ embeds: [embed] });
  });
};
