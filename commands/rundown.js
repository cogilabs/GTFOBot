const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rundown')
		.setDescription('State of the expeditions')
		.addStringOption(option => 
            option
            .setName('number')
            .setDescription('The rundown number')
			.setRequired(true)),
	async execute(interaction) {
		const value = interaction.options.getString('number');
        var RID = '';
        var title = '';
        var rows = new Array();
        const row = new ActionRowBuilder();
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

                i = 0;
                for(var lt in rundowns[RID]){
                    rows[i] = new ActionRowBuilder();
                    for(var nb in rundowns[RID][lt]){
                        if(rundowns[RID][lt][nb].completed.main){
                            rows[i].addComponents(
                                new ButtonBuilder()
                                    .setCustomId('rundown-' + RID + nb)
                                    .setLabel(nb)
                                    .setStyle(ButtonStyle.Success),
                            );
                        } else {
                            rows[i].addComponents(
                                new ButtonBuilder()
                                    .setCustomId('rundown-' + RID + nb)
                                    .setLabel(nb)
                                    .setStyle(ButtonStyle.Secondary),
                            );
                        }
                    }
                    i = i+1;
                }

            console.log(`${interaction.user.username} used /rundown ${value}`)
            await interaction.reply({ content: title, components: rows });

        } else {
            console.log(`${interaction.user.username} used /rundown with no option`)
		    return interaction.reply('No option was provided!');
        }
	},
	async replyButton(interaction) {
	    const commandArray = (interaction.customId).split("-");
        const value = commandArray[1];
        var title = 'Mission *' + value + '* not found';
		var content = 'Try to check if the mission identifier is correct and in the right format (Ex: R1A1). You can use **/rundown** to verify if the mission exists';
		for(var nb in Rlist){
			for(var lt in rundowns['R'+nb]){
				for(var id in rundowns['R'+nb][lt]){
					if(value == 'R' + nb + id){
						title = '**Mission R' + nb + id + '**: *"' + rundowns['R'+nb][lt][id].name + '"*';
						content = '\n \n`:://Intel_`\n```' + rundowns['R'+nb][lt][id].intel + '```'
							+ '\n`:://Sectors_&&_progression_permits_`\n';

						for(var mt in rundowns['R'+nb][lt][id].missionTypes){
							if(rundowns['R'+nb][lt][id].missionTypes[mt] == true){
								content = content + ' - ' + mt + ': ';
								if(rundowns['R'+nb][lt][id].completed[mt] == true){
									content = content + '`✅ Completed`\n';
								} else {
									content = content + '`❌ Not completed`\n';
								}
							}
						}
						content = content 
							+ '\n`:://Interupted_Communications_`\n *' + rundowns['R'+nb][lt][id].description
							+ '*\n \n`:://Expedition_metrics_`\n'
							+ ' Drop cage target depth: `' + rundowns['R'+nb][lt][id].depth +'`m';
					}
				}
			}
		}
		const embed = new EmbedBuilder()
		.setColor(0x110022)
		.setTitle(title)
		.setDescription(content);

		console.log(`${interaction.user.username} used the button ${value} of the /${commandArray[0]} command`)
		return interaction.reply({embeds: [embed]});


	}
};