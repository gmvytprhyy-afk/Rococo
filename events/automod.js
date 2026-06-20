module.exports = function (client) {
  const spamMap = new Map();
  const badWords = ['spam', 'scam', 'discord.gift']; // Customize this list

  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.permissions.has('ManageMessages')) {
      // Bad word filter
      if (badWords.some(w => message.content.toLowerCase().includes(w))) {
        await message.delete().catch(() => {});
        const warn = await message.channel.send(`⚠️ ${message.author}, that content is not allowed.`);
        setTimeout(() => warn.delete().catch(() => {}), 5000);
        return;
      }
      // Anti-spam (5 messages in 5 seconds)
      const key = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();
      if (!spamMap.has(key)) spamMap.set(key, []);
      const timestamps = spamMap.get(key);
      timestamps.push(now);
      const recent = timestamps.filter(t => now - t < 5000);
      spamMap.set(key, recent);
      if (recent.length >= 5) {
        await message.member.timeout(30000, 'Spam detection');
        await message.channel.send(`⚠️ ${message.author} has been timed out for spamming.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
      }
      // Anti-invite
      if (message.content.match(/discord\.gg\/|discord\.com\/invite\//i)) {
        await message.delete().catch(() => {});
        const msg = await message.channel.send(`⚠️ ${message.author}, invites are not allowed.`);
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      }
    }
  });
};
