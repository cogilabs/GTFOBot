const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');
const editJsonFile = require("edit-json-file");
let file = editJsonFile('./rundowns/rundowns.json');
const cmdName = 'rdown';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('[WIP]State of the expeditions (No argument version)'),
	async execute(interaction) {
        var higher = 0;
        var RID = '';
        var rows = new Array();
        var enabled = new Array();
        for(var nb in Rlist){
            if (nb > higher) higher = nb;
            enabled[nb] = true;
        }
        var j = 0;
        var u = 0;
        rows[j] = new ActionRowBuilder();
        for(var i = 1; i <= higher; i++) {
            RID = 'R' + i;
            if (i > u+4) {
                j++;
                u = i;
                rows[j] = new ActionRowBuilder();
            }
            rows[j].addComponents(
                new ButtonBuilder()
                    .setCustomId(cmdName + '-select-' + RID)
                    .setLabel(RID)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!enabled[i]),
            );

        }

        console.log(`${interaction.user.username} used /${cmdName}`)
        await interaction.reply({ components: rows, ephemeral: true });
	},
	async replyButton(interaction) {
        const commandArray = (interaction.customId).split("-");
        if (commandArray[1] == 'select') {
            const RID = commandArray[2];
            var title = '';
            var rows = new Array();
            title = '***Rundown ' + RID + '***';

            i = 0;
            for(var lt in rundowns[RID]){
                rows[i] = new ActionRowBuilder();
                for(var nb in rundowns[RID][lt]){
                    if(rundowns[RID][lt][nb].completed.main){
                        rows[i].addComponents(
                            new ButtonBuilder()
                                .setCustomId(cmdName + '-mission-' + RID + nb)
                                .setLabel(nb)
                                .setStyle(ButtonStyle.Success),
                        );
                    } else {
                        rows[i].addComponents(
                            new ButtonBuilder()
                                .setCustomId(cmdName + '-mission-' + RID + nb)
                                .setLabel(nb)
                                .setStyle(ButtonStyle.Secondary),
                        );
                    }
                }
                i = i+1;
            }

            console.log(`${interaction.user.username} used the button ${RID} of the /${commandArray[0]} command`)
            await interaction.reply({ content: title, components: rows });

        } else if (commandArray[1] == 'mission') {
            const commandArray = (interaction.customId).split("-");
            const RID = commandArray[2];
            var title = 'Mission *' + RID + '* not found';
            //var cpltd = '';
            var cpltd = new Array();
            const rows  = new Array();
            var content = 'Try to check if the mission identifier is correct and in the right format (Ex: R1A1). You can use **/rundown** to verify if the mission exists';
            for(var nb in Rlist){
                for(var lt in rundowns['R'+nb]){
                    for(var id in rundowns['R'+nb][lt]){
                        if(RID == 'R' + nb + id){
                            title = '**Mission R' + nb + id + '**: *"' + rundowns['R'+nb][lt][id].name + '"*';
                            content = '\n \n`:://Intel_`\n```' + rundowns['R'+nb][lt][id].intel + '```'
                                + '\n`:://Sectors_&&_progression_permits_`\n';
                            var i = 0;
                            for(var mt in rundowns['R'+nb][lt][id].missionTypes){
                                if(rundowns['R'+nb][lt][id].missionTypes[mt] == true){
                                    cpltd[mt] = rundowns['R'+nb][lt][id].completed[mt]
                                    rows[i]  = new ActionRowBuilder();
                                    if (!(String(cpltd[mt]).toLowerCase() == "true")) {
                                        rows[i].addComponents(
                                            new ButtonBuilder()
                                                .setCustomId(cmdName + '-complete-' + RID + '-' + mt + '-true-' + cpltd[mt].toString())
                                                .setLabel('Complete ' + mt + ' sector')
                                                .setStyle(ButtonStyle.Success)
                                                .setDisabled((String(cpltd[mt]).toLowerCase() == "true")),
                                            );
                                    } else {
                                        rows[i].addComponents(
                                            new ButtonBuilder()
                                                .setCustomId(cmdName + '-complete-' + RID + '-' + mt + '-false-' + cpltd[mt].toString())
                                                .setLabel('Uncomplete ' + mt + ' sector')
                                                .setStyle(ButtonStyle.Danger)
                                                .setDisabled(!(String(cpltd[mt]).toLowerCase() == "true")),
                                        );
                                    }
                                        
                                    content = content + ' - ' + mt + ': ';
                                    if(rundowns['R'+nb][lt][id].completed[mt] == true){
                                        content = content + '`✅ Completed`\n';
                                    } else {
                                        content = content + '`❌ Not completed`\n';
                                    }
                                }
                                i++;
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

            /*const row  = new ActionRowBuilder();
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(cmdName + '-complete-' + RID + '-true-' + cpltd.toString())
                    .setLabel('Complete')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled((String(cpltdMain).toLowerCase() == "true")),
                new ButtonBuilder()
                    .setCustomId(cmdName + '-complete-' + RID + '-false-' + cpltd.toString())
                    .setLabel('Uncomplete')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!(String(cpltdMain).toLowerCase() == "true")),
            );*/

            console.log(`${interaction.user.username} used the button ${RID} of the /${commandArray[0]} command`)
            await interaction.reply({ embeds: [embed], components: rows });

        } else if (commandArray[1] == 'complete') {
            const value = commandArray[2];
            const type = commandArray[3];
            const comp = commandArray[4];
            for(var nb in Rlist){
				for(var lt in rundowns['R'+nb]){
					for(var id in rundowns['R'+nb][lt]){
						if(value == 'R' + nb + id){
							for(var mt in rundowns['R'+nb][lt][id].missionTypes){
								if(mt == type){
									file.set('rundowns.' + 'R' + nb + '.' + lt + '.' + id + '.completed.' + mt, (String(comp).toLowerCase() == "true"));
									file.save();
									file = editJsonFile('./rundowns/rundowns.json', {
										autosave: true
									});
									rundowns['R'+nb][lt][id].completed[mt] = (String(comp).toLowerCase() == "true");
                                    if (comp == 'true') {
									    response = 'Mission *' + value + ':' + mt + '* `✅ Completed`';
                                    } else {
									    response = 'Mission *' + value + ':' + mt + '* `❌ Not completed`';
                                    }
								}
							}
						}
					}
				}
			}

            console.log(`${interaction.user.username} used the button “${commandArray[1]} ${value} ${comp}” of the /${commandArray[0]} command`)
			return interaction.reply(response);
        }


	}
};