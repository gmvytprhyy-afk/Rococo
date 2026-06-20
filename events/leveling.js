const { QuickDB } = require('quick.db');
const { EmbedBuilder } = require('discord.js');
const db = new QuickDB();

function xpForLevel(level) { return 5 * level * level + 50 * level + 100; }

module.exports = function (client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const cooldownKey = `xp_cooldown_${message.guild.id}_${message.author.id}`;
    const lastXP = await db.get(cooldownKey);
    if (lastXP && Date.now() - lastXP < 60000) return;
    const xpGain = Math.floor(Math.random() * 15) + 10;
    const xpKey = `xp_${message.guild.id}_${message.author.id}`;
    const levelKey = `level_${message.guild.id}_${message.author.id}`;
    let xp = (await db.get(xpKey) || 0) + xpGain;
    let level = await db.get(levelKey) || 0;
    await db.set(xpKey, xp);
    await db.set(cooldownKey, Date.now());
    while (xp >= xpForLevel(level)) {
      xp -= xpForLevel(level);
      level++;
      await db.set(levelKey, level);
      await db.set(xpKey, xp);
      const embed = new EmbedBuilder().setColor(0xFFD700)
        .setDescription(`🎉 ${message.author} leveled up to **Level ${level}**!`);
      message.channel.send({ embeds: [embed] }).catch(() => {});
    }
  });
};
