// GTFOBot.js - GTFO Discord Companion app
// Copyright (C) 2022 David "0Davgi0" Girou
// License: BSD2.

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { setInterval } = require('node:timers');
const { token, guildId } = require('./config.json');
const { supportedLocales } = require('./localization/supportedLocales.json');
const { spawn } = require('child_process');
const { compCheck, glitchText, logToServer, channelSelection } = require('./modules/smallModules.js')

const logsChannelName = 'dauda-logs';
global.logsChannelName = logsChannelName;

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('./localization/' + lang + '.json');
}

var playingTeams = 0;

const editJsonFile = require('edit-json-file');

var outputFile = editJsonFile('./outputWeb/outputFile.json')

const { rundowns } = require('./rundowns/rundowns.json');
global.rundowns = rundowns;

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.MessageContent, 
		GatewayIntentBits.GuildScheduledEvents 
	],
	partials: [
		Partials.User
	]
});
global.client = client;

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
	client.user.setPresence({ activities: [{ name: `Starting...` }], status: 'away' });

	var configFile = [];
	client.guilds.cache.forEach(guild => configFile[guild.id] = editJsonFile('./rundowns/server-' + guild.id + '.json'));

	global.editJsonFile = editJsonFile;
	global.configFile = configFile;

    console.log('Checking configuration files...');
	compCheck();
    var completion = []
    client.guilds.cache.forEach(guild => completion[guild.id] = require('./rundowns/server-' + guild.id + '.json'));
	global.completion = completion;

	// Removed while the bot restarts 4 times a day
	////const embed = new EmbedBuilder()
		////.setColor(0x00FF00)
		////.setTitle(' ')
		////.setDescription(`**App started, <@${client.user.id}> is now online on \`${client.guilds.cache.size}\` server(s)!**`);
	
	console.log(`App started, ${client.user.tag} is now online on ${client.guilds.cache.size} server(s)!`);
	client.user.setPresence({ activities: [{ name: 'Available', type: 4 }], status: 'online' });

	var logsChList = new Map();
	client.channels.cache.filter(channel => channel.name === logsChannelName).forEach(channel => {
		logsChList.set(channel.guild.id , channel);
	})
	client.guilds.cache.forEach(guild => {
		if (completion[guild.id].configuration != undefined && completion[guild.id].configuration.logsChannel != undefined) {
			logsChList.set(guild.id , client.channels.cache.find(channel => channel.id === completion[guild.id].configuration.logsChannel));
		}
	});

	global.logsChList = logsChList;
	// Removed while the bot restarts 4 times a day
	//// logsChList.forEach(async channel => await channel.send({ embeds: [embed] }));

	function updateTime() {
		outputFile.set('time', Math.floor(Date.now()/ 1000).toString());
		outputFile.save();
	}
	updateTime();
	setInterval(updateTime, 60 * 1000);

	outputFile.set('numberOfServers', (client.guilds.cache.size).toString());
	outputFile.save();
});

client.on(Events.GuildCreate, async guild => {
	configFile[guild.id] = editJsonFile('./rundowns/server-' + guild.id + '.json');
	var mainGuild = client.guilds.cache.find(mainGuild => mainGuild.id == guildId);
	var mainGuildLogsChannel = mainGuild.channels.cache.find(channel => channel.name === logsChannelName);
	if (mainGuildLogsChannel != undefined)
		await mainGuildLogsChannel.send(`New server added: “${guild.name}” (${guild.id}) creating configuration file...`);
	console.log(`New server added: “${guild.name}” (${guild.id}) creating configuration file...`);
	compCheck();
	completion[guild.id] = require('./rundowns/server-' + guild.id + '.json');
	if (mainGuildLogsChannel != undefined)
		await mainGuildLogsChannel.send('New server\'s configuration file added, redeploying commands...');
	console.log('New server\'s configuration file added, redeploying commands...');
	const deployCommands = spawn('node', ['./deploy-commands-global.js']);
	if (mainGuildLogsChannel != undefined)
		await mainGuildLogsChannel.send('Commands redeployed');
	console.log('Commands redeployed');

	outputFile.set('numberOfServers', (client.guilds.cache.size).toString());
	outputFile.save();
});

client.on(Events.GuildDelete, async guild => {
	fs.unlink('./rundowns/server-' + guild.id + '.json', (err) => {
		if (err) throw err;
		console.log('./rundowns/server-' + guild.id + '.json was deleted');
	  });

	  outputFile.set('numberOfServers', (client.guilds.cache.size).toString());
	  outputFile.save();
});

