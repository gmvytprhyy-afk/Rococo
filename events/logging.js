const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = function (client) {
  async function getLogChannel(guild) {
    return guild.channels.cache.find(c => c.name === 'logs' || c.name === 'mod-logs' || c.name === 'audit-logs');
  }

  client.on('messageDelete', async (message) => {
    if (message.author?.bot) return;
    const logChannel = await getLogChannel(message.guild);
    if (!logChannel) return;
    const embed = new EmbedBuilder().setColor(0xFF4444).setTitle('🗑️ Message Deleted')
      .addFields(
        { name: 'Author', value: message.author ? `<@${message.author.id}>` : 'Unknown', inline: true },
        { name: 'Channel', value: `<#${message.channelId}>`, inline: true },
        { name: 'Content', value: message.content || '*No content*' }
      ).setTimestamp();
    logChannel.send({ embeds: [embed] });
  });

  client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (oldMsg.author?.bot || oldMsg.content === newMsg.content) return;
    const logChannel = await getLogChannel(oldMsg.guild);
    if (!logChannel) return;
    const embed = new EmbedBuilder().setColor(0xFFCC00).setTitle('✏️ Message Edited')
      .addFields(
        { name: 'Author', value: `<@${oldMsg.author.id}>`, inline: true },
        { name: 'Channel', value: `<#${oldMsg.channelId}>`, inline: true },
        { name: 'Before', value: oldMsg.content || '*None*' },
        { name: 'After', value: newMsg.content || '*None*' }
      ).setTimestamp();
    logChannel.send({ embeds: [embed] });
  });

  client.on('guildMemberAdd', async (member) => {
    const logChannel = await getLogChannel(member.guild);
    if (!logChannel) return;
    const embed = new EmbedBuilder().setColor(0x00FF00).setTitle('📥 Member Joined')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
      ).setTimestamp();
    logChannel.send({ embeds: [embed] });
  });

  client.on('guildMemberRemove', async (member) => {
    const logChannel = await getLogChannel(member.guild);
    if (!logChannel) return;
    const embed = new EmbedBuilder().setColor(0xFF4444).setTitle('📤 Member Left')
      .addFields({ name: 'User', value: `${member.user.tag} (<@${member.id}>)` })
      .setTimestamp();
    logChannel.send({ embeds: [embed] });
  });
};
