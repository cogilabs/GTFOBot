const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, Guild, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { token, guildId } = require('./config.json');
const { supportedLocales } = require('./localization/supportedLocales.json');
const { spawn } = require('child_process');

const logsChannelName = 'dauda-logs';
global.logsChannelName = logsChannelName;

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('./localization/' + lang + '.json');
}

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

	const editJsonFile = require('edit-json-file');
	var completionFile = [];
	client.guilds.cache.forEach(guild => completionFile[guild.id] = editJsonFile('./rundowns/completion-' + guild.id + '.json'));

	global.editJsonFile = editJsonFile;
	global.completionFile = completionFile;

	console.log('Checking completion file...');
	for (var run in rundowns) {
		for (var lt in rundowns[run]) {
			for (var mission in rundowns[run][lt]) {
				for (var mt in rundowns[run][lt][mission].missionTypes) {
					client.guilds.cache.forEach(guild => {
						if (rundowns[run][lt][mission].missionTypes[mt]) {
							if (completionFile[guild.id].get(`completion.${run}.${lt}.${mission}.completed.${mt}`) == undefined) {
								completionFile[guild.id].set(`completion.${run}.${lt}.${mission}.completed.${mt}`, false);
								console.log(`Adding ${run}${mission}:${mt} for server '${guild.id}'...`)
							}
						}
						completionFile[guild.id].save();
					})
				}
			}
		}
	}
	var completion = []
	client.guilds.cache.forEach(guild => completion[guild.id] = require('./rundowns/completion-' + guild.id + '.json'));
	global.completion = completion;

	const embed = new EmbedBuilder()
		.setColor(0x00FF00)
		.setTitle(' ')
		.setDescription(`**App started, <@${client.user.id}> is now online on \`${client.guilds.cache.size}\` server(s)!**`);
	
	console.log(`App started, ${client.user.tag} is now online on ${client.guilds.cache.size} server(s)!`);
	client.user.setPresence({ activities: [{ name: 'Available', type: 4 }], status: 'online' });

	var logsChList = client.channels.cache.filter(channel => channel.name === logsChannelName);
	global.logsChList = logsChList;
	logsChList.forEach(async channel => await channel.send({ embeds: [embed] }));
});

client.on(Events.GuildCreate, async guild => {
	completionFile[guild.id] = editJsonFile('./rundowns/completion-' + guild.id + '.json')
	console.log('New server added, creating completion file...');
	for (var run in rundowns) {
		for (var lt in rundowns[run]) {
			for (var mission in rundowns[run][lt]) {
				for (var mt in rundowns[run][lt][mission].missionTypes) {
					client.guilds.cache.forEach(guild => {
						if (rundowns[run][lt][mission].missionTypes[mt]) {
							if (completionFile[guild.id].get(`completion.${run}.${lt}.${mission}.completed.${mt}`) == undefined) {
								completionFile[guild.id].set(`completion.${run}.${lt}.${mission}.completed.${mt}`, false);
								console.log(`Adding ${run}${mission}:${mt} for server '${guild.id}'...`)
							}
						}
						completionFile[guild.id].save();
					})
				}
			}
		}
	}
	completion[guild.id] = require('./rundowns/completion-' + guild.id + '.json')
	const deployCommands = spawn('node', ['./deploy-commands-global.js']);
});