client.on(Events.GuildScheduledEventCreate, async event => {
	if (!event.description.match("GTFO") && !configFile[event.guild.id].get(`configuration.eventRequirementDisabled`)) return;
	var configLogsChannel = configFile[event.guild.id].get(`configuration.logsChannel`);
	if (configLogsChannel != undefined) var logsChannel = event.guild.channels.cache.find(channel => channel.id === configLogsChannel);
	else var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);

	var locale = '';
	for (var loc in supportedLocales) {
		if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
	}
	if (locale == '') locale = 'en-US';

	var ping = '';
	var roleName = locFile[locale][locale].events?.role ?? locFile["en-US"]["en-US"].events.role;
	var missionName = '';

	logToServer(logsChannel, `A new scheduled event has been created by \`\` <${event.creatorId}> \`\`:`
	+ `\n - Title: ${event.name}`
	+ `\n - Description: ${event.description}`
	+ `\n - Date: ${event.scheduledStartAt}`);

	var channel = channelSelection(event, logsChannel);
	if (channel == null) return
	
	oldCh = channel;
	if (event.description.match(/`ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+`/))
		channel = event.guild.channels.cache.find(channel => channel.name === event.description.match(/ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+/)[0].split(':')[1]);
	
	if (channel == undefined)
		channel = oldCh;

	for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
		var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
		missionName = ` ${locFile[locale][locale].events?.to ?? locFile["en-US"]["en-US"].events.to} ***${j}***`;
	}

	var prisonersRole = configFile[event.guild.id].get(`configuration.prisonersRole`);
	if (prisonersRole != undefined)
		ping = (locFile[locale][locale].events?.ping ?? locFile["en-US"]["en-US"].events.ping).replace('#', `<@&${event.guild.roles.cache.find(role => role.id === prisonersRole).id}>`);
	else if (event.guild.roles.cache.find(role => role.name === roleName) != undefined) 
		ping = (locFile[locale][locale].events?.ping ?? locFile["en-US"]["en-US"].events.ping).replace('#', `<@&${event.guild.roles.cache.find(role => role.name === roleName).id}>`);

	await channel.send(ping + (locFile[locale][locale].events?.newExpedition ?? locFile["en-US"]["en-US"].events.newExpedition).replace('#', missionName) + glitchText + event.url);
	await channel.send(`<@${event.creatorId}> ${locFile[locale][locale].events?.participate ?? locFile["en-US"]["en-US"].events.participate}`);
	logToServer(logsChannel, `Sent it to \`\` ${channel.name} \`\``);
	logToServer(logsChannel, `\`\` <${event.creatorId}> \`\` automatically joined the event “${event.name}”`);
});


