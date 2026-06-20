const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a member from the server')
      .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for ban'))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (!member) return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
      if (!member.bannable) return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });
      await member.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor(0xFF4444)
        .setTitle('🔨 User Banned')
        .addFields(
          { name: 'User', value: `${target.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a member from the server')
      .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for kick'))
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });
      if (!member.kickable) return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
      await member.kick(reason);
      const embed = new EmbedBuilder()
        .setColor(0xFF8800)
        .setTitle('👢 User Kicked')
        .addFields(
          { name: 'User', value: target.tag, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('Timeout a member')
      .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
      .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
      .addStringOption(o => o.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
      const target = interaction.options.getUser('user');
      const minutes = interaction.options.getInteger('minutes');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });
      await member.timeout(minutes * 60 * 1000, reason);
      const embed = new EmbedBuilder()
        .setColor(0xFFCC00)
        .setTitle('⏱️ User Timed Out')
        .addFields(
          { name: 'User', value: target.tag, inline: true },
          { name: 'Duration', value: `${minutes} minute(s)`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('purge')
      .setDescription('Delete multiple messages')
      .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
      const amount = interaction.options.getInteger('amount');
      await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `✅ Deleted ${amount} messages.`, ephemeral: true });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Warn a member')
      .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
      const target = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      const embed = new EmbedBuilder()
        .setColor(0xFFCC00)
        .setTitle('⚠️ Warning Issued')
        .addFields(
          { name: 'User', value: target.tag, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
      try {
        await target.send({ embeds: [new EmbedBuilder().setColor(0xFFCC00).setDescription(`⚠️ You have been warned in **${interaction.guild.name}**\nReason: ${reason}`)] });
      } catch {}
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('slowmode')
      .setDescription('Set slowmode for a channel')
      .addIntegerOption(o => o.setName('seconds').setDescription('Seconds (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      const secs = interaction.options.getInteger('seconds');
      await interaction.channel.setRateLimitPerUser(secs);
      await interaction.reply({ content: secs === 0 ? '✅ Slowmode disabled.' : `✅ Slowmode set to ${secs}s.`, ephemeral: true });
    }
  },
];
