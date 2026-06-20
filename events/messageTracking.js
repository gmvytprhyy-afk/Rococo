const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = function (client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const key = `msgs_${message.guild.id}_${message.author.id}`;
    const current = await db.get(key) || 0;
    await db.set(key, current + 1);
  });
};
