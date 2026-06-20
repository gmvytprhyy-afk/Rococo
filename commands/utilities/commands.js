const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = [
  {
    data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
    async execute(interaction, client) {
      const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🏓 Pong!')
        .addFields(
          { name: 'Latency', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
          { name: 'API Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true }
        );
      await interaction.editReply({ content: null, embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription("Get a user's avatar")
      .addUserOption(o => o.setName('user').setDescription('User (defaults to yourself)')),
    async execute(interaction) {
      const target = interaction.options.getUser('user') || interaction.user;
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${target.username}'s Avatar`)
        .setImage(target.displayAvatarURL({ size: 1024 }));
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('serverinfo').setDescription('View server information'),
    async execute(interaction) {
      const g = interaction.guild;
      await g.fetch();
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(g.name)
        .setThumbnail(g.iconURL())
        .addFields(
          { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
          { name: 'Members', value: `${g.memberCount}`, inline: true },
          { name: 'Channels', value: `${g.channels.cache.size}`, inline: true },
          { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
          { name: 'Boost Level', value: `Tier ${g.premiumTier}`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('userinfo')
      .setDescription('View information about a user')
      .addUserOption(o => o.setName('user').setDescription('User (defaults to yourself)')),
    async execute(interaction) {
      const target = interaction.options.getUser('user') || interaction.user;
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(target.username)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'ID', value: target.id, inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
          { name: 'Roles', value: member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'None' : 'N/A' }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('poll')
      .setDescription('Create a quick poll')
      .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true)),
    async execute(interaction) {
      const question = interaction.options.getString('question');
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📊 Poll')
        .setDescription(question)
        .setFooter({ text: `Asked by ${interaction.user.tag}` })
        .setTimestamp();
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      await msg.react('👍');
      await msg.react('👎');
    }
  },
];
