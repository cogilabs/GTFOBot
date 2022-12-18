const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { supportedLocales } = require('../localization/supportedLocales.json');

var locFile = new Array();
for (var lang in supportedLocales) {
    locFile[lang] = require('../localization/' + lang + '.json');
}

const editJsonFile = require('edit-json-file');
let file = editJsonFile('./rundowns/completion.json');
const cmdName = 'rundowns';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription(locFile['en-US']['en-US'].commands[cmdName].description)
        .setDescriptionLocalizations({
            fr: locFile['fr']['fr'].commands[cmdName].description,
        }),
	async execute(interaction) {
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
        console.log(`@${interaction.user.tag} <@${interaction.user.id}> used /${cmdName} in ${locale}`)
        await interaction.reply({ components: rows, ephemeral: true });
    },
	async replyButton(interaction) {
        var locale = '';
        for (var loc in supportedLocales) {
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if (locale == '') locale = 'en-US';
        const commandArray = (interaction.customId).split('-');
        if (commandArray[1] == 'select') {
            const RID = commandArray[2];
            var title = '';
            var rows = new Array();
            title = '***' + locFile[locale][locale].missions.rundownTitle + ' ' + RID + '***';

            i = 0;
            for (var lt in rundowns[RID]) {
                rows[i] = new ActionRowBuilder();
                for (var nb in rundowns[RID][lt]) {
                    if (completion[RID][lt][nb].completed.main) {
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

            console.log(`@${interaction.user.tag} <@${interaction.user.id}> opened rundown ${RID} via /${commandArray[0]} in ${locale}`)
            await interaction.reply({ content: title, components: rows });

        } else if (commandArray[1] == 'mission') {
            const commandArray = (interaction.customId).split('-');
            const RID = commandArray[2];
            var title = '';
            var cpltd = new Array();
            const rows  = new Array();
            var content = '';
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
                                    cpltd[mt] = completion[run][lt][id].completed[mt]
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
                                    if (completion[run][lt][id].completed[mt] == true) {
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

            const embed = new EmbedBuilder()
            .setColor(0x110022)
            .setTitle(title)
            .setDescription(content);

            console.log(`@${interaction.user.tag} <@${interaction.user.id}> opened mission ${RID} via /${commandArray[0]} in ${locale}`)
            await interaction.reply({ embeds: [embed], components: rows });

        } else if (commandArray[1] == 'complete') {
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
                                        file.set(`completion.${run}.${lt}.${id}.completed.${mt}`, (String(comp).toLowerCase() == 'true'));
                                        file.save();
                                        file = editJsonFile('./rundowns/completion.json', {
                                            autosave: true
                                        });
                                        completion[run][lt][id].completed[mt] = (String(comp).toLowerCase() == 'true');
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
            } else {
                response = ({ content: locFile[locale][locale].system.noButtonPermission, ephemeral: true });
            }

            console.log(`@${interaction.user.tag} <@${interaction.user.id}> used “${commandArray[1]} ${value} ${comp}” via /${commandArray[0]} in ${locale}`)
			return interaction.reply(response);
        }
	}
};