client.on(Events.GuildScheduledEventCreate, async event => {
	var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);

	var locale = '';
        for (var loc in supportedLocales) {
            if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
        }
        if (locale == '') locale = 'en-US';

	var ping = '';
	var roleName = locFile[locale][locale].events.role;
	var missionName = '';

	console.log(`A new scheduled event has been created by <${event.creatorId}>:`);
	console.log(`- Title: ${event.name}`);
	console.log(`- Description: ${event.description}`);
	console.log(`- Date: ${event.scheduledStartAt}`);

	if (logsChannel != undefined)
		await logsChannel.send(
			`A new scheduled event has been created by \`\` <${event.creatorId}> \`\`:`
			+ `\n - Title: ${event.name}`
			+ `\n - Description: ${event.description}`
			+ `\n - Date: ${event.scheduledStartAt}`
		);

	if (event.guild.channels.cache.find(channel => channel.name === 'general')) {
		var channel = event.guild.channels.cache.find(channel => channel.name === 'general');
	} else {
		console.log('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (logsChannel != undefined)
			await logsChannel.send('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (event.guild.systemChannel) {
			var channel = event.guild.systemChannel;
		} else {
			console.log('This server does not have a system channel, aborting...');
			if (logsChannel != undefined)
				await logsChannel.send('This server does not have a system channel, aborting...');
			return;
		}
	}
	
	oldCh = channel;
	if (event.description.match(/`ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+`/))
		channel = event.guild.channels.cache.find(channel => channel.name === event.description.match(/ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+/)[0].split(':')[1]);
	
	if (channel == undefined)
		channel = oldCh;

	for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
		var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
		missionName = ` ${locFile[locale][locale].events.to} ***${j}***`;
	}

	if (event.guild.roles.cache.find(role => role.name === roleName) != undefined) 
		ping = (locFile[locale][locale].events.ping).replace('#', `<@&${event.guild.roles.cache.find(role => role.name === roleName).id}>`);

	await channel.send(
		ping + (locFile[locale][locale].events.newExpedition).replace('#', missionName)
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
		+ '||​||||​||||​|| _ _ _ _ _ _' + event.url
	); // That mess allows us to show the link embed without the link, and yes, this is a glitch
	await channel.send(`<@${event.creatorId}> ${locFile[locale][locale].events.participate}`);
	console.log(`Sent it to ${channel.name}`);
	console.log(`<${event.creatorId}> automatically joined the event “${event.name}”`);
	if (logsChannel != undefined) {
		await logsChannel.send(`Sent it to \`\` ${channel.name} \`\``);
		await logsChannel.send(`\`\` <${event.creatorId}> \`\` automatically joined the event “${event.name}”`);
	}
});


client.on(Events.GuildScheduledEventUpdate, async (oldEvent, event) => {
	var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);

	var locale = '';
        for (var loc in supportedLocales) {
            if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
        }
        if (locale == '') locale = 'en-US';

	var ping = '';
	var roleName = locFile[locale][locale].events.role;
	var missionName = '';
	var MID = '';
	var MIDp = '';

	if (event.guild.channels.cache.find(channel => channel.name === 'general')) {
		var channel = event.guild.channels.cache.find(channel => channel.name === 'general');
	} else {
		console.log('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (logsChannel != undefined)
			await logsChannel.send('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (event.guild.systemChannel) {
			var channel = event.guild.systemChannel;
		} else {
			console.log('This server does not have a system channel, aborting...');
			if (logsChannel != undefined)
				await logsChannel.send('This server does not have a system channel, aborting...');
			return;
		}
	}
	
	oldCh = channel;
	if (event.description.match(/`ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+`/))
		channel = event.guild.channels.cache.find(channel => channel.name === event.description.match(/ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+/)[0].split(':')[1]);
	
	if (channel == undefined)
		channel = oldCh;

	for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
		var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
		missionName = ` ${locFile[locale][locale].events.to} ***${j}***`;
		MID = j;
		MIDp = ` (${j})`;
	}

	// Event started
	if (oldEvent.status === 1 && event.status === 2) {
	
		if (event.guild.roles.cache.find(role => role.name === roleName) != undefined) 
			ping = (locFile[locale][locale].events.ping).replace('#', `<@&${event.guild.roles.cache.find(role => role.name === roleName).id}>`);

		await channel.send(
			ping + (locFile[locale][locale].events.start).replace('#', missionName)
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
			+ '||​||||​||||​|| _ _ _ _ _ _' + event.url
		); // That mess allows us to show the link embed without the link, and yes, this is a glitch

		if (logsChannel != undefined)
			await logsChannel.send(`Event “${event.name}”${MIDp} started\nSent it to \`\` ${channel.name} \`\``);
		console.log(`Event “${event.name}”${MIDp} started\nSent it to \`${channel.name}\``);

		if (event.guild.id == guildId)
			client.user.setPresence({ activities: [{ name: `GTFO${MIDp}` }], status: 'dnd' });
	}

	// Event finished
	if (oldEvent.status === 2 && event.status === 3) {

		if (MID != '') {
			for (var run in rundowns) {
                for (var lt in rundowns[run]) {
                    for (var id in rundowns[run][lt]) {
                        if (MID == run + id) {
							if (completion[event.guild.id].completion[run][lt][id].completed.main) {
								await channel.send((locFile[locale][locale].events.end.success).replace('#', missionName));
								if (logsChannel != undefined)
									await logsChannel.send(`Event “${event.name}”${MIDp} finished! (success)\nSent it to \`\` ${channel.name} \`\``);
								console.log(`Event “${event.name}”${MIDp} finished! (success)\nSent it to “${channel.name}”`);
							} else {
								await channel.send((locFile[locale][locale].events.end.fail).replace('#', missionName));
								if (logsChannel != undefined)
									await logsChannel.send(`Event “${event.name}”${MIDp} finished! (failure)\nSent it to \`\` ${channel.name} \`\``);
								console.log(`Event “${event.name}”${MIDp} finished! (failure)\nSent it to “${channel.name}”`);
							}
						}
					}
				}
			}
		}
		if (event.guild.id == guildId)
			client.user.setPresence({ activities: [{ name: 'Available', type: 4 }], status: 'online' });
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
								if (completion[event.guild.id].completion[run][lt][id].completed.main) {
									await channel.send((locFile[locale][locale].events.change.success).replace('#', `***${oldMID}***`).replace('Ø', `***${MID}***`));
									if (logsChannel != undefined)
										await logsChannel.send(`Event “${event.name}” (${oldMID}) modified to ${MID}! (success)\nSent it to \`\` ${channel.name} \`\``);
									console.log(`Event “${event.name}”${MIDp} finished! (success)\nSent it to \`${channel.name}\``);
								} else {
									await channel.send((locFile[locale][locale].events.change.fail).replace('#', `***${oldMID}***`).replace('Ø', `***${MID}***`));
									if (logsChannel != undefined)
										await logsChannel.send(`Event “${event.name}” (${oldMID}) modified to ${MID}! (failure)\nSent it to \`\` ${channel.name} \`\``);
									console.log(`Event “${event.name}”${MIDp} finished! (failure)\nSent it to \`\` ${channel.name} \`\``);
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
	var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);

	var locale = '';
        for (var loc in supportedLocales) {
            if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
        }
        if (locale == '') locale = 'en-US';

	if (event.guild.channels.cache.find(channel => channel.name === 'general')) {
		var channel = event.guild.channels.cache.find(channel => channel.name === 'general');
	} else {
		console.log('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (logsChannel != undefined)
			await logsChannel.send('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (event.guild.systemChannel) {
			var channel = event.guild.systemChannel;
		} else {
			console.log('This server does not have a system channel, aborting...');
			if (logsChannel != undefined)
				await logsChannel.send('This server does not have a system channel, aborting...');
			return;
		}
	}
	
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
		await channel.send(`<@${user.id}> ${locFile[locale][locale].events.participate}`);
		console.log(`@${user.tag} joined the event “${event.name}”`);
		if (logsChannel != undefined)
			await logsChannel.send(`\`\` @${user.tag} \`\` joined the event “${event.name}”`);
	}
});

