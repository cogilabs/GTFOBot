// broadcast.js - GTFO Discord Companion app broadcast command
// Copyright (C) 2023 David "0Davgi0" Girou
// License: BSD2.

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');
const { logToServer } = require('../modules/smallModules.js')
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
            fr: locFile['fr']['fr'].commands?.[cmdName]?.description ?? locFile['en-US']['en-US'].commands[cmdName].description,
        })
		.addSubcommand(subcommand =>
			subcommand
				.setName(locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.name)
				.setNameLocalizations({
					fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.custom?.name ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.name,
				})
				.setDescription(locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.description)
				.setDescriptionLocalizations({
					fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.custom?.description ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.description,
				})
				.addStringOption(option => 
					option
					.setName(locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.message.name)
					.setNameLocalizations({
						fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.custom?.message?.name ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.message.name,
					})
					.setDescription(locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.message.description)
					.setDescriptionLocalizations({
						fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.custom?.message?.description ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.message.description,
					})
					.setRequired(true))
				.addStringOption(option => 
					option
					.setName(locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.color.name)
					.setNameLocalizations({
						fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.custom?.color?.name ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.color.name,
					})
					.setDescription(locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.color.description)
					.setDescriptionLocalizations({
						fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.custom?.color?.description ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.custom.color.description,
					})
					.addChoices(
						{ name: locFile['en-US']['en-US'].colors.red, 
						name_localizations: {
							fr: locFile['fr']['fr'].colors?.red ?? locFile['en-US']['en-US'].colors.red,
						},
						value: '0xff0000' },
						{ name: locFile['en-US']['en-US'].colors.orange, 
						name_localizations: {
							fr: locFile['fr']['fr'].colors?.orange ?? locFile['en-US']['en-US'].colors.orange,
						},
						value: '0xff7700' },
						{ name: locFile['en-US']['en-US'].colors.yellow, 
						name_localizations: {
							fr: locFile['fr']['fr'].colors?.yellow ?? locFile['en-US']['en-US'].colors.yellow,
						},
						value: '0xFFFF00' },
						{ name: locFile['en-US']['en-US'].colors.green, 
						name_localizations: {
							fr: locFile['fr']['fr'].colors?.green ?? locFile['en-US']['en-US'].colors.green,
						},
						value: '0x00FF00' },
						{ name: locFile['en-US']['en-US'].colors.blue, 
						name_localizations: {
							fr: locFile['fr']['fr'].colors?.blue ?? locFile['en-US']['en-US'].colors.blue,
						},
						value: '0x0066ff' },
					)))
		.addSubcommand(subcommand =>
			subcommand
				.setName(locFile['en-US']['en-US'].commands[cmdName].subcommands.update.name)
				.setNameLocalizations({
					fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.update?.name ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.update.name,
				})
				.setDescription(locFile['en-US']['en-US'].commands[cmdName].subcommands.update.description)
				.setDescriptionLocalizations({
					fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.update?.description ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.update.description,
				}))
		.addSubcommand(subcommand =>
			subcommand
				.setName(locFile['en-US']['en-US'].commands[cmdName].subcommands.turnoff.name)
				.setNameLocalizations({
					fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.turnoff?.name ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.turnoff.name,
				})
				.setDescription(locFile['en-US']['en-US'].commands[cmdName].subcommands.turnoff.description)
				.setDescriptionLocalizations({
					fr: locFile['fr']['fr'].commands?.[cmdName]?.subcommands?.turnoff?.description ?? locFile['en-US']['en-US'].commands[cmdName].subcommands.turnoff.description,
				}))
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
                    .setColor(Number(color))
                    .setTitle(' ')
                    .setDescription(`**${message}**`);

					
		await interaction.reply({ content: locFile[locale][locale].system?.sending ?? locFile["en-US"]["en-US"].system.sending, ephemeral: true });
		logToServer(logsChannel, `${interaction.user.tag} <${interaction.user.id}> used \`\` “/${cmdName} ${subcommand}” \`\``);
		logsChList.forEach(async channel => await channel.send({ embeds: [embed] }));
		await interaction.deleteReply();
	},
};