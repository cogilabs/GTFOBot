const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { supportedLocales } = require('../supportedLocales.json');
const editJsonFile = require("edit-json-file");
let file = editJsonFile('./rundowns/completion.json');
const cmdName = 'rundowns';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('State of the expeditions, mission descriptions and completion'),
	async execute(interaction) {
        var locale = '';
        for(var loc in supportedLocales){
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if(locale == '') locale = 'en-US';

        var higher = 0;
        var RID = '';
        var rows = new Array();

        var enabled = new Array();
        for(var run in rundowns){
            nb = (run.split("R"))[1]
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
        var locale = '';
        for(var loc in supportedLocales){
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if(locale == '') locale = 'en-US';
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
                    if(completion[RID][lt][nb].completed.main){
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
            var cpltd = new Array();
            const rows  = new Array();
            var content = 'Try to check if the mission identifier is correct and in the right format (Ex: R1A1). You can use **/rundown** to verify if the mission exists';
            for(var run in rundowns){
                for(var lt in rundowns[run]){
                    for(var id in rundowns[run][lt]){
                        if(RID == run + id){
                            title = '**Mission ' + run + id + '**: *"' + rundowns[run][lt][id].name[locale] + '"*';
                            content = '\n \n`:://Intel_`\n```' + rundowns[run][lt][id].intel[locale] + '```'
                                + '\n`:://Sectors_&&_progression_permits_`\n';
                            var i = 0;
                            for(var mt in rundowns[run][lt][id].missionTypes){
                                if(rundowns[run][lt][id].missionTypes[mt] == true){
                                    cpltd[mt] = completion[run][lt][id].completed[mt]
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
                                    if(completion[run][lt][id].completed[mt] == true){
                                        content = content + '`✅ Completed`\n';
                                    } else {
                                        content = content + '`❌ Not completed`\n';
                                    }
                                }
                                i++;
                            }
                            content = content 
                                + '\n`:://Interupted_Communications_`\n *' + rundowns[run][lt][id].description[locale]
                                + '*\n \n`:://Expedition_metrics_`\n'
                                + ' Drop cage target depth: `' + rundowns[run][lt][id].depth +'`m';
                        }
                    }
                }
            }
            const embed = new EmbedBuilder()
            .setColor(0x110022)
            .setTitle(title)
            .setDescription(content);

            console.log(`${interaction.user.username} used the button ${RID} of the /${commandArray[0]} command`)
            await interaction.reply({ embeds: [embed], components: rows });

        } else if (commandArray[1] == 'complete') {
            const value = commandArray[2];
            const type = commandArray[3];
            const comp = commandArray[4];
            for(var run in rundowns){
				for(var lt in rundowns[run]){
					for(var id in rundowns[run][lt]){
						if(value == run + id){
							for(var mt in rundowns[run][lt][id].missionTypes){
								if(mt == type){
									file.set('completion.' + run + '.' + lt + '.' + id + '.completed.' + mt, (String(comp).toLowerCase() == "true"));
									file.save();
									file = editJsonFile('./rundowns/completion.json', {
										autosave: true
									});
									completion[run][lt][id].completed[mt] = (String(comp).toLowerCase() == "true");
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