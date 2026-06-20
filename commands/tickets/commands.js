const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = [
  {
    data: new SlashCommandBuilder().setName('ticket-setup')
      .setDescription('Set up the ticket system in the current channel')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎫 Support Tickets')
        .setDescription('Click the button below to create a support ticket.');
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('create_ticket').setLabel('Create Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')
      );
      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Ticket panel set up!', ephemeral: true });
    }
  },
  {
    data: new SlashCommandBuilder().setName('close-ticket')
      .setDescription('Close the current ticket')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
      }
      await interaction.reply({ content: '🔒 Closing ticket in 5 seconds...' });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  },
];

// Attach button interaction handler to the client
module.exports.interactionCreate = async function (interaction) {
  if (!interaction.isButton() || interaction.customId !== 'create_ticket') return;
  await interaction.deferReply({ ephemeral: true });
  const guild = interaction.guild;
  const existing = guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
  if (existing) return interaction.editReply(`You already have an open ticket: <#${existing.id}>`);
  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.id}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ],
  });
  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
  );
  const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('🎫 Ticket Opened')
    .setDescription(`Welcome ${interaction.user}! Support staff will be with you shortly.\nDescribe your issue below.`);
  await channel.send({ embeds: [embed], components: [closeRow] });
  await interaction.editReply(`✅ Ticket created: <#${channel.id}>`);
};