client.on(Events.GuildScheduledEventUpdate, async (oldEvent, event) => {
	if (!event.description.match("GTFO") && !configFile[event.guild.id].get(`configuration.eventRequirementDisabled`)) return;
	var configLogsChannel = configFile[event.guild.id].get(`configuration.logsChannel`);
		if (configLogsChannel != undefined) {
			var logsChannel = event.guild.channels.cache.find(channel => channel.id === configLogsChannel);
		} else {
			var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);
		}

	var locale = '';
        for (var loc in supportedLocales) {
            if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
        }
        if (locale == '') locale = 'en-US';

	var ping = '';
	var roleName = locFile[locale][locale].events?.role ?? locFile["en-US"]["en-US"].events.role;
	var missionName = '';
	var MID = '';
	var MIDp = '';

	var channel = channelSelection(event, logsChannel);
	if (channel == null) return
	
	oldCh = channel;
	if (event.description.match(/`ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+`/))
		channel = event.guild.channels.cache.find(channel => channel.name === event.description.match(/ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+/)[0].split(':')[1]);
	
	if (channel == undefined)
		channel = oldCh;

	for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
		var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
		missionName = ` ${locFile[locale][locale].events?.to ?? locFile["en-US"]["en-US"].events.to} ***${j}***`;
		MID = j;
		MIDp = ` (${j})`;
	}

	// Event started
	if (oldEvent.status === 1 && event.status === 2) {
	
		var prisonersRole = configFile[event.guild.id].get(`configuration.prisonersRole`);
		if (prisonersRole != undefined)
		ping = (locFile[locale][locale].events?.ping ?? locFile["en-US"]["en-US"].events.ping).replace('#', `<@&${event.guild.roles.cache.find(role => role.id === prisonersRole).id}>`);
		else if (event.guild.roles.cache.find(role => role.name === roleName) != undefined) 
			ping = (locFile[locale][locale].events?.ping ?? locFile["en-US"]["en-US"].events.ping).replace('#', `<@&${event.guild.roles.cache.find(role => role.name === roleName).id}>`);

		await channel.send(ping + (locFile[locale][locale].events?.start ?? locFile["en-US"]["en-US"].events.start).replace('#', missionName) + glitchText + event.url);

		logToServer(logsChannel, `Event “${event.name}”${MIDp} started\nSent it to \`\` ${channel.name} \`\``);

		playingTeams++;
		
		if (playingTeams == 1)
			client.user.setPresence({ activities: [{ name: `GTFO${MIDp}` }], status: 'online' });
		else
			client.user.setPresence({ activities: [{ name: `GTFO (with ${playingTeams} teams)` }], status: 'online' });
	}

	// Event finished
	if (oldEvent.status === 2 && event.status === 3) {

		if (MID != '') {
			for (var run in rundowns) {
                for (var lt in rundowns[run]) {
                    for (var id in rundowns[run][lt]) {
                        if (MID == run + id) {
							if (!configFile[event.guild.id].get(`configuration.progressionDisabled`)) {
								if (completion[event.guild.id].completion[run][lt][id].completed.main) {
									await channel.send((locFile[locale][locale].events?.end?.success ?? locFile["en-US"]["en-US"].events.end.success).replace('#', missionName));
									logToServer(logsChannel, `Event “${event.name}”${MIDp} finished! (success)\nSent it to \`\` ${channel.name} \`\``);
								} else {
									await channel.send((locFile[locale][locale].events?.end?.fail ?? locFile["en-US"]["en-US"].events.end.fail).replace('#', missionName));
									logToServer(logsChannel, `Event “${event.name}”${MIDp} finished! (failure)\nSent it to \`\` ${channel.name} \`\``);
								}
							} else {
								await channel.send((locFile[locale][locale].events?.end?.noProgression ?? locFile["en-US"]["en-US"].events.end.noProgression).replace('#', missionName));
								logToServer(logsChannel, `Event “${event.name}”${MIDp} finished! \nSent it to \`\` ${channel.name} \`\``);
							}
						}
					}
				}
			}
		}

		if (playingTeams > 0) playingTeams--;
		
		if (playingTeams == 0)
			client.user.setPresence({ activities: [{ name: 'Available', type: 4 }], status: 'online' });
		else if (playingTeams == 1)
			client.user.setPresence({ activities: [{ name: `GTFO (with 1 team)` }], status: 'online' });
		else
			client.user.setPresence({ activities: [{ name: `GTFO (with ${playingTeams} teams)` }], status: 'online' });
	}

	// Event modified
	if ((oldEvent.name != event.name) || (oldEvent.description != event.description)) {
		var oldMID = '';

		for (i in (oldEvent.description + ' ' + oldEvent.name).match(/R[0-9][A-F][0-9]/g)) {
			var j = (oldEvent.description + ' ' + oldEvent.name).match(/R[0-9][A-F][0-9]/g)[i];
			oldMID = j;
		}
		for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
			var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
			MID = j;
		}

		if (MID != oldMID) {
			if (oldMID != '') {
				for (var run in rundowns) {
					for (var lt in rundowns[run]) {
						for (var id in rundowns[run][lt]) {
							if (oldMID == run + id) {
								if (!configFile[event.guild.id].get(`configuration.progressionDisabled`)) {
									if (completion[event.guild.id].completion[run][lt][id].completed.main) {
										await channel.send((locFile[locale][locale].events?.change?.success ?? locFile["en-US"]["en-US"].events.change.success).replace('#', `***${oldMID}***`).replace('Ø', `***${MID}***`));
										logToServer(logsChannel, `Event “${event.name}”${MIDp} finished! (success)\nSent it to \`${channel.name}\``);
									} else {
										await channel.send((locFile[locale][locale].events?.change?.fail ?? locFile["en-US"]["en-US"].events.change.fail).replace('#', `***${oldMID}***`).replace('Ø', `***${MID}***`));
										logToServer(logsChannel, `Event “${event.name}” (${oldMID}) modified to ${MID}! (failure)\nSent it to \`\` ${channel.name} \`\``);
									}
								} else {
									await channel.send((locFile[locale][locale].events?.change?.noProgression ?? locFile["en-US"]["en-US"].events.change.noProgression).replace('#', `***${oldMID}***`).replace('Ø', `***${MID}***`));
									logToServer(logsChannel, `Event “${event.name}” (${oldMID}) modified to ${MID}!\nSent it to \`\` ${channel.name} \`\``);
								}
							}
						}
					}
				}
				if (event.guild.id == guildId)
					client.user.setPresence({ activities: [{ name: `GTFO (${MID})` }], status: 'dnd' });
			}
		}

	}
});


