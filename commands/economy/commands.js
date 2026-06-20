const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

async function getBalance(userId) {
  const bal = await db.get(`economy_${userId}_balance`);
  return bal || 0;
}

async function addBalance(userId, amount) {
  const current = await getBalance(userId);
  await db.set(`economy_${userId}_balance`, current + amount);
}

async function setBalance(userId, amount) {
  await db.set(`economy_${userId}_balance`, amount);
}

module.exports = [
  {
    data: new SlashCommandBuilder().setName('balance').setDescription('Check your coin balance')
      .addUserOption(o => o.setName('user').setDescription("Check someone else's balance")),
    async execute(interaction) {
      const target = interaction.options.getUser('user') || interaction.user;
      const bal = await getBalance(target.id);
      const embed = new EmbedBuilder().setColor(0xFFD700).setTitle('💰 Balance')
        .setDescription(`${target.username} has **${bal.toLocaleString()} coins**`);
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily coins'),
    async execute(interaction) {
      const cooldownKey = `daily_${interaction.user.id}`;
      const lastClaim = await db.get(cooldownKey);
      const now = Date.now();
      const cooldown = 86400000;
      if (lastClaim && now - lastClaim < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastClaim)) / 3600000);
        return interaction.reply({ content: `⏰ Come back in **${remaining}h** for your daily coins.`, ephemeral: true });
      }
      const amount = Math.floor(Math.random() * 500) + 200;
      await addBalance(interaction.user.id, amount);
      await db.set(cooldownKey, now);
      const embed = new EmbedBuilder().setColor(0xFFD700).setTitle('💰 Daily Claim!')
        .setDescription(`You received **${amount} coins**!`);
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('work').setDescription('Work to earn coins'),
    async execute(interaction) {
      const cooldownKey = `work_${interaction.user.id}`;
      const lastWork = await db.get(cooldownKey);
      const now = Date.now();
      if (lastWork && now - lastWork < 3600000) {
        const remaining = Math.ceil((3600000 - (now - lastWork)) / 60000);
        return interaction.reply({ content: `⏰ You can work again in **${remaining} min**.`, ephemeral: true });
      }
      const jobs = ['developer', 'chef', 'driver', 'teacher', 'doctor'];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const amount = Math.floor(Math.random() * 200) + 50;
      await addBalance(interaction.user.id, amount);
      await db.set(cooldownKey, now);
      const embed = new EmbedBuilder().setColor(0xFFD700)
        .setDescription(`💼 You worked as a **${job}** and earned **${amount} coins**!`);
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('pay')
      .setDescription('Send coins to another user')
      .addUserOption(o => o.setName('user').setDescription('User to pay').setRequired(true))
      .addIntegerOption(o => o.setName('amount').setDescription('Amount to pay').setRequired(true).setMinValue(1)),
    async execute(interaction) {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      if (target.id === interaction.user.id) return interaction.reply({ content: "You can't pay yourself.", ephemeral: true });
      const senderBal = await getBalance(interaction.user.id);
      if (senderBal < amount) return interaction.reply({ content: `You only have **${senderBal} coins**.`, ephemeral: true });
      await addBalance(interaction.user.id, -amount);
      await addBalance(target.id, amount);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFFD700).setDescription(`✅ Sent **${amount} coins** to ${target.username}!`)] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('leaderboard').setDescription('View economy leaderboard'),
    async execute(interaction) {
      const all = await db.all();
      const balances = all.filter(e => e.id.startsWith('economy_') && e.id.endsWith('_balance'))
        .map(e => ({ userId: e.id.split('_')[1], balance: e.value }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);
      if (!balances.length) return interaction.reply({ content: 'No data yet!', ephemeral: true });
      const entries = balances.map((e, i) => `**${i + 1}.** <@${e.userId}> — ${e.balance.toLocaleString()} coins`).join('\n');
      const embed = new EmbedBuilder().setColor(0xFFD700).setTitle('🏆 Economy Leaderboard').setDescription(entries);
      await interaction.reply({ embeds: [embed] });
    }
  },
];
