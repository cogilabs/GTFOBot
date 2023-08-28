// rundowns.js - GTFO Discord Companion app rundowns command
// Copyright (C) 2023 David "0Davgi0" Girou
// License: BSD2.

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');
const { guildId } = require('../config.json'); // ! Debug, Remove for prod
const { logToServer } = require('../modules/smallModules.js')

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('../localization/' + lang + '.json');
}

const cmdName = 'rundowns';

var initialInteraction = new Array;
var lastMissionInteraction = new Array;
var rundownsInteraction = new Array;


module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(locFile['en-US']['en-US'].commands[cmdName].description)
        .setDescriptionLocalizations({
            fr: locFile['fr']['fr'].commands?.[cmdName]?.description ?? locFile['en-US']['en-US'].commands[cmdName].description,
        }),
	async execute(interaction) { // * Execution of the /rundowns command
        var mainGuild = client.guilds.cache.find(mainGuild => mainGuild.id == guildId); // ! Debug, Remove for prod
	    var mainGuildLogsChannel = mainGuild.channels.cache.find(channel => channel.name === logsChannelName); // ! Debug, Remove for prod
		var configLogsChannel = configFile[interaction.guild.id].get(`configuration.logsChannel`);
			if (configLogsChannel != undefined) {
				var logsChannel = interaction.guild.channels.cache.find(channel => channel.id === configLogsChannel);
			} else {
				var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
			}
        initialInteraction[`${interaction.guild.id}-${interaction.channelId}`] = interaction;
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
        while (parseInt(higher)%4) {
            higher = parseInt(higher) + 1;
        }
        rows[j] = new ActionRowBuilder();
        for (var i = 1; i <= higher; i++) {
            RID = 'R' + i;
            if (i > u+4) {
                j++;
                u = i-1;
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
        logToServer(logsChannel, `${interaction.user.tag} <${interaction.user.id}> used **\`\` /${cmdName} \`\`** in ${locale}`);
        if (mainGuildLogsChannel != undefined) // ! Debug, Remove for prod
		    await mainGuildLogsChannel.send(`${interaction.user.tag} <${interaction.user.id}> from **${interaction.guild.name}** <${interaction.guild.id}> used **\`\` /${cmdName} \`\`** in ${locale}`); // ! Debug, Remove for prod
        
        if (lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] != undefined) {
            try {
                await lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`].deleteReply();
            } catch(error) {
                console.error(error);
            }
            lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] = undefined;
        }
        if (rundownsInteraction[`${interaction.guild.id}-${interaction.channelId}`] != undefined) {
            try {
                await rundownsInteraction[`${interaction.guild.id}-${interaction.channelId}`].deleteReply();
            } catch(error) {
                console.error(error);
            }
            rundownsInteraction[`${interaction.guild.id}-${interaction.channelId}`] = undefined;
        }

        await interaction.reply({ 
            content: (locFile[locale][locale].missions?.chooseRundown ?? locFile["en-US"]["en-US"].missions.chooseRundown), 
            components: rows, 
            ephemeral: true 
        });
    },
	async replyButton(interaction) { // * Click on a button
		var configLogsChannel = configFile[interaction.guild.id].get(`configuration.logsChannel`);
			if (configLogsChannel != undefined) {
				var logsChannel = interaction.guild.channels.cache.find(channel => channel.id === configLogsChannel);
			} else {
				var logsChannel = interaction.guild.channels.cache.find(channel => channel.name === logsChannelName);
			}
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
        const commandArray = (interaction.customId).split('-');
        if (commandArray[1] == 'select') { // * Click on a rundown selection button
            rundownsInteraction[`${interaction.guild.id}-${interaction.channelId}`] = interaction;
            const RID = commandArray[2];
            var title = '';
            var rows = new Array();
            title = '## ***' + (locFile[locale][locale].missions?.rundownTitle ?? locFile["en-US"]["en-US"].missions.rundownTitle) + ' ' + RID + '***';

            i = 0;
            for (var lt in rundowns[RID]) {
                rows[i] = new ActionRowBuilder();
                for (var nb in rundowns[RID][lt]) {
                    var playable = true;
                    var style = "Primary";

                    if (nb.charCodeAt(1) != "1".charCodeAt(0)) { // if mnb != 1
                        if (!completion[interaction.guild.id].completion[RID][lt][String.fromCharCode(nb.charCodeAt(0), "1".charCodeAt(0))].completed.main) {
                            playable = false;
                            style = "Secondary";
                        }
                    } else { // if mnb == 1
                        if (nb.charCodeAt(0) != "A".charCodeAt(0)) {
                            if (!completion[interaction.guild.id].completion[RID][String.fromCharCode(nb.charCodeAt(0)-1)][String.fromCharCode(nb.charCodeAt(0)-1, "1".charCodeAt(0))].completed.main) {
                                playable = false;
                                style = "Secondary";
                            }
                        }
                    }
                    if (!configFile[interaction.guild.id].get(`configuration.unlockMechanism`))
                        playable = true; // * Unlocking mechanism

                    if (!configFile[interaction.guild.id].get(`configuration.visuallyPlayable`))
                        style = "Primary"; // * Visually playable

                    if (!configFile[interaction.guild.id].get(`configuration.progressionDisabled`)) {
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
                                    .setStyle(ButtonStyle[style])
                                    .setDisabled(!playable),
                            );
                        }
                    } else {
                        rows[i].addComponents(
                            new ButtonBuilder()
                                .setCustomId(cmdName + '-mission-' + RID + nb)
                                .setLabel(nb)
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(!playable),
                        );

                    }
                }
                i = i+1;
            }
            logToServer(logsChannel, `${interaction.user.tag} <${interaction.user.id}> opened rundown ${RID} via **\`\` /${commandArray[0]} \`\`** in ${locale}`);

            await interaction.reply({ content: title, components: rows });
            if (initialInteraction[`${interaction.guild.id}-${interaction.channelId}`] != undefined) {
                await initialInteraction[`${interaction.guild.id}-${interaction.channelId}`].deleteReply();
                initialInteraction[`${interaction.guild.id}-${interaction.channelId}`] = undefined;
            }

        }
        
        const RID = commandArray[2];
        var title = '';
        var cpltd = new Array();
        const compRows  = new Array();
        var content = '';
        var rights = '';

        if (commandArray[1] == 'complete') { // * Click on a Complete/Uncomplete button
            const [, , value, type, comp] = commandArray;
            
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
                                        response = (locFile[locale][locale].missions?.sector ?? locFile["en-US"]["en-US"].missions.sector) + ' *' + value + ':' + (locFile[locale][locale].sectors?.[mt] ?? locFile["en-US"]["en-US"].sectors[mt])
                                        if (comp == 'true') {
                                            response = response + '* `✅ ' + (locFile[locale][locale].missions?.completed ?? locFile["en-US"]["en-US"].missions.completed) + '`';
                                        } else {
                                            response = response + '* `❌ ' + (locFile[locale][locale].missions?.notCompleted ?? locFile["en-US"]["en-US"].missions.notCompleted) + '`';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const MID = commandArray[2].slice(0,2);
            var runTitle = '';
            var runRows = new Array();
            runTitle = '## ***' + (locFile[locale][locale].missions?.rundownTitle ?? locFile["en-US"]["en-US"].missions.rundownTitle) + ' ' + MID + '***';

            i = 0;
            for (var lt in rundowns[MID]) {
                runRows[i] = new ActionRowBuilder();
                for (var nb in rundowns[MID][lt]) {
                    
                var playable = true;
                var style = "Primary";

                if (nb.charCodeAt(1) != "1".charCodeAt(0)) { // if mnb != 1
                    if (!completion[interaction.guild.id].completion[MID][lt][String.fromCharCode(nb.charCodeAt(0), "1".charCodeAt(0))].completed.main) {
                        playable = false;
                        style = "Secondary";
                    }
                } else { // if mnb == 1
                    if (nb.charCodeAt(0) != "A".charCodeAt(0)) {
                        if (!completion[interaction.guild.id].completion[MID][String.fromCharCode(nb.charCodeAt(0)-1)][String.fromCharCode(nb.charCodeAt(0)-1, "1".charCodeAt(0))].completed.main) {
                            playable = false;
                            style = "Secondary";
                        }
                    }
                }
                if (!configFile[interaction.guild.id].get(`configuration.unlockMechanism`))
                    playable = true; // * Unlocking mechanism

                if (!configFile[interaction.guild.id].get(`configuration.visuallyPlayable`))
                    style = "Primary"; // * Visually playable

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
                                .setStyle(ButtonStyle[style])
                                .setDisabled(!playable),
                        );
                    }
                }
                i = i+1;
            }
            if (rundownsInteraction[`${interaction.guild.id}-${interaction.channelId}`] != undefined)
                try {await rundownsInteraction[`${interaction.guild.id}-${interaction.channelId}`].editReply({ content: runTitle, components: runRows });} catch(error) {
                    console.error(error);
                }
        }
        // * Click on a mission button or a Complete/Uncomplete button
        if (commandArray[1] == 'mission' || commandArray[1] == 'complete') {
            for (var run in rundowns) {
                for (var lt in rundowns[run]) {
                    for (var id in rundowns[run][lt]) {
                        if (RID == run + id) {
                            title = '**' + (locFile[locale][locale].missions?.missionTitle ?? locFile["en-US"]["en-US"].missions.missionTitle).replace('#', run + id) 
                                + '** *“' + (locFile[locale][locale][run]?.[lt]?.[id]?.name ?? locFile["en-US"]["en-US"][run][lt][id].name) + '”*';
                            if (rundowns[run][lt][id].ext == 'true') {
                                title = title + " `://EXT`"
                            }
                            content = '\n \n`' + (locFile[locale][locale].missions?.intel ?? locFile["en-US"]["en-US"].missions.intel) 
                                + '`\n```' + (locFile[locale][locale][run]?.[lt]?.[id]?.intel ?? locFile["en-US"]["en-US"][run][lt][id].intel) + '```'
                                + '\n`' + (locFile[locale][locale].missions?.sectors ?? locFile["en-US"]["en-US"].missions.sectors) + '`\n';
                            var i = 0;
                            for (var mt in rundowns[run][lt][id].missionTypes) {

                                var completeDisabled = false;

                                if (id.charCodeAt(1) != "1".charCodeAt(0)) { // if mnb != 1
                                    if (!completion[interaction.guild.id].completion[run][lt][String.fromCharCode(id.charCodeAt(0), "1".charCodeAt(0))].completed.main) {
                                        completeDisabled = true;
                                    }
                                } else { // if mnb == 1
                                    if (id.charCodeAt(0) != "A".charCodeAt(0)) {
                                        if (!completion[interaction.guild.id].completion[run][String.fromCharCode(id.charCodeAt(0)-1)][String.fromCharCode(id.charCodeAt(0)-1, "1".charCodeAt(0))].completed.main) {
                                            completeDisabled = true;
                                        }
                                    }
                                }

                                if (mt != "main") {
                                    if (!completion[interaction.guild.id].completion[run][lt][id].completed.main) {
                                        completeDisabled = true;
                                    }
                                }

                                var uncompleteDisabled = false;
                                
                                if (mt == "main") {
                                    if (id.charCodeAt(1) == "1".charCodeAt(0)) { // if mnb == 1
                                        for (var udnb in rundowns[run][lt]) {
                                            if (completion[interaction.guild.id].completion[run][lt][udnb].completed.main) {
                                                if (udnb.charCodeAt(1) != "1".charCodeAt(0)) uncompleteDisabled = true;
                                            }
                                        }
                                        if (completion[interaction.guild.id].completion[run][String.fromCharCode(id.charCodeAt(0)+1)][String.fromCharCode(id.charCodeAt(0)+1, "1".charCodeAt(0))].completed.main) {
                                            uncompleteDisabled = true;
                                        }
                                    }
                                    for (var mt2 in rundowns[run][lt][id].missionTypes) {
                                        if (mt2 != "main") {
                                            if (completion[interaction.guild.id].completion[run][lt][id].completed[mt2]) {
                                                uncompleteDisabled = true;
                                            }
                                        }
                                    }
                                }

                                if (rundowns[run][lt][id].missionTypes[mt] == true) {
                                    if(!configFile[interaction.guild.id].get(`configuration.progressionDisabled`)) {
                                        cpltd[mt] = completion[interaction.guild.id].completion[run][lt][id].completed[mt]
                                        compRows[i]  = new ActionRowBuilder();
                                        if (String(cpltd[mt]).toLowerCase() != 'true') {
                                            compRows[i].addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId(cmdName + '-complete-' + RID + '-' + mt + '-true-' + cpltd[mt].toString())
                                                    .setLabel((locFile[locale][locale].missions?.completeSector ?? locFile["en-US"]["en-US"].missions.completeSector).replace('#', locFile[locale][locale].sectors?.[mt] ?? locFile["en-US"]["en-US"].sectors[mt]))
                                                    .setStyle(ButtonStyle.Success)
                                                    .setDisabled(completeDisabled),
                                                );
                                            i++;
                                        } else {
                                            compRows[i].addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId(cmdName + '-complete-' + RID + '-' + mt + '-false-' + cpltd[mt].toString())
                                                    .setLabel((locFile[locale][locale].missions?.uncompleteSector ?? locFile["en-US"]["en-US"].missions.uncompleteSector).replace('#', locFile[locale][locale].sectors?.[mt] ?? locFile["en-US"]["en-US"].sectors[mt]))
                                                    .setStyle(ButtonStyle.Danger)
                                                    .setDisabled(uncompleteDisabled),
                                            );
                                            i++;
                                        }
                                            
                                        content = content + ' - ' + (locFile[locale][locale].sectors?.[mt] ?? locFile["en-US"]["en-US"].sectors[mt]) + ': ';
                                        if (completion[interaction.guild.id].completion[run][lt][id].completed[mt] == true) {
                                            content = content + '`✅ ' + (locFile[locale][locale].missions?.completed ?? locFile["en-US"]["en-US"].missions.completed) + '`\n';
                                        } else {
                                            content = content + '`❌ ' + (locFile[locale][locale].missions?.notCompleted ?? locFile["en-US"]["en-US"].missions.notCompleted) + '`\n';
                                        }
                                    } else {
                                        content = content + ' - ' + (locFile[locale][locale].sectors?.[mt] ?? locFile["en-US"]["en-US"].sectors[mt]) + '\n';
                                    }
                                }
                            }
                            content = content 
                                + '\n`' + (locFile[locale][locale].missions?.comms ?? locFile["en-US"]["en-US"].missions.comms) 
                                + '`\n *' + (locFile[locale][locale][run]?.[lt]?.[id].comms ?? locFile["en-US"]["en-US"][run][lt][id].comms)
                                + '*\n \n`' + (locFile[locale][locale].missions?.metrics ?? locFile["en-US"]["en-US"].missions.metrics) + '`\n'
                                + ' ' + (locFile[locale][locale].missions?.depth ?? locFile["en-US"]["en-US"].missions.depth) 
                                + ' `' + rundowns[run][lt][id].depth +'`m';
                        }
                    }
                }
            }
        }

        if (commandArray[1] == 'mission') { // * Click on a mission button

            const embed = new EmbedBuilder()
            .setColor(0x110022)
            .setTitle(title)
            .setDescription(content);
            
            logToServer(logsChannel, `${interaction.user.tag} <${interaction.user.id}> opened mission ${RID} via **\`\` /${commandArray[0]} \`\`** in ${locale}`);
            
            if (lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] != undefined) {
                try {await lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`].deleteReply();} catch(error) {
                    console.error(error);
                }
                lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] = undefined;
            }

            lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] = interaction;
            await interaction.reply({ embeds: [embed], components: compRows });

        } else if (commandArray[1] == 'complete') { // * Click on a Complete/Uncomplete button
            const [, , value, , comp] = commandArray;

            // Check if the user has the MANAGE_EVENTS permission
            if ((interaction.member.permissions.bitfield & 8589934592n) == 8589934592n) {

                const embed = new EmbedBuilder()
                .setColor(0x110022)
                .setTitle(title)
                .setDescription(content);

                if (lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] != undefined) {
                    try {await lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`].editReply({ embeds: [embed], components: compRows });} catch(error) {
                    console.error(error);
                }
                } else {
                    await interaction.reply({ embeds: [embed], components: compRows });
                }
                

            } else {
                response = ({ content: (locFile[locale][locale].system?.noButtonPermission ?? locFile["en-US"]["en-US"].system.noButtonPermission), ephemeral: true });
                rights = ' but didn\'t have the rights';
            }

            logToServer(logsChannel, `${interaction.user.tag} <${interaction.user.id}> used “${commandArray[1]} ${value} ${comp}” via **\`\` /${commandArray[0]} \`\`** in ${locale}${rights}`);
            
            if (lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] != undefined) {
                await interaction.reply( {content: response, ephemeral: true} );
                return interaction.deleteReply();
            } else {
                lastMissionInteraction[`${interaction.guild.id}-${interaction.channelId}`] = interaction;
            }
        }
	}
};