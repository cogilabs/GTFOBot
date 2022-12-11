const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');

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
        var check = '❔ ';
        var title = '';
        var content = '';
		if (value) { 
            for(var nb in Rlist){
                if(value == nb) {
                    RID = 'R' + nb;
                }
            }
            if(RID == ''){
                return interaction.reply('Rundown *"R' + value + '"* does not exist');
            }
            title = '***Rundown ' + RID + '***';
            for(var lt in rundowns[RID]){
                content = content + '\n';
                for(var nb in rundowns[RID][lt]){
                    if(rundowns[RID][lt][nb].completed.main){
                        check = '✅ ';
                    } else {
                        check = '❌ ';
                    }
                    content = content + '**` ' + check + nb +' `** ';
                }
            }
            const embed = new EmbedBuilder()
            .setColor(0x110022)
            .setTitle(title)
            .setDescription(content);

            console.log(`${interaction.user.username} used /rundown ${value}`)
            return interaction.reply({embeds: [embed]});
        } else {
            console.log(`${interaction.user.username} used /rundown with no option`)
		    return interaction.reply('No option was provided!');
        }
	},
};