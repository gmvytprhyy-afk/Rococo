const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = function (client) {
  const invitesCache = new Map();

  client.on('guildCreate', async (guild) => {
    const invites = await guild.invites.fetch().catch(() => null);
    if (invites) invitesCache.set(guild.id, new Map(invites.map(i => [i.code, i.uses])));
  });

  client.on('inviteCreate', async (invite) => {
    const cache = invitesCache.get(invite.guild.id) || new Map();
    cache.set(invite.code, invite.uses);
    invitesCache.set(invite.guild.id, cache);
  });

  client.on('guildMemberAdd', async (member) => {
    const cached = invitesCache.get(member.guild.id) || new Map();
    const current = await member.guild.invites.fetch().catch(() => null);
    if (!current) return;
    const used = [...current.values()].find(i => (cached.get(i.code) || 0) < (i.uses || 0));
    if (used) {
      const inviterId = used.inviterId;
      const count = await db.get(`invites_${member.guild.id}_${inviterId}`) || 0;
      await db.set(`invites_${member.guild.id}_${inviterId}`, count + 1);
    }
    invitesCache.set(member.guild.id, new Map(current.map(i => [i.code, i.uses])));
  });
};
