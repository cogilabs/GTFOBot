// config.js - GTFO Discord Companion app config command
// Copyright (C) 2022 David "0Davgi0" Girou
// License: BSD2.

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');
const cmdName = 'config';

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
		.addChannelOption(option => 
            option
            .setName(locFile['en-US']['en-US'].commands[cmdName].option1.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option1.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].option1.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option1.description,
			}))
		.addRoleOption(option => 
            option
            .setName(locFile['en-US']['en-US'].commands[cmdName].option2.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option2.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].option2.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option2.description,
			}))
		.addChannelOption(option => 
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].option3.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option3.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].option3.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option3.description,
			}))
		.addStringOption(option =>
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].option4.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option4.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].option4.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option4.description,
			})
			.addChoices(
				{ name: 'enabled', value: 'enabled' },
				{ name: 'disabled', value: 'disabled' },
			))
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
        var locale = '';
		var message = '';
		var logMessage = '';
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
		const eventChannel = interaction.options.getChannel(locFile['en-US']['en-US'].commands[cmdName].option1.name);
		const role = interaction.options.getRole(locFile['en-US']['en-US'].commands[cmdName].option2.name);
		const newLogsChannel = interaction.options.getChannel(locFile['en-US']['en-US'].commands[cmdName].option3.name);
		const progressionEnabled = interaction.options.getString(locFile['en-US']['en-US'].commands[cmdName].option4.name);
		if (eventChannel != null) {
			if (eventChannel.type == 0) {
				configFile[interaction.guild.id].set(`configuration.eventChannel`, eventChannel.id);
				configFile[interaction.guild.id].save();
				logMessage = logMessage + eventChannel.name + '(Success) ';
				message = message + `${locFile[locale][locale].system.eventChannelSetTo} “${eventChannel.name}”\n`;
			} else {
				logMessage = 'eventCh:' + eventChannel.name + '(failure) ';
				message = message + `**“${eventChannel.name}” ${locFile[locale][locale].system.notATextChannel}**\n`;
			}
		}
		
		if(role != null) {
			configFile[interaction.guild.id].set(`configuration.prisonnersRole`, role.id);
			configFile[interaction.guild.id].save();
			logMessage = logMessage + 'pingRole:' + role.name + ' ';
			message = message + `${locFile[locale][locale].system.roleSetTo} “${role.name}”\n`;
		} 
		
		if(newLogsChannel != null) {
			if (newLogsChannel.type == 0) {
				configFile[interaction.guild.id].set(`configuration.logsChannel`, newLogsChannel.id);
				configFile[interaction.guild.id].save();
				logsChList.set(interaction.guild.id , client.channels.cache.find(channel => channel.id === newLogsChannel.id));
				logsChannel = client.channels.cache.find(channel => channel.id === newLogsChannel.id);
				logMessage = logMessage + newLogsChannel.name + ' ';
				message = message + `${locFile[locale][locale].system.logsChannelSetTo} “${newLogsChannel.name}”\n`;
			} else {
				logMessage = logMessage + 'logsCh:' + newLogsChannel.name + '(failure) ';
				message = message + `**“${newLogsChannel.name}” ${locFile[locale][locale].system.notATextChannel}**\n`;
			}
		}

		if(progressionEnabled != null) {
			configFile[interaction.guild.id].set(`configuration.progressionDisabled`, (progressionEnabled === "disabled"));
			configFile[interaction.guild.id].save();

			logMessage = logMessage + 'progression:' + progressionEnabled + ' ';
			message = message + `progression ${progressionEnabled}\n`;
		}
		
		if(role == null && eventChannel == null && newLogsChannel == null && progressionEnabled == null) {
			message = message + locFile[locale][locale].system.noOptionsProvided;
		}

		await interaction.reply({ content: message, ephemeral: true });

		if (logsChannel != undefined)
			await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used \`\` “ /${cmdName} ${logMessage}” \`\``);
		console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “ /${cmdName} ${logMessage}”`);
	},
};