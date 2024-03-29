// echo.js - GTFO Discord Companion app echo command
// Copyright (C) 2023 David "0Davgi0" Girou
// License: BSD2.

const { SlashCommandBuilder } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');
const { logToServer } = require('../modules/smallModules.js')
const cmdName = 'echo';

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('../localization/' + lang + '.json');
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(locFile['en-US']['en-US'].commands[cmdName].description)
        .setDescriptionLocalizations({
            fr: locFile['fr']['fr'].commands?.[cmdName]?.description ?? locFile['en-US']['en-US'].commands[cmdName].description,
        })
		.addStringOption(option => 
            option
            .setName('message')
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].message)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.message ?? locFile['en-US']['en-US'].commands[cmdName].message,
			})
			.setRequired(true))
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
		var configLogsChannel = configFile[interaction.guild.id].get(`configuration.logsChannel`);
			if (configLogsChannel != undefined) {
				var logsChannel = interaction.guild.channels.cache.find(channel => channel.id === configLogsChannel);
			} else {
				var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
			}
		const message = interaction.options.getString('message');
		await interaction.reply({ content: locFile[locale][locale].system?.sending ?? locFile["en-US"]["en-US"].system.sending, ephemeral: true });
		await interaction.channel.send({ content: message });
		await interaction.deleteReply();
		logToServer(logsChannel, `${interaction.user.tag} <${interaction.user.id}> used \`\` “/${cmdName} ${message}” \`\``);
	},
};