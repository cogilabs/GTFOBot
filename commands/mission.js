const { SlashCommandBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');
const { rundowns } = require('../rundowns/rundowns.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mission')
		.setDescription('Info about a mission')
		.addStringOption(option => 
			option.setName('mission')
			.setDescription('The mission identifier (Ex: R1A1)')
			.setRequired(true)),
	async execute(interaction) {
		const value = interaction.options.getString('mission');
        var response = 'Mission *' + value + '* not found'

		if (value) {
            for(var nb in Rlist){
				for(var lt in rundowns['R'+nb]){
					for(var id in rundowns['R'+nb][lt]){
						if(value == 'R' + nb + lt + id){
							response = '**Mission R' + nb + lt + id + '**: *"' + rundowns['R'+nb][lt][id].name + '"*\nMission types:'

							for(var mt in rundowns['R'+nb][lt][id].missionTypes){


							}
						}
					}
				}
			}

			return interaction.reply(response);
		
        } else {		
			return interaction.reply('No option was provided!');
		}
	},
};