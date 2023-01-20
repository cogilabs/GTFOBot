const { SlashCommandBuilder } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');
const cmdName = 'logsecho';

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
		.addStringOption(option => 
            option
            .setName('message')
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].option1)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option1,
			})
			.setRequired(true))
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
		console.log(logsChList);
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
        var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
		const message = interaction.options.getString('message');
		await interaction.reply({ content: locFile[locale][locale].system.sending, ephemeral: true });
		if (logsChannel != undefined)
			await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used \`\` “/${cmdName} ${message}” \`\``);
		logsChList.forEach(async channel => await channel.send({ content: message }));
		await interaction.deleteReply();
		console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “/${cmdName} ${message}”`);
	},
};