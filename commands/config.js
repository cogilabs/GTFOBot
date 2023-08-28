// config.js - GTFO Discord Companion app config command
// Copyright (C) 2022 David "0Davgi0" Girou
// License: BSD2.

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');
const { logToServer } = require('../modules/smallModules.js')
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
            fr: locFile['fr']['fr'].commands?.[cmdName]?.description ?? locFile['en-US']['en-US'].commands[cmdName].description,
        })
		.addChannelOption(option => 
            option
            .setName(locFile['en-US']['en-US'].commands[cmdName].eventchannel.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.eventchannel?.name ?? locFile['en-US']['en-US'].commands[cmdName].eventchannel.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].eventchannel.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.eventchannel?.description ?? locFile['en-US']['en-US'].commands[cmdName].eventchannel.description,
			}))
		.addRoleOption(option => 
            option
            .setName(locFile['en-US']['en-US'].commands[cmdName].prisonersrole.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.prisonersrole?.name ?? locFile['en-US']['en-US'].commands[cmdName].prisonersrole.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].prisonersrole.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.prisonersrole?.description ?? locFile['en-US']['en-US'].commands[cmdName].prisonersrole.description,
			}))
		.addChannelOption(option => 
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].logschannel.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.logschannel?.name ?? locFile['en-US']['en-US'].commands[cmdName].logschannel.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].logschannel.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.logschannel?.description ?? locFile['en-US']['en-US'].commands[cmdName].logschannel.description,
			}))
		.addStringOption(option =>
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].eventrequirement.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.eventrequirement?.name ?? locFile['en-US']['en-US'].commands[cmdName].eventrequirement.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].eventrequirement.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.eventrequirement?.description ?? locFile['en-US']['en-US'].commands[cmdName].eventrequirement.description,
			})
			.addChoices(
				{ name: locFile['en-US']['en-US'].system.enable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.enable ?? locFile['en-US']['en-US'].system.enable,
				},
				value: 'enabled' },
				{ name: locFile['en-US']['en-US'].system.disable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.disable ?? locFile['en-US']['en-US'].system.disable,
				},
				value: 'disabled' },
			))
		.addStringOption(option =>
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].progression.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.progression?.name ?? locFile['en-US']['en-US'].commands[cmdName].progression.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].progression.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.progression?.description ?? locFile['en-US']['en-US'].commands[cmdName].progression.description,
			})
			.addChoices(
				{ name: locFile['en-US']['en-US'].system.enable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.enable ?? locFile['en-US']['en-US'].system.enable,
				},
				value: 'enabled' },
				{ name: locFile['en-US']['en-US'].system.disable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.disable ?? locFile['en-US']['en-US'].system.disable,
				},
				value: 'disabled' },
			))
		.addStringOption(option =>
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].unlock.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.unlock?.name ?? locFile['en-US']['en-US'].commands[cmdName].unlock.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].unlock.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.unlock?.description ?? locFile['en-US']['en-US'].commands[cmdName].unlock.description,
			})
			.addChoices(
				{ name: locFile['en-US']['en-US'].system.enable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.enable ?? locFile['en-US']['en-US'].system.enable,
				},
				value: 'enabled' },
				{ name: locFile['en-US']['en-US'].system.disable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.disable ?? locFile['en-US']['en-US'].system.disable,
				},
				value: 'disabled' },
			))
		.addStringOption(option =>
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].playable.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.playable?.name ?? locFile['en-US']['en-US'].commands[cmdName].playable.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].playable.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.playable?.description ?? locFile['en-US']['en-US'].commands[cmdName].playable.description,
			})
			.addChoices(
				{ name: locFile['en-US']['en-US'].system.enable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.enable ?? locFile['en-US']['en-US'].system.enable,
				},
				value: 'enabled' },
				{ name: locFile['en-US']['en-US'].system.disable, 
				name_localizations: {
					fr: locFile['fr']['fr'].system?.disable ?? locFile['en-US']['en-US'].system.disable,
				},
				value: 'disabled' },
			))
		.addStringOption(option =>
			option
			.setName(locFile['en-US']['en-US'].commands[cmdName].resetprogression.name)
			.setNameLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.resetprogression?.name ?? locFile['en-US']['en-US'].commands[cmdName].resetprogression.name,
			})
			.setDescription(locFile['en-US']['en-US'].commands[cmdName].resetprogression.description)
			.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands?.[cmdName]?.resetprogression?.description ?? locFile['en-US']['en-US'].commands[cmdName].resetprogression.description,
			})
			)
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
		const eventChannel = interaction.options.getChannel(locFile['en-US']['en-US'].commands[cmdName].eventchannel.name);
		const role = interaction.options.getRole(locFile['en-US']['en-US'].commands[cmdName].prisonersrole.name);
		const newLogsChannel = interaction.options.getChannel(locFile['en-US']['en-US'].commands[cmdName].logschannel.name);
		const eventRequirement = interaction.options.getString(locFile['en-US']['en-US'].commands[cmdName].eventrequirement.name);
		const progressionEnabled = interaction.options.getString(locFile['en-US']['en-US'].commands[cmdName].progression.name);
		const unlockMechanism = interaction.options.getString(locFile['en-US']['en-US'].commands[cmdName].unlock.name);
		const visuallyPlayable = interaction.options.getString(locFile['en-US']['en-US'].commands[cmdName].playable.name);
		const resetProgression = interaction.options.getString(locFile['en-US']['en-US'].commands[cmdName].resetprogression.name);
		if (eventChannel != null) {
			if (eventChannel.type == 0) {
				configFile[interaction.guild.id].set(`configuration.eventChannel`, eventChannel.id);
				configFile[interaction.guild.id].save();
				logMessage = 'eventCh:' + eventChannel.name + '(Success) ';
				message = message + `${locFile[locale][locale].system?.eventChannelSetTo ?? locFile["en-US"]["en-US"].system.eventChannelSetTo} “${eventChannel.name}”\n`;
			} else {
				logMessage = 'eventCh:' + eventChannel.name + '(failure) ';
				message = message + `**“${eventChannel.name}” ${locFile[locale][locale].system?.notATextChannel ?? locFile["en-US"]["en-US"].system.notATextChannel}**\n`;
			}
		}
		
		if (role != null) {
			configFile[interaction.guild.id].set(`configuration.prisonersRole`, role.id);
			configFile[interaction.guild.id].save();
			logMessage = logMessage + 'pingRole:' + role.name + ' ';
			message = message + `${locFile[locale][locale].system?.roleSetTo ?? locFile["en-US"]["en-US"].system.roleSetTo} “${role.name}”\n`;
		} 
		
		if (newLogsChannel != null) {
			if (newLogsChannel.type == 0) {
				configFile[interaction.guild.id].set(`configuration.logsChannel`, newLogsChannel.id);
				configFile[interaction.guild.id].save();
				logsChList.set(interaction.guild.id , client.channels.cache.find(channel => channel.id === newLogsChannel.id));
				logsChannel = client.channels.cache.find(channel => channel.id === newLogsChannel.id);
				logMessage = logMessage + 'logsCh:' + newLogsChannel.name + ' ';
				message = message + `${locFile[locale][locale].system?.logsChannelSetTo ?? locFile["en-US"]["en-US"].system.logsChannelSetTo} “${newLogsChannel.name}”\n`;
			} else {
				logMessage = logMessage + 'logsCh:' + newLogsChannel.name + '(failure) ';
				message = message + `**“${newLogsChannel.name}” ${locFile[locale][locale].system?.notATextChannel ?? locFile["en-US"]["en-US"].system.notATextChannel}**\n`;
			}
		}

		if (eventRequirement != null) {
			configFile[interaction.guild.id].set(`configuration.eventRequirementDisabled`, (eventRequirement === "disabled"));
			configFile[interaction.guild.id].save();

			logMessage = logMessage + 'eventRequirement:' + eventRequirement + ' ';
			message = message + `${locFile[locale][locale].system?.eventRequirementSet ?? locFile["en-US"]["en-US"].system.eventRequirementSet} ${locFile[locale][locale].system?.[eventRequirement] ?? locFile["en-US"]["en-US"].system[eventRequirement]}\n`;
		}

		if (progressionEnabled != null) {
			configFile[interaction.guild.id].set(`configuration.progressionDisabled`, (progressionEnabled === "disabled"));
			configFile[interaction.guild.id].save();

			logMessage = logMessage + 'progression:' + progressionEnabled + ' ';
			message = message + `${locFile[locale][locale].system?.progressionModeSet ?? locFile["en-US"]["en-US"].system.progressionModeSet} ${locFile[locale][locale].system?.[progressionEnabled] ?? locFile["en-US"]["en-US"].system[progressionEnabled]}\n`;
		}

		if (unlockMechanism != null) {
			configFile[interaction.guild.id].set(`configuration.progressionDisabled`, (unlockMechanism === "disabled"));
			configFile[interaction.guild.id].save();

			logMessage = logMessage + 'unlockingMechanism:' + unlockMechanism + ' ';
			message = message + `${locFile[locale][locale].system?.unlockMechanismSet ?? locFile["en-US"]["en-US"].system.unlockMechanismSet} ${locFile[locale][locale].system?.[unlockMechanism] ?? locFile["en-US"]["en-US"].system[unlockMechanism]}\n`;
		}

		if (visuallyPlayable != null) {
			configFile[interaction.guild.id].set(`configuration.progressionDisabled`, (visuallyPlayable === "disabled"));
			configFile[interaction.guild.id].save();

			logMessage = logMessage + 'visuallyPlayable:' + visuallyPlayable + ' ';
			message = message + `${locFile[locale][locale].system?.visuallyPlayableSet ?? locFile["en-US"]["en-US"].system.visuallyPlayableSet} ${locFile[locale][locale].system?.[visuallyPlayable] ?? locFile["en-US"]["en-US"].system[visuallyPlayable]}\n`;
		}

		if (resetProgression != null) {
			if (resetProgression == (locFile[locale][locale].commands?.[cmdName]?.resetprogression?.confirm ?? locFile["en-US"]["en-US"].commands[cmdName].resetprogression.confirm)) {
				for (var run in rundowns) {
					for (var lt in rundowns[run]) {
						for (var mission in rundowns[run][lt]) {
							for (var mt in rundowns[run][lt][mission].missionTypes) {
								client.guilds.cache.forEach(guild => {
									if (rundowns[run][lt][mission].missionTypes[mt]) {
										configFile[interaction.guild.id].set(`completion.${run}.${lt}.${mission}.completed.${mt}`, false);
									}
									configFile[interaction.guild.id].save();
								})
							}
						}
					}
				}				
				logMessage = logMessage + 'reset:' + resetProgression + '(success) ';
				message = message + `${locFile[locale][locale].system?.progressionReset ?? locFile["en-US"]["en-US"].system.progressionReset}\n`;
			} else {
				logMessage = logMessage + 'reset:' + resetProgression + '(fail) ';
				message = message + `${(locFile[locale][locale].system?.progressionNoReset ?? locFile["en-US"]["en-US"].system.progressionNoReset).replace('#', resetProgression)}\n`;
			}
		}
		
		if(role == null && eventChannel == null && newLogsChannel == null && eventRequirement == null && progressionEnabled == null && unlockMechanism == null && visuallyPlayable == null && resetProgression == null) {
			message = message + (locFile[locale][locale].system?.noOptionsProvided ?? locFile["en-US"]["en-US"].system.noOptionsProvided);
		}

		await interaction.reply({ content: message, ephemeral: true });

		logToServer(logsChannel, `${interaction.user.tag} <${interaction.user.id}> used \`\` “ /${cmdName} ${logMessage}” \`\``);
	},
};