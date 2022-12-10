const { SlashCommandBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');
const { rundowns } = require('../rundowns/rundowns.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rundown')
		.setDescription('State of the expeditions')
		.addStringOption(option => 
            option.setName('number')
            .setDescription('The rundown number')
			.setRequired(true)),
	async execute(interaction) {
		const value = interaction.options.getString('number');
        var RID = '';
        var response = ''
        var check = '❔ '
		if (value) { 
            for(var nb in Rlist){
                if(value == nb) {
                    RID = 'R' + nb;
                }
            }
            if(RID == ''){
                return interaction.reply('Rundown *"R' + value + '"* does not exist');
            }

            response = '**======** ***Rundown ' + RID + '*** **======**';
            for(var lt in rundowns[RID]){
                response = response + '\n';
                for(var nb in rundowns[RID][lt]){
                    if(rundowns[RID][lt][nb].completed.main){
                        check = '✅ ';
                    } else {
                        check = '❌ ';
                    }
                    response = response + '**` ' + check + nb +' `** '
                }
            }

            return interaction.reply(response)
            return interaction.reply(RID + 'A1 = ' + rundowns[RID].A[1].name);
        } else {
		    return interaction.reply('No option was provided!');
        }
	},
};