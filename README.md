# GTFO Companion app

![Banner](/Images/GTFOBot-Banner-tr.png?raw=true)

<p align="center">
    <a href="https://nodejs.org/" target="_blank"><img alt="Node.js badge" title="Using Node.js!" src="https://img.shields.io/badge/node.js-233056?style=for-the-badge&logo=node.js&logoColor=white"/></a>
    <a href="https://discord.js.org/" target="_blank"><img alt="Discord.js badge" title="Using Discord.js!" src="https://img.shields.io/badge/-Discord.js-5865F2?style=for-the-badge&logo=discord.js"/></a><br>
    <img alt="Dauda Status" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fcogilabs.eu%2FGTFOBotStateCheck%2Fstate?style=for-the-badge"/>
    <img alt="Servers joined" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fcogilabs.eu%2FGTFOBotStateCheck%2Fservers?style=for-the-badge"/>
</p>

## Introduction
This is a Discord bot I made to assist my GTFO team in expedition management.

It's able to show the state of the game's rundowns and to display details about the missions.
We use it to follow our progress through the complex and to familiarise with the next mission intels and objectives before dropping in.

## The application
The application itself is just a bot named Dauda (like one of the bots in the game).

![The bot](/Images/dauda.png?raw=true)

It allows several commands, but its main one is `/rundowns`:  

![Command list](/Images/commands.png?raw=true)

`/rundowns` displays the list of available rundowns:

![rundowns list](/Images/rundownsList.png?raw=true)

From there, you'll be able to check any rundowns state and mission intel, but also to mark missions and subsectors as completed or not.

## Examples

#### Here is the result of an user clicking the `R7` button:

![rundown display](/Images/rundown.png?raw=true)

You can see that the missions that have been successfully finished are represented in green.

#### Here is the result of an user clicking the `B3` button:

![mission display](/Images/mission.png?raw=true)

Here the subsectors will have a checkmark if completed.

At the bottom, you can click on a button to mark a sector as complete (or as not complete).  
*Note: To use those buttons, the user needs the permission to manage events.*

## Event handling

The bot sends a message when a scheduled server event is created. By checking the name and description of the event for a mission ID, it's able to know where the expediton is going, and sends a message including the mission ID (if no mission ID is found, the message just doesn't mention it):
  
> The Warden is sending us in a new expedition to ***R7B1***, so get ready to work together, or die together!  
  
It also keeps track of who is interested in the expedition and sends messages accordingly.  
  
When the event starts, Dauda will tell users with a join link.  
  
If you change the mission ID contained in the event, the bot will send a message saying that the expedition is changing destination. The message will depend of the completion of the first destination:

> The expedition to ***R1C2*** was a success and is now moving to ***R1D1***!  
  
> Unfortunately, the expedition to ***R7B2*** did not end up as expected... But no worries, we are now moving to ***R7C1***.  
  
When an event is finished, a message of the same kind as above will be sent, again checking the completion of the mission in the completion file.  
  
Of course it means you have to update the file with `/rundowns` before modifying or finishing the event.  
  
By default, all of these messages will be sent to the first channel named `general` it finds. If there is none, it will send it to the system channel. If no system channel is defined, it doesn't send the messages.  
You can change this setting (per server) with the `/config` command.
The setting is still overideable, by putting `` `ch:channelname` `` somewhere in the event description, the bot will send any message about this event in that selected channel (here, "channelname").  
  
The `/config` command also allows to configure a role to be pinged when event messages are sent.
  
Soon, the bot will only detect events containing the text "GTFO" in their description, for obvious reasons.

## Message reacting and answering

The bot is also able to react to some messages, like an `@everyone` ping.  
   
For instance it can react to messages like "Did we finish R1D1?", "What's the state of R2B1?", "Do you guys know if we are done with R7B3?" with a green checkmark ✅ or a red cross ❌, depending of the state of the main objective of that mission.  
  
It also answers to messages like "Thanks Dauda" with a random "You're welcome" message, and react with a question mark ❓ when someone says things like "Just ask Dauda".

## More

The application is *fully localized* in English and French, taking the server language for event handling and answering/reacting to messages, and the interacting user's language for command descriptions, and answering to commands (Intel, mission descriptions, etc...).  
It's also quite easy to localize in other languages (cf. [the english localization file](/localization/en-US.json)).  
  
If a text channel named `dauda-logs` exists, the bot will log every actions it does in this server in it, along with actions like rebooting or updating.  
You can also add those logs to another channel (like your “bot-logs” channel for instance) using the `/config` command.
  
The bot has an `echo` command, allowing admins to speak in his name (Real message author can still be checked in the logs channel(s)).  .

## Trying/launching

If you want to try Dauda, you can add it to your server by clicking this button:
<p align="center"><a href="https://discord.com/api/oauth2/authorize?client_id=1050757215885209640&permissions=283736656976&scope=bot" target="_blank"><img alt="Add me on discord button" title="Add me on your discord server!" src="https://img.shields.io/badge/Add%20Dauda%20on-Discord-5865F2?style=for-the-badge"></a></p>

**🔺 Keep in mind that it is still in active developement 🔺**  

If you want to launch it by yourself you'll need to:
- Create a discord app on <https://discord.com/developers/> 
- Create a `config.json` file using the template [`template-config.json`](/template-config.json) and put your created bot's details inside of it
- Run `npm install` in the project's folder to install dependencies
- Launch [`GTFOBot.js`](/GTFOBot.js) with node.js (this is the main program)
- Deploy the commands by launching at least once [`deploy-commands-global.js`](/deploy-commands-global.js) (also with node.js)
