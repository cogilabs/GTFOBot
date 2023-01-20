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
        var locale = '';
		const message = interaction.options.getString('message');
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
        var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);

		const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('**System message**')
                    .setDescription(message);

		await interaction.reply({ content: locFile[locale][locale].system.sending, ephemeral: true });
		if (logsChannel != undefined)
			await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used \`\` “/${cmdName} ${message}” \`\``);

		logsChList.forEach(async channel => await channel.send({ embeds: [embed] }));
		await interaction.deleteReply();
		console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “/${cmdName} ${message}”`);
	},
};