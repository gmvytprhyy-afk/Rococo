const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    data: new SlashCommandBuilder().setName('giveaway-start')
      .setDescription('Start a giveaway')
      .addStringOption(o => o.setName('prize').setDescription('Prize to give away').setRequired(true))
      .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(43200))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(20))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const prize = interaction.options.getString('prize');
      const durationMins = interaction.options.getInteger('duration');
      const winnersCount = interaction.options.getInteger('winners') || 1;
      const endsAt = new Date(Date.now() + durationMins * 60 * 1000);
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🎉 GIVEAWAY 🎉')
        .setDescription(`**Prize:** ${prize}\n\nReact with 🎉 to enter!\n\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Winners:** ${winnersCount}`)
        .setTimestamp(endsAt)
        .setFooter({ text: `Ends` });
      const msg = await interaction.channel.send({ embeds: [embed] });
      await msg.react('🎉');
      await interaction.reply({ content: '✅ Giveaway started!', ephemeral: true });
      setTimeout(async () => {
        const fetchedMsg = await msg.fetch().catch(() => null);
        if (!fetchedMsg) return;
        const reactions = fetchedMsg.reactions.cache.get('🎉');
        const users = reactions ? await reactions.users.fetch() : null;
        const eligible = users ? [...users.values()].filter(u => !u.bot) : [];
        if (!eligible.length) {
          msg.reply('🎉 Giveaway ended — no valid entries!');
          return;
        }
        const winners = eligible.sort(() => Math.random() - 0.5).slice(0, winnersCount);
        const winnerMentions = winners.map(u => `<@${u.id}>`).join(', ');
        const endEmbed = new EmbedBuilder().setColor(0x00FF00).setTitle('🎉 Giveaway Ended!')
          .setDescription(`**Prize:** ${prize}\n**Winner(s):** ${winnerMentions}`).setTimestamp();
        await msg.edit({ embeds: [endEmbed], components: [] });
        await msg.reply({ content: `🎉 Congratulations ${winnerMentions}! You won **${prize}**!` });
      }, durationMins * 60 * 1000);
    }
  },
  {
    data: new SlashCommandBuilder().setName('giveaway-reroll')
      .setDescription('Reroll a giveaway')
      .addStringOption(o => o.setName('message-id').setDescription('Message ID of the giveaway').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const msgId = interaction.options.getString('message-id');
      const msg = await interaction.channel.messages.fetch(msgId).catch(() => null);
      if (!msg) return interaction.reply({ content: 'Message not found.', ephemeral: true });
      const reactions = msg.reactions.cache.get('🎉');
      const users = reactions ? await reactions.users.fetch() : null;
      const eligible = users ? [...users.values()].filter(u => !u.bot) : [];
      if (!eligible.length) return interaction.reply({ content: 'No eligible participants.', ephemeral: true });
      const winner = eligible[Math.floor(Math.random() * eligible.length)];
      await interaction.reply({ content: `🎉 New winner: <@${winner.id}>!` });
    }
  },
];
