const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const cmdName = 'echo';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('Send a message in the current channel')
		.addStringOption(option => 
            option
            .setName('message')
            .setDescription('The message to send in the current channel')
			.setRequired(true))
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
		const message = interaction.options.getString('message');
        console.log(interaction.channel)
        await interaction.reply({ content: 'Sending...', ephemeral: true });
		await client.channels.fetch(interaction.channel.id)
            .then(channel=>channel.send({ content: message }));
			await interaction.deleteReply();
	},
};