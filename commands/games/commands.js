const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = [
  {
    data: new SlashCommandBuilder().setName('8ball')
      .setDescription('Ask the magic 8-ball a question')
      .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),
    async execute(interaction) {
      const responses = [
        'It is certain.','It is decidedly so.','Without a doubt.','Yes, definitely.',
        'You may rely on it.','As I see it, yes.','Most likely.','Outlook good.',
        'Yes.','Signs point to yes.','Reply hazy, try again.','Ask again later.',
        "Better not tell you now.",'Cannot predict now.','Concentrate and ask again.',
        "Don't count on it.",'My reply is no.','My sources say no.',
        'Outlook not so good.','Very doubtful.'
      ];
      const answer = responses[Math.floor(Math.random() * responses.length)];
      const embed = new EmbedBuilder().setColor(0x5865F2)
        .setTitle('🎱 Magic 8-Ball')
        .addFields({ name: 'Question', value: interaction.options.getString('question') }, { name: 'Answer', value: answer });
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin'),
    async execute(interaction) {
      const result = Math.random() < 0.5 ? '🪙 Heads' : '🪙 Tails';
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFFD700).setTitle('Coin Flip').setDescription(result)] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('rps').setDescription('Play Rock Paper Scissors')
      .addStringOption(o => o.setName('choice').setDescription('Your choice').setRequired(true)
        .addChoices({ name: 'Rock', value: 'rock' }, { name: 'Paper', value: 'paper' }, { name: 'Scissors', value: 'scissors' })),
    async execute(interaction) {
      const choices = ['rock', 'paper', 'scissors'];
      const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
      const player = interaction.options.getString('choice');
      const bot = choices[Math.floor(Math.random() * 3)];
      let result = "It's a tie!";
      if ((player === 'rock' && bot === 'scissors') || (player === 'paper' && bot === 'rock') || (player === 'scissors' && bot === 'paper')) result = 'You win!';
      else if (player !== bot) result = 'I win!';
      const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('Rock Paper Scissors')
        .addFields({ name: 'You', value: emojis[player] + ' ' + player, inline: true }, { name: 'Me', value: emojis[bot] + ' ' + bot, inline: true }, { name: 'Result', value: result });
      await interaction.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('dice').setDescription('Roll dice')
      .addIntegerOption(o => o.setName('sides').setDescription('Number of sides (default 6)').setMinValue(2).setMaxValue(100)),
    async execute(interaction) {
      const sides = interaction.options.getInteger('sides') || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865F2).setDescription(`🎲 You rolled a **${result}** (d${sides})`)] });
    }
  },
  {
    data: new SlashCommandBuilder().setName('trivia').setDescription('Answer a trivia question'),
    async execute(interaction) {
      const questions = [
        { q: 'What is the capital of France?', a: 'paris', choices: ['London', 'Paris', 'Berlin', 'Madrid'] },
        { q: 'What is 7 × 8?', a: '56', choices: ['48', '54', '56', '64'] },
        { q: 'What element has symbol "O"?', a: 'oxygen', choices: ['Osmium', 'Oxygen', 'Oganesson', 'Oxide'] },
        { q: 'What is the fastest land animal?', a: 'cheetah', choices: ['Lion', 'Cheetah', 'Leopard', 'Horse'] },
      ];
      const q = questions[Math.floor(Math.random() * questions.length)];
      const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('🧠 Trivia').setDescription(q.q)
        .addFields({ name: 'Options', value: q.choices.map((c, i) => `${i + 1}. ${c}`).join('\n') })
        .setFooter({ text: 'Type the answer in chat within 15 seconds!' });
      await interaction.reply({ embeds: [embed] });
      const filter = m => m.author.id === interaction.user.id;
      const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });
      collector.on('collect', async m => {
        const correct = m.content.toLowerCase().includes(q.a);
        await interaction.followUp({ embeds: [new EmbedBuilder().setColor(correct ? 0x00FF00 : 0xFF4444).setDescription(correct ? '✅ Correct!' : `❌ Wrong! The answer was **${q.choices.find(c => c.toLowerCase() === q.a || q.a.includes(c.toLowerCase()))}``)] });
      });
      collector.on('end', (collected) => { if (!collected.size) interaction.followUp({ content: "⏰ Time's up!" }); });
    }
  },
];
