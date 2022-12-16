const { SlashCommandBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');
const editJsonFile = require("edit-json-file");
let file = editJsonFile('./rundowns/rundowns.json');
const cmdName = 'uncomplete';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('Mark a mission uncomplete')
		.addStringOption(option => 
			option
			.setName('mission')
			.setDescription('The mission identifier (Ex: R1A1)')
			.setRequired(true))
		.setDefaultMemberPermissions(0)
		.setDMPermission(false),
	async execute(interaction) {
		const value = interaction.options.getString('mission');
        var response = 'Mission *' + value + '* not found';

		if (value) {
			for(var nb in Rlist){
				for(var lt in rundowns['R'+nb]){
					for(var id in rundowns['R'+nb][lt]){
						if(value == 'R' + nb + id){
							for(var mt in rundowns['R'+nb][lt][id].missionTypes){
								if(mt == "main"){
									file.set('rundowns.' + 'R' + nb + '.' + lt + '.' + id + '.completed.' + mt, false);
									file.save();
									file = editJsonFile('./rundowns/rundowns.json', {
										autosave: true
									});
									rundowns['R'+nb][lt][id].completed[mt] = false;
									response = 'Mission *' + value + ':' + mt + '* `❌ Not completed`';
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