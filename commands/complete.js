const { SlashCommandBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');
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
		const type = interaction.options.getString('type');
        var response = 'Mission *' + value + '* not found';

		if (value) {
			for(var nb in Rlist){
				for(var lt in rundowns['R'+nb]){
					for(var id in rundowns['R'+nb][lt]){
						if(value == 'R' + nb + id){
							for(var mt in rundowns['R'+nb][lt][id].missionTypes){
								if (!type) type = 'main';
								if(mt == type){
									file.set('rundowns.' + 'R' + nb + '.' + lt + '.' + id + '.completed.' + mt, true);
									file.save();
									file = editJsonFile('./rundowns/rundowns.json', {
										autosave: true
									});
									rundowns['R'+nb][lt][id].completed[mt] = true;
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