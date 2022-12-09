const { SlashCommandBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');
const { rundowns } = require('../rundowns/rundowns.json');
const editJsonFile = require("edit-json-file");
let file = editJsonFile('./rundowns/rundowns.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('complete')
		.setDescription('Mark a mission complete')
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
						if(value == 'R' + nb + id){
							for(var mt in rundowns['R'+nb][lt][id].missionTypes){
                                if(mt == "main"){
                                    file.set("rundowns." + 'R' + nb + "." + lt + "." + id + ".completed." + mt, true);
                                    file.save();
                                    file = editJsonFile('./rundowns/rundowns.json', {
                                        autosave: true
                                    });
                                    response = 'Mission *' + value + ':' + mt + '* `✅` completed'
                                }
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