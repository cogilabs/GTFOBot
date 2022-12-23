const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { supportedLocales } = require('./localization/supportedLocales.json');

const logsChannelName = 'dauda-logs';
global.logsChannelName = logsChannelName;

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('./localization/' + lang + '.json');
}

const { rundowns } = require('./rundowns/rundowns.json');
global.rundowns = rundowns;

const editJsonFile = require('edit-json-file');
let file = editJsonFile('./rundowns/completion.json');

const client = new Client({ intents: [
	GatewayIntentBits.Guilds, 
	GatewayIntentBits.GuildMessages, 
	GatewayIntentBits.MessageContent, 
	GatewayIntentBits.GuildScheduledEvents 
] });
global.client = client;

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	client.user.setPresence({ activities: [{ name: 'Starting...' }], status: 'away' });
	console.log('Checking completion file...');
	for (var run in rundowns) {
		for (var lt in rundowns[run]) {
			for (var mission in rundowns[run][lt]) {
				for (var mt in rundowns[run][lt][mission].missionTypes) {
					if (rundowns[run][lt][mission].missionTypes[mt]) {
						if (file.get(`completion.${run}.${lt}.${mission}.completed.${mt}`) == undefined) {
							file.set(`completion.${run}.${lt}.${mission}.completed.${mt}`, false);
							console.log(`Adding ${run}${mission}:${mt}...`)
						}
					}
					file.save();
				}
			}
		}
	}
	var { completion } = require('./rundowns/completion.json');
	global.completion = completion;
	
	console.log(`App started, ${client.user.tag} is now playing GTFO!`);
	client.user.setPresence({ activities: [{ name: 'GTFO' }], status: 'online' });
});

client.on(Events.GuildScheduledEventCreate, async event => {
	var logsChannel = event.guild.channels.cache.find(channel => channel.name === logsChannelName);
	var ping = '';
	var roleName = 'Prisonniers';

	console.log(`A new scheduled event has been created by <${event.creatorId}>:`);
	console.log(`- Title: ${event.name}`);
	console.log(`- Description: ${event.description}`);
	console.log(`- Date: ${event.scheduledStartAt}`);

	if (logsChannel != undefined)
		await logsChannel.send(
			`A new scheduled event has been created by <${event.creatorId}>:`
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
	// TODO: Take care of that automatically, like `ch:tests` for instance
	if (event.description.includes('`tests`'))
		channel = event.guild.channels.cache.find(channel => channel.name === 'tests');
	if (event.description.includes('`testsshowroom`'))
		channel = event.guild.channels.cache.find(channel => channel.name === 'testsshowroom');
	// I wouls like to add a way for the bot to display the mission ID in the message
	if (event.guild.roles.cache.find(role => role.name === roleName) != undefined) ping = `Hey <@&${event.guild.roles.cache.find(role => role.name === roleName).id}> !\n`;
	channel.send(
		ping 
		+ 'Une nouvelle expédition est prévue, alors soyez prêts à travailler ensemble, ou à mourir ensemble !\n '
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
		+ '||​||||​||||​|| _ _ _ _ _ _'
		+ event.url
	); // That mess allows us to show the link embed without the link, and yes, this is a glitch
	console.log(`Sent it to ${channel.name}`);
	if (logsChannel != undefined)
		await logsChannel.send(`\nSent it to \`${channel.name}\``);
});

client.on(Events.MessageCreate, async message => {
	if (message.author == client.user) return;
	var logsChannel = message.guild.channels.cache.find(channel => channel.name === logsChannelName);
	var locale = '';
	for (var loc in supportedLocales) {
		if (message.guild.preferredLocale == loc) locale = message.guild.preferredLocale;
	}
	if (locale == '') locale = 'en-US';

	msgContent = message.content;
	msgContentLowerCase = msgContent.toLowerCase();

	if (msgContent.includes('@everyone')) {
		var emojiName = 'DaudaPing'
		const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === emojiName);
		if (reactionEmoji != undefined) {
			await message.react(reactionEmoji);
			console.log(`Reacted “${emojiName}” to “${msgContent}” by ${message.author.tag}`);
			if (logsChannel != undefined)
				await logsChannel.send(`Reacted \`${emojiName}\` to \`${msgContent}\` by \`${message.author.tag}\``);
		} else {
			console.log(`Tried to react to “${msgContent}” by ${message.author.tag} but no '${emojiName}' emoji was found`);
			if (logsChannel != undefined)
				(`Tried to react to \`${msgContent}\` by ${message.author.tag} but no \`${emojiName}\` emoji was found`);
		}
	}

	// ====================== NEEDS TO BE LOCALIZED !!! ============================
	if (msgContentLowerCase.includes('demande') && msgContentLowerCase.includes('dauda')) {
		await message.react('❓');
		console.log(`Reacted “❓” to “${msgContent}” by ${message.author.tag}`);
		if (logsChannel != undefined)
			await logsChannel.send(`Reacted \`❓\` to \`${msgContent}\` by \`${message.author.tag}\``);
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
			if (completion[run] != undefined) {
				if (completion[run][lt] != undefined) {
					if (completion[run][lt][id] != undefined) {
						if (completion[run][lt][id].completed != undefined) {
							if (completion[run][lt][id].completed[mt] == true) reaction = '✅';
							if (completion[run][lt][id].completed[mt] == false) reaction = '❌';
						} else reaction = '❔';
					} else reaction = '❔';
				}
			}
		}
		if (reaction != '') {
			await message.react(reaction);
			console.log(`Reacted “${reaction}” to “${msgContent}” by ${message.author.tag}`);
			if (logsChannel != undefined)
				(`Reacted \`${reaction}\` to \`${msgContent}\` by \`${message.author.tag}\``);
		}
		if (reaction == '❔') {
			await message.reply({ content: locFile[locale][locale].system.missionNotFound.replace('#', MID), ephemeral: true });
			console.log(`Answered “${locFile[locale][locale].system.missionNotFound.replace('#', MID)}” to “${msgContent}” by ${message.author.tag}`);
			if (logsChannel != undefined)
				(`Answered “${locFile[locale][locale].system.missionNotFound.replace('#', MID)}” to \`${msgContent}\` by \`${message.author.tag}\``);
		}
	}

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
			await logsChannel.send(`Answered “${answer}” to \`${msgContent}\` by \`${message.author.tag}\``);
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