client.on(Events.GuildScheduledEventUserRemove, async (event, user) => {
	var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);

	var locale = '';
        for (var loc in supportedLocales) {
            if (event.guild.preferredLocale == loc) locale = event.guild.preferredLocale;
        }
        if (locale == '') locale = 'en-US';

	var MID = '';

	if (event.guild.channels.cache.find(channel => channel.name === 'general')) {
		var channel = event.guild.channels.cache.find(channel => channel.name === 'general');
	} else {
		console.log('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (logsChannel != undefined)
			await logsChannel.send('This server does not have a channel named \'general\', defaulting to the system channel...');
		if (event.guild.systemChannel) {
			var channel = event.guild.systemChannel;
		} else {
			console.log('This server does not have a system channel, aborting...');
			if (logsChannel != undefined)
				await logsChannel.send('This server does not have a system channel, aborting...');
			return;
		}
	}
	
	oldCh = channel;
	if (event.description.match(/`ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+`/))
		channel = event.guild.channels.cache.find(channel => channel.name === event.description.match(/ch:[aàâbcçdeéèêfghiïjklmnoôpqrstuùûvwxyz-]+/)[0].split(':')[1]);
	
	if (channel == undefined)
		channel = oldCh;

	for (i in (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)) {
		var j = (event.description + ' ' + event.name).match(/R[0-9][A-F][0-9]/g)[i];
		MID = j;
	}
	
	await channel.send(`<@${event.creatorId}> ${locFile[locale][locale].events.noParticipate}`);

	console.log(`@${user.tag} left the event “${event.name}”`);
	if (logsChannel != undefined)
		await logsChannel.send(`\`\` @${user.tag} \`\` left the event “${event.name}”`);
	
});

