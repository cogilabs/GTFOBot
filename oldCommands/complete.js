const { SlashCommandBuilder } = require('discord.js');
const editJsonFile = require("edit-json-file");
let file = editJsonFile('./rundowns/rundowns.json');
const cmdName = 'complete';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('Mark a mission complete')
		.addStringOption(option => 
			option
			.setName('mission')
			.setDescription('The mission identifier (Ex: R1A1)')
			.setRequired(true))
		.addStringOption(option => 
			option
			.setName('type')
			.setDescription('The mission type')
			.setRequired(false)
			.addChoices(
				{ name: 'main', value: 'main' },
				{ name: 'secondary', value: 'secondary' },
				{ name: 'overload', value: 'overload' },
				{ name: 'efficiency', value: 'efficiency' },
			))
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
		const value = interaction.options.getString('mission');
		var type = interaction.options.getString('type');
        var response = 'Mission *' + value + '* not found';

		if (value) {
			for(var run in rundowns){
				for(var lt in rundowns[run]){
					for(var id in rundowns[run][lt]){
						if(value == run + id){
							for(var mt in rundowns[run][lt][id].missionTypes){
								if (!type) type = 'main';
								if(mt == type){
									file.set('rundowns.' + run + '.' + lt + '.' + id + '.completed.' + mt, true);
									file.save();
									file = editJsonFile('./rundowns/rundowns.json', {
										autosave: true
									});
									rundowns[run][lt][id].completed[mt] = true;
									response = 'Mission *' + value + ':' + mt + '* `✅ Completed`';
								}
							}
						}
					}
				}
			}

			console.log(`${interaction.user.username} used /${cmdName} ${value}`)
			return interaction.reply(response);
		
		} else {		
			console.log(`${interaction.user.username} used /${cmdName} with no option`)
			return interaction.reply('No option was provided!');
		}
	},
};