const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { supportedLocales } = require('../supportedLocales.json');
const cmdName = 'mission';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('Info about a mission')
		.addStringOption(option => 
			option
			.setName('mission')
			.setDescription('The mission identifier (Ex: R1A1)')
			.setRequired(true)),
	async execute(interaction) {
		var locale = '';
        for(var loc in supportedLocales){
            if (interaction.locale == loc) locale = interaction.locale;
        }
        if(locale == '') locale = 'en-US';
		const value = interaction.options.getString('mission');
		var title = 'Mission *' + value + '* not found';
		var content = 'Try to check if the mission identifier is correct and in the right format (Ex: R1A1). You can use **/rundown** to verify if the mission exists';

		(async () => {
			if (value) {
				for(var run in rundowns){
					for(var lt in rundowns[run]){
						for(var id in rundowns[run][lt]){
							if(value == run + id){
								title = '**Mission ' + run + id + '**: *"' + rundowns[run][lt][id].name[locale] + '"*';
								content = '\n \n`:://Intel_`\n```' + rundowns[run][lt][id].intel[locale] + '```'
									+ '\n`:://Sectors_&&_progression_permits_`\n';

								for(var mt in rundowns[run][lt][id].missionTypes){
									if(rundowns[run][lt][id].missionTypes[mt] == true){
										content = content + ' - ' + mt + ': ';
										if(rundowns[run][lt][id].completed[mt] == true){
											content = content + '`✅ Completed`\n';
										} else {
											content = content + '`❌ Not completed`\n';
										}
									}
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

				console.log(`${interaction.user.username} used /${cmdName} ${value}`)
				return interaction.reply({embeds: [embed]});
			} else {		
				console.log(`${interaction.user.username} used /${cmdName} with no option`)
				return interaction.reply('No option was provided!');
			}
		})();
	},
};