client.on(Events.MessageCreate, async message => {

	var logsChannel = message.guild.channels.cache.find(channel => channel.name === logsChannelName);
	var locale = '';
	for (var loc in supportedLocales) {
		if (message.guild.preferredLocale == loc) locale = message.guild.preferredLocale;
	}
	if (locale == '') locale = 'en-US';

	msgContent = message.content;
	msgContentLowerCase = msgContent.toLowerCase();
	
	if (msgContent.includes('Date :') && message.channel != logsChannel) {
		await message.react('✅');
		await message.react('❌');
		console.log(`Reacted “✅” and “❌” to “${msgContent}” by ${message.author.tag}`);
		if (logsChannel != undefined)
			await logsChannel.send(`Reacted “✅” and “❌” to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
	}

	if (message.author == client.user) return;

	if (msgContent.includes('@everyone') && message.channel != logsChannel) {
		var emojiName = 'DaudaPing'
		const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === emojiName);
		if (reactionEmoji != undefined) {
			await message.react(reactionEmoji);
			console.log(`Reacted “${emojiName}” to “${msgContent}” by ${message.author.tag}`);
			if (logsChannel != undefined)
				await logsChannel.send(`Reacted \`\` ${emojiName} \`\` to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
		} else {
			console.log(`Tried to react to “${msgContent}” by ${message.author.tag} but no '${emojiName}' emoji was found`);
			if (logsChannel != undefined)
				await logsChannel.send(`Tried to react to \`\` ${msgContent} \`\` by ${message.author.tag} but no \`\` ${emojiName} \`\` emoji was found`);
		}
	}

	// ====================== NEEDS TO BE LOCALIZED !!! ============================
	if (msgContentLowerCase.includes('demande') && msgContentLowerCase.includes('dauda')) {
		await message.react('❓');
		console.log(`Reacted “❓” to “${msgContent}” by ${message.author.tag}`);
		if (logsChannel != undefined)
			await logsChannel.send(`Reacted \`\` ❓ \`\` to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
	}

	if (msgContentLowerCase.includes('l\'état de la mission r') || msgContentLowerCase.includes('l\'état du secteur r')
		|| ((msgContentLowerCase.includes('mission r') || (msgContentLowerCase.includes('secteur r'))) 
			&& (msgContentLowerCase.includes('terminé') || msgContentLowerCase.includes('fini')))
		|| (msgContentLowerCase.includes('terminé r')) || (msgContentLowerCase.includes('fini r'))) {
		var start = msgContentLowerCase.search("mission r") + 8;
		if (start == 7) start = msgContentLowerCase.search("terminé r") + 8;
		if (start == 7) start = msgContentLowerCase.search("fini r") + 5;
		var MID = msgContent.slice(start, start + 4);
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
			console.log(`Reacted “${reaction}” to “${msgContent}” by ${message.author.tag}`);
			if (logsChannel != undefined)
				await logsChannel.send(`Reacted \`\` ${reaction} \`\` to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
		}
		if (reaction == '❔' && message.channel != logsChannel) {
			await message.reply({ content: locFile[locale][locale].system.missionNotFound.replace('#', MID), ephemeral: true });
			console.log(`Answered “${locFile[locale][locale].system.missionNotFound.replace('#', MID)}” to “${msgContent}” by ${message.author.tag}`);
			if (logsChannel != undefined)
				await logsChannel.send(`Answered “${locFile[locale][locale].system.missionNotFound.replace('#', MID)}” to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
		}
	}
	// ====================== NEEDS TO BE LOCALIZED !!! ============================
	if (msgContentLowerCase.includes('merci dauda') || msgContentLowerCase.includes('merci beaucoup dauda') || msgContentLowerCase.includes('merci à toi dauda')) {
		var response = [
			"Mais de rien !",
			"Avec plaisir !",
			"Il n'y a pas de quoi !",
			"Tout le plaisir est pour moi :wink:",
			"De rien :wink:",
			"Mais c'est avec plaisir !"
		]
		var answer = response[Math.floor(Math.random() * response.length)];
		await message.reply(answer);
		console.log(`Answered “${answer}” to “${msgContent}” by ${message.author.tag}`)
		if (logsChannel != undefined)
			await logsChannel.send(`Answered “${answer}” to \`\` ${msgContent} \`\` by \`\` ${message.author.tag} \`\``);
	}
});

//Chat commands interactions
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);

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
		await interaction.reply({ content: locFile[locale][locale].system.commandError, ephemeral: true });
	}
});

//Button interactions
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;
	var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);

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
		await interaction.reply({ content: locFile[locale][locale].system.buttonError, ephemeral: true });
	}
});

client.login(token);