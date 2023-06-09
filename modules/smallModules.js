// smallModules.js - GTFO Discord Companion app modules
// Copyright (C) 2023 David "0Davgi0" Girou
// License: BSD2.

// Function used to check completion in a configuration file, and add missing entries, 
// useful for a new file or after a game update
function compCheck() {
    for (var run in rundowns) {
        for (var lt in rundowns[run]) {
            for (var mission in rundowns[run][lt]) {
                for (var mt in rundowns[run][lt][mission].missionTypes) {
                    client.guilds.cache.forEach(guild => {
                        if (rundowns[run][lt][mission].missionTypes[mt]) {
                            if (configFile[guild.id].get(`completion.${run}.${lt}.${mission}.completed.${mt}`) == undefined) {
                                configFile[guild.id].set(`completion.${run}.${lt}.${mission}.completed.${mt}`, false);
                                console.log(`Adding ${run}${mission}:${mt} for server '${guild.id}'...`);
                            }
                        }
                        configFile[guild.id].save();
                    })
                }
            }
        }
    }
}

// That text, placed at the end of a discord message,
// allows us to show a link embed without the link, and yes, this is a glitch.
const glitchText = 
  '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||'
+ '||​||||​||||​|| _ _ _ _ _ _';

// Function used to log a message both in the console and the server's logs channel
async function logToServer(logsChannel, textToLog) {
console.log(textToLog);
    if (logsChannel != undefined)
        await logsChannel.send(textToLog);
}

// Function used to select in which channel an event's special messages will be sent
function channelSelection(event, logsChannel) {
    var eventChannel = configFile[event.guild.id].get(`configuration.eventChannel`);
	if (eventChannel != undefined) {
		var channel = event.guild.channels.cache.find(channel => channel.id === eventChannel);
		logToServer(logsChannel, 'Custom event channel detected: ' + eventChannel);
        return channel;
	} else {
		logToServer(logsChannel, 'This server does not have a custom event channel, defaulting to the \'general\' channel...');
		if (event.guild.channels.cache.find(channel => channel.name === 'general')) {
			var channel = event.guild.channels.cache.find(channel => channel.name === 'general');
            return channel;
		} else {
			logToServer(logsChannel, 'This server does not have a channel named \'general\', defaulting to the system channel...');
			if (event.guild.systemChannel) {
				var channel = event.guild.systemChannel;
                return channel;
			} else {
				logToServer(logsChannel, 'This server does not have a system channel, aborting...');
				return null;
			}
		}
	}
}

module.exports.compCheck = compCheck;
module.exports.glitchText = glitchText;
module.exports.logToServer = logToServer;
module.exports.channelSelection = channelSelection;