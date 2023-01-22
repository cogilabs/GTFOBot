const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

const commands = [];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log(`Started removing global application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully removed global application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();