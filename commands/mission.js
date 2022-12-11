const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Rlist } = require('../rundowns/Rlist.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mission')
		.setDescription('Info about a mission')
		.addStringOption(option => 
			option.setName('mission')
			.setDescription('The mission identifier (Ex: R1A1)')
			.setRequired(true)),
	async execute(interaction) {
		const value = interaction.options.getString('mission');
		var title = 'Mission *' + value + '* not found';
		var content = 'Try to check if the mission identifier is correct and in the right format (Ex: R1A1). You can use **/rundown** to verify if the mission exists';

		(async () => {
			if (value) {
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

				console.log(`${interaction.user.username} used /mission ${value}`)
				return interaction.reply({embeds: [embed]});
			} else {		
				console.log(`${interaction.user.username} used /mission with no option`)
				return interaction.reply('No option was provided!');
			}
		})();
	},
};