client.on(Events.GuildScheduledEventUserAdd, async (event, user) => {
	if (!event.description.match("GTFO") && !configFile[event.guild.id].get(`configuration.eventRequirementDisabled`)) return;
	var configLogsChannel = configFile[event.guild.id].get(`configuration.logsChannel`);
		if (configLogsChannel != undefined) {
			var logsChannel = event.guild.channels.cache.find(channel => channel.id === configLogsChannel);
		} else {
			var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);
		}

	var locale = '';
	for (var loc in supportedLocales) {
		if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
	}
	if (locale == '') locale = 'en-US';

	var channel = channelSelection(event, logsChannel);
	if (channel == null) return
	
	oldCh = channel;
	if (event.description.match(/`ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+`/))
		channel = event.guild.channels.cache.find(channel => channel.name === event.description.match(/ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+/)[0].split(':')[1]);
	
	if (channel == undefined)
		channel = oldCh;

	for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
		var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
		MID = j;
	}

	if (Date.now() > event.createdTimestamp + 10000) {
		await channel.send(`<@${user.id}> ${locFile[locale][locale].events?.participate ?? locFile["en-US"]["en-US"].events.participate}`);
		logToServer(logsChannel, `\`\` @${user.tag} \`\` joined the event “${event.name}”`);
	}
});

client.on(Events.GuildScheduledEventUserRemove, async (event, user) => {
	if (!event.description.match("GTFO") && !configFile[event.guild.id].get(`configuration.eventRequirementDisabled`)) return;
	var configLogsChannel = configFile[event.guild.id].get(`configuration.logsChannel`);
		if (configLogsChannel != undefined) {
			var logsChannel = event.guild.channels.cache.find(channel => channel.id === configLogsChannel);
		} else {
			var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);
		}

	var locale = '';
	for (var loc in supportedLocales) {
		if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
	}
	if (locale == '') locale = 'en-US';

	var channel = channelSelection(event, logsChannel);
	if (channel == null) return
	
	oldCh = channel;
	if (event.description.match(/`ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+`/))
		channel = event.guild.channels.cache.find(channel => channel.name === event.description.match(/ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+/)[0].split(':')[1]);
	
	if (channel == undefined)
		channel = oldCh;

	for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
		var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
		MID = j;
	}
	
	await channel.send(`<@${event.creatorId}> ${locFile[locale][locale].events?.noParticipate ?? locFile["en-US"]["en-US"].events.noParticipate}`);

	logToServer(logsChannel, `\`\` @${user.tag} \`\` left the event “${event.name}”`);
	
});

client.on(Events.MessageCreate, async message => {
	var configLogsChannel = configFile[message.guild.id].get(`configuration.logsChannel`);
		if (configLogsChannel != undefined) {
			var logsChannel = message.guild.channels.cache.find(channel => channel.id === configLogsChannel);
		} else {
			var logsChannel = message.guild.channels.cache.find(channel => channel.name === logsChannelName);
		}
	var locale = '';
	for (var loc in supportedLocales) {
		if (message.guild.preferredLocale == loc) locale = message.guild.preferredLocale;
	}
	if (locale == '') locale = 'en-US';
	
	if ((message.content).includes('Date :') && message.channel != logsChannel) {
		await message.react('✅');
		await message.react('❌');
		logToServer(logsChannel, `Reacted “✅” and “❌” to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
	}

	if (message.author == client.user) return;

	msgContent = message.content;
	msgContentLowerCase = msgContent.toLowerCase();

	if (msgContent.includes('@everyone') && message.channel != logsChannel) {
		const mainGuild = client.guilds.cache.find(mainGuild => mainGuild.id == guildId);
		var emojiName = 'DaudaPing'
		const reactionEmoji = mainGuild.emojis.cache.find(emoji => emoji.name === emojiName);
		if (reactionEmoji != undefined) {
			await message.react(reactionEmoji);
			logToServer(logsChannel, `Reacted \`\` ${emojiName} \`\` to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
		} else {
			logToServer(logsChannel, `Tried to react to \`\` ${msgContent} \`\` by ${message.author.tag} but no \`\` ${emojiName} \`\` emoji was found`);
		}
	}

	if (locFile[locale][locale].chat?.ask && (msgContentLowerCase.includes(locFile[locale][locale].chat.ask) && msgContentLowerCase.includes('dauda'))) {
		await message.react('❓');
		logToServer(logsChannel, `Reacted \`\` ❓ \`\` to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
	}

	function checker(x) {
		return msgContentLowerCase.includes(x);
	}

	var finishedMissionR = [];

	if (locFile[locale][locale].chat?.finished && locFile[locale][locale].chat?.missionR) {
		for (i in locFile[locale][locale].chat.finished) {
			for (j in locFile[locale][locale].chat.missionR) {
				finishedMissionR.push(locFile[locale][locale].chat.finished[i] + ' ' + locFile[locale][locale].chat.missionR[j]);
			}
		}
	}
	
	if ((finishedMissionR).some(checker)) {
		if (!configFile[message.guild.id].get(`configuration.progressionDisabled`)) {
			for (i in msgContent.match(/R[0-9][A-F][0-9]/g)) {
				var MID = msgContent.match(/R[0-9][A-F][0-9]/g)[i];
				var reaction = '';
				if (MID.length == 4 && !MID.includes('!') && !MID.includes('?') && !MID.includes('.')) {
					var run = MID.slice(0,2);
					var lt = MID.slice(2,3);
					var id = MID.slice(2,4);
					var mt = 'main';
					if (completion[message.guild.id].completion[run] != undefined) {
						if (completion[message.guild.id].completion[run][lt] != undefined) {
							if (completion[message.guild.id].completion[run][lt][id] != undefined) {
								if (completion[message.guild.id].completion[run][lt][id].completed != undefined) {
									if (completion[message.guild.id].completion[run][lt][id].completed[mt] == true) reaction = '✅';
									if (completion[message.guild.id].completion[run][lt][id].completed[mt] == false) reaction = '❌';
								} else reaction = '❔';
							} else reaction = '❔';
						}
					}
				}
				if (reaction != '' && message.channel != logsChannel) {
					await message.react(reaction);
					logToServer(logsChannel, `Reacted \`\` ${reaction} \`\` to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
				}
				if (reaction == '❔' && message.channel != logsChannel) {
					await message.reply({ content: (locFile[locale][locale].system?.missionNotFound ?? locFile["en-US"]["en-US"].system.missionNotFound).replace('#', MID), ephemeral: true });
					logToServer(logsChannel, `Answered “${(locFile[locale][locale].system?.missionNotFound ?? locFile["en-US"]["en-US"].system.missionNotFound).replace('#', MID)}” to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
				}
			}
		}
	}

	if (locFile[locale][locale].chat?.thanks && (locFile[locale][locale].chat.thanks).some(checker)) {
		var response = locFile[locale][locale].chat?.youreWelcome ?? locFile["en-US"]["en-US"].chat.youreWelcome;
		var answer = response[Math.floor(Math.random() * response.length)];
		await message.reply(answer);
		logToServer(logsChannel, `Answered “${answer}” to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
	}
});

// Chat commands interactions
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	var configLogsChannel = configFile[interaction.guild.id].get(`configuration.logsChannel`);
		if (configLogsChannel != undefined) {
			var logsChannel = interaction.guild.channels.cache.find(channel => channel.id === configLogsChannel);
		} else {
			var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
		}

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
		await interaction.reply({ content: locFile[locale][locale].system?.commandError ?? locFile["en-US"]["en-US"].system.commandError, ephemeral: true });
	}
});

// Button interactions
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;
	var configLogsChannel = configFile[interaction.guild.id].get(`configuration.logsChannel`);
		if (configLogsChannel != undefined) {
			var logsChannel = interaction.guild.channels.cache.find(channel => channel.id === configLogsChannel);
		} else {
			var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
		}

	const commandArray = (interaction.customId).split('-');

	const command = client.commands.get(commandArray[0]);

	if (!command) return;

	try {
		await command.replyButton(interaction);
	} catch (error) {
		console.error(error);
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
		await interaction.reply({ content: locFile[locale][locale].system?.buttonError ?? locFile["en-US"]["en-US"].system.buttonError, ephemeral: true });
	}
});

client.login(token);