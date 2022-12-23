const { SlashCommandBuilder } = require('discord.js');
const cmdName = 'echo';

// TODO: Locale

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
        var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
		const message = interaction.options.getString('message');
		await interaction.reply({ content: 'Sending...', ephemeral: true });
		await interaction.channel.send({ content: message });
		await interaction.deleteReply();
		console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “/${cmdName} ${message}”`);
		if (logsChannel != undefined)
			await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used **\`“/${cmdName} ${message}”\`**`);
	},
};