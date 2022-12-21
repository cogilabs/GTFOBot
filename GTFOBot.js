const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { supportedLocales } = require('./localization/supportedLocales.json');

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('./localization/' + lang + '.json');
}

const { rundowns } = require('./rundowns/rundowns.json');
global.rundowns = rundowns;

const editJsonFile = require('edit-json-file');
let file = editJsonFile('./rundowns/completion.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });
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

client.on(Events.MessageCreate, async message => {
	if (message.author == client.user) return;

	if (message.content.includes('@everyone')) {
		var emojiName = 'DaudaPing'
		const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === emojiName);
		if (reactionEmoji != undefined) {
			message.react(reactionEmoji);
			console.log(`Reacted to “${message.content}” by ${message.author.tag}`)
		} else console.log(`Tried tu react to “${message.content}” by ${message.author.tag} but no '${emojiName}' emoji was found`);
	}

});

//Chat commands interactions
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

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