const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');
const cmdName = 'broadcast';

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('../localization/' + lang + '.json');
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(locFile['en-US']['en-US'].commands[cmdName].description)
        .setDescriptionLocalizations({
            fr: locFile['fr']['fr'].commands[cmdName].description,
        })
		.addSubcommand(subcommand =>
			subcommand
				.setName('custom')
				.setDescription('Sends a custom message')
				.addStringOption(option => 
					option
					.setName('message')
					.setDescription('The content of the message to send')
					.setRequired(true))
				.addStringOption(option => 
					option
					.setName('color')
					.setDescription('The color of the embed band')
					.addChoices(
						{ name: 'red', value: '0xff0000' },
						{ name: 'orange', value: '0xff7700' },
						{ name: 'yellow', value: '0xFFFF00' },
						{ name: 'green', value: '0x00FF00' },
						{ name: 'blue', value: '0x0066ff' },
					)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('update')
				.setDescription('Sends a “rebooting for update” message'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('turnoff')
				.setDescription('Sends a “Shutting down” message'))
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
        var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
		var message = '';
		var color = '';
		var subcommand = interaction.options.getSubcommand();
		
		if (subcommand === 'custom') {
			message = interaction.options.getString('message');
			subcommand = subcommand + ' ' + message;
			color = interaction.options.getString('color');
			if (color != null) {
				subcommand = subcommand + ' ' + color;
			} else {
				color = '0xFFFF00';
			}
		}
		
		if (subcommand === 'update') {
			message = "Rebooting for update...";
			color = "0xff7700";
			client.user.setPresence({ activities: [{ name: `Rebooting...` }], status: 'away' });
		}
		
		if (subcommand === 'turnoff') {
			message = "Shutting down...";
			color = "0xff0000";
			client.user.setPresence({ activities: [{ name: `Shutting down...` }], status: 'away' });			
		}

		const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(' ')
                    .setDescription(`**${message}**`);

					
		await interaction.reply({ content: locFile[locale][locale].system.sending, ephemeral: true });
		if (logsChannel != undefined)
			await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used \`\` “/${cmdName} ${subcommand}” \`\``);

		logsChList.forEach(async channel => await channel.send({ embeds: [embed] }));
		await interaction.deleteReply();
		console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “/${cmdName} ${subcommand}”`);
	},
};