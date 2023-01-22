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
		.setDescription('Configuration of the bot')
		//.setDescription(locFile['en-US']['en-US'].commands[cmdName].description)
        /*.setDescriptionLocalizations({
            fr: locFile['fr']['fr'].commands[cmdName].description,
        })*/
		.addChannelOption(option => 
            option
            .setName('eventchannel')
			.setDescription('The channel where the event messages are sent')
			//.setDescription(locFile['en-US']['en-US'].commands[cmdName].option1)
			/*.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option1,
			})*/)
		.addStringOption(option => 
            option
            .setName('option2')
			.setDescription('The second option')
			//.setDescription(locFile['en-US']['en-US'].commands[cmdName].option1)
			/*.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option1,
			})*/)
		.addStringOption(option => 
            option
            .setName('option3')
			.setDescription('The third option')
			//.setDescription(locFile['en-US']['en-US'].commands[cmdName].option2)
			/*.setDescriptionLocalizations({
				fr: locFile['fr']['fr'].commands[cmdName].option2,
			})*/)
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
        var locale = '';
		var message = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
        var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
		const eventChannel = interaction.options.getChannel('eventchannel');
		const option2 = interaction.options.getString('option2');
		const option3 = interaction.options.getString('option3');
		if (eventChannel != null) {
			console.log('Channel:', eventChannel);
			if (eventChannel.type == 0) {
				completionFile[interaction.guild.id].set(`configuration.eventChannel`, eventChannel.id);
				completionFile[interaction.guild.id].save();
				message = eventChannel.name + ' (Success)';
				await interaction.reply({ content: 'Done.', ephemeral: true });
				await interaction.deleteReply();
			} else {
				message = eventChannel.name + ' (failure)';
				const embed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle('**Error**')
					.setDescription(`**This is not a text channel!**`);
				await interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}
		if (option2 != null) {
			console.log('Option2:', option2);
			message = "Option2";
			await interaction.reply({ content: locFile[locale][locale].system.sending, ephemeral: true });
			await interaction.deleteReply();
		}
		if (option3 != null) {
			console.log('Option3:', option3);
			message = "Option3";
			await interaction.reply({ content: locFile[locale][locale].system.sending, ephemeral: true });
			await interaction.deleteReply();
		}

		if (logsChannel != undefined)
			await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used \`\` “/${cmdName} ${message}” \`\``);
		console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “/${cmdName} ${message}”`);

		/*await interaction.channel.send({ content: message });*/
	},
};