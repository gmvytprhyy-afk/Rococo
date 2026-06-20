const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

function xpForLevel(level) { return 5 * level * level + 50 * level + 100; }

module.exports = {
  commands: [
    {
      data: new SlashCommandBuilder().setName('rank').setDescription("Check your or another user's rank")
        .addUserOption(o => o.setName('user').setDescription('User to check')),
      async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const xp = await db.get(`xp_${interaction.guild.id}_${target.id}`) || 0;
        const level = await db.get(`level_${interaction.guild.id}_${target.id}`) || 0;
        const needed = xpForLevel(level);
        const embed = new EmbedBuilder().setColor(0x5865F2)
          .setTitle(`📊 ${target.username}'s Rank`)
          .setThumbnail(target.displayAvatarURL())
          .addFields(
            { name: 'Level', value: `${level}`, inline: true },
            { name: 'XP', value: `${xp} / ${needed}`, inline: true }
          );
        await interaction.reply({ embeds: [embed] });
      }
    },
    {
      data: new SlashCommandBuilder().setName('leaderboard').setDescription('View XP leaderboard'),
      async execute(interaction) {
        const all = await db.all();
        const prefix = `xp_${interaction.guild.id}_`;
        const entries = all.filter(e => e.id.startsWith(prefix))
          .map(e => ({ userId: e.id.replace(prefix, ''), xp: e.value }))
          .sort((a, b) => b.xp - a.xp).slice(0, 10);
        if (!entries.length) return interaction.reply({ content: 'No data yet!', ephemeral: true });
        const desc = entries.map((e, i) => `**${i + 1}.** <@${e.userId}> — ${e.xp} XP`).join('\n');
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('🏆 XP Leaderboard').setDescription(desc)] });
      }
    },
  ]
};
