// rundowns.js - GTFO Discord Companion app rundowns command
// Copyright (C) 2022 David "0Davgi0" Girou
// License: BSD2.

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('../localization/' + lang + '.json');
}

const cmdName = 'rundowns';

var initialInteraction;
var lastMissionInteraction;
var rundownsInteraction;

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(locFile['en-US']['en-US'].commands[cmdName].description)
        .setDescriptionLocalizations({
            fr: locFile['fr']['fr'].commands[cmdName].description,
        }),
	async execute(interaction) {
        var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
        initialInteraction = interaction;
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';

        var higher = 0;
        var RID = '';
        var rows = new Array();

        var enabled = new Array();
        for (var run in rundowns) {
            nb = (run.split('R'))[1]
            if (nb > higher) higher = nb;
            enabled[nb] = true;
        }
        var j = 0;
        var u = 0;
        rows[j] = new ActionRowBuilder();
        for (var i = 1; i <= higher; i++) {
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
        console.log(`@${interaction.user.tag} <@${interaction.user.id}> used /${cmdName} in ${locale}`);
		if (logsChannel != undefined)
			await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used **\`\` /${cmdName} \`\`** in ${locale}`);

        if (lastMissionInteraction != undefined && lastMissionInteraction.channelId == interaction.channelId) {
            await lastMissionInteraction.deleteReply();
            lastMissionInteraction = undefined;
        }
        if (rundownsInteraction != undefined && rundownsInteraction.channelId == interaction.channelId) {
            await rundownsInteraction.deleteReply();
            rundownsInteraction = undefined;
        }

        await interaction.reply({ components: rows, ephemeral: true });
    },
	async replyButton(interaction) {
        var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
        const commandArray = (interaction.customId).split('-');
        if (commandArray[1] == 'select') {
            rundownsInteraction = interaction;
            const RID = commandArray[2];
            var title = '';
            var rows = new Array();
            title = '***' + locFile[locale][locale].missions.rundownTitle + ' ' + RID + '***';

            i = 0;
            for (var lt in rundowns[RID]) {
                rows[i] = new ActionRowBuilder();
                for (var nb in rundowns[RID][lt]) {
                    if (completion[interaction.guild.id].completion[RID][lt][nb].completed.main) {
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

            console.log(`@${interaction.user.tag} <@${interaction.user.id}> opened rundown ${RID} via /${commandArray[0]} in ${locale}`);
            if (logsChannel != undefined)
			    await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> opened rundown ${RID} via **\`\` /${commandArray[0]} \`\`** in ${locale}`);
            await interaction.reply({ content: title, components: rows });
            if (initialInteraction != undefined && initialInteraction.channelId == interaction.channelId) {
                await initialInteraction.deleteReply();
                initialInteraction = undefined;
            }

        } else if (commandArray[1] == 'mission' || commandArray[1] == 'complete') {

            if (commandArray[1] == 'complete') {
                const value = commandArray[2];
                const type = commandArray[3];
                const comp = commandArray[4];
                
                // Check if the user has the MANAGE_EVENTS permission
                if ((interaction.member.permissions.bitfield & 8589934592n) == 8589934592n) {
                    for (var run in rundowns) {
                        for (var lt in rundowns[run]) {
                            for (var id in rundowns[run][lt]) {
                                if (value == run + id) {
                                    for (var mt in rundowns[run][lt][id].missionTypes) {
                                        if (mt == type) {
                                            configFile[interaction.guild.id].set(`completion.${run}.${lt}.${id}.completed.${mt}`, (String(comp).toLowerCase() == 'true'));
                                            configFile[interaction.guild.id].save();
                                            configFile[interaction.guild.id] = editJsonFile('./rundowns/server-' + interaction.guild.id + '.json', {
                                                autosave: true
                                            });
                                            completion[interaction.guild.id].completion[run][lt][id].completed[mt] = (String(comp).toLowerCase() == 'true');
                                            if (comp == 'true') {
                                                response = locFile[locale][locale].missions.sector + ' *' + value + ':' + locFile[locale][locale].sectors[mt] + '* `✅ ' + locFile[locale][locale].missions.completed + '`';
                                            } else {
                                                response = locFile[locale][locale].missions.sector + ' *' + value + ':' + locFile[locale][locale].sectors[mt] + '* `❌ ' + locFile[locale][locale].missions.notCompleted + '`';
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const MID = commandArray[2].slice(0,2);
                var title = '';
                var runRows = new Array();
                title = '***' + locFile[locale][locale].missions.rundownTitle + ' ' + MID + '***';
        
                i = 0;
                for (var lt in rundowns[MID]) {
                    runRows[i] = new ActionRowBuilder();
                    for (var nb in rundowns[MID][lt]) {
                        if (completion[interaction.guild.id].completion[MID][lt][nb].completed.main) {
                            runRows[i].addComponents(
                                new ButtonBuilder()
                                    .setCustomId(cmdName + '-mission-' + MID + nb)
                                    .setLabel(nb)
                                    .setStyle(ButtonStyle.Success),
                            );
                        } else {
                            runRows[i].addComponents(
                                new ButtonBuilder()
                                    .setCustomId(cmdName + '-mission-' + MID + nb)
                                    .setLabel(nb)
                                    .setStyle(ButtonStyle.Secondary),
                            );
                        }
                    }
                    i = i+1;
                }
                if (rundownsInteraction != undefined && rundownsInteraction.channelId == interaction.channelId)
                    await rundownsInteraction.editReply({ content: title, components: runRows });
            }

            const RID = commandArray[2];
            var title = '';
            var cpltd = new Array();
            const rows  = new Array();
            var content = '';
            var rights = '';
            for (var run in rundowns) {
                for (var lt in rundowns[run]) {
                    for (var id in rundowns[run][lt]) {
                        if (RID == run + id) {
                            title = '**' + (locFile[locale][locale].missions.missionTitle).replace('#', run + id) + '** *“' + locFile[locale][locale][run][lt][id].name + '”*';
                            content = '\n \n`' + locFile[locale][locale].missions.intel + '`\n```' + locFile[locale][locale][run][lt][id].intel + '```'
                                + '\n`' + locFile[locale][locale].missions.sectors + '`\n';
                            var i = 0;
                            for (var mt in rundowns[run][lt][id].missionTypes) {
                                if (rundowns[run][lt][id].missionTypes[mt] == true) {
                                    cpltd[mt] = completion[interaction.guild.id].completion[run][lt][id].completed[mt]
                                    rows[i]  = new ActionRowBuilder();
                                    if (String(cpltd[mt]).toLowerCase() != 'true') {
                                        rows[i].addComponents(
                                            new ButtonBuilder()
                                                .setCustomId(cmdName + '-complete-' + RID + '-' + mt + '-true-' + cpltd[mt].toString())
                                                .setLabel((locFile[locale][locale].missions.completeSector).replace('#', locFile[locale][locale].sectors[mt]))
                                                .setStyle(ButtonStyle.Success),
                                            );
                                        i++;
                                    } else {
                                        rows[i].addComponents(
                                            new ButtonBuilder()
                                                .setCustomId(cmdName + '-complete-' + RID + '-' + mt + '-false-' + cpltd[mt].toString())
                                                .setLabel((locFile[locale][locale].missions.uncompleteSector).replace('#', locFile[locale][locale].sectors[mt]))
                                                .setStyle(ButtonStyle.Danger),
                                        );
                                        i++;
                                    }
                                        
                                    content = content + ' - ' + locFile[locale][locale].sectors[mt] + ': ';
                                    if (completion[interaction.guild.id].completion[run][lt][id].completed[mt] == true) {
                                        content = content + '`✅ ' + locFile[locale][locale].missions.completed + '`\n';
                                    } else {
                                        content = content + '`❌ ' + locFile[locale][locale].missions.notCompleted + '`\n';
                                    }
                                }
                            }
                            content = content 
                                + '\n`' + locFile[locale][locale].missions.comms + '`\n *' + locFile[locale][locale][run][lt][id].comms
                                + '*\n \n`' + locFile[locale][locale].missions.metrics + '`\n'
                                + ' ' + locFile[locale][locale].missions.depth + ' `' + rundowns[run][lt][id].depth +'`m';
                        }
                    }
                }
            }

            if (commandArray[1] == 'mission') {

                const embed = new EmbedBuilder()
                .setColor(0x110022)
                .setTitle(title)
                .setDescription(content);
                
                console.log(`@${interaction.user.tag} <@${interaction.user.id}> opened mission ${RID} via /${commandArray[0]} in ${locale}`);
                if (logsChannel != undefined)
			        await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> opened mission ${RID} via **\`\` /${commandArray[0]} \`\`** in ${locale}`);

                if (lastMissionInteraction != undefined && lastMissionInteraction.channelId == interaction.channelId) {
                    await lastMissionInteraction.deleteReply();
                    lastMissionInteraction = undefined;
                }

                lastMissionInteraction = interaction;
                await interaction.reply({ embeds: [embed], components: rows });

            } else if (commandArray[1] == 'complete') {
                const value = commandArray[2];
                const comp = commandArray[4];

                // Check if the user has the MANAGE_EVENTS permission
                if ((interaction.member.permissions.bitfield & 8589934592n) == 8589934592n) {

                    const embed = new EmbedBuilder()
                    .setColor(0x110022)
                    .setTitle(title)
                    .setDescription(content);

                    if (lastMissionInteraction != undefined && lastMissionInteraction.channelId == interaction.channelId) {
                        await lastMissionInteraction.editReply({ embeds: [embed], components: rows });
                    } else {
                        await interaction.reply({ embeds: [embed], components: rows });
                    }
                    

                } else {
                    response = ({ content: locFile[locale][locale].system.noButtonPermission, ephemeral: true });
                    rights = ' but didn\'t have the rights';
                }

                console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “${commandArray[1]} ${value} ${comp}” via /${commandArray[0]} in ${locale}${rights}`);
                if (logsChannel != undefined)
			        await logsChannel.send(`${interaction.user.tag} <${interaction.user.id}> used “${commandArray[1]} ${value} ${comp}” via **\`\` /${commandArray[0]} \`\`** in ${locale}${rights}`);
                
                if (lastMissionInteraction != undefined && lastMissionInteraction.channelId == interaction.channelId) {
                    await interaction.reply( {content: response, ephemeral: true} );
                    return interaction.deleteReply();
                } else {
                    lastMissionInteraction = interaction;
                }
            }
        }
	}
};