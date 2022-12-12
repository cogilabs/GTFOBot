# GTFO Companion app
This is a Discord bot I made to assist my GTFO team in expedition management.

It's able to show the state of the game's rundowns and to display details about the missions.
We use it to follow our progress through the complex and to familiarise with the next mission intels and objectives before dropping in.

## The application
The application itself is just a bot named Dauda (like one of the bots in the game).

![The bot](Images/dauda.png?raw=true)

It allows several commands:  

![Command list](Images/commands.png?raw=true)

`/complete` marks a mission complete  
`/uncomplete` does the opposite (in case of a mistake for instance)  
`/rundown` shows a rundown's state  
`/mission` shows a mission's informations and state  
  
## Examples

#### Here is the result of an user inputing the command `/rundown 7`:

![/rundown command result](Images/rundown.png?raw=true)

You can see that the missions that have been successfully finished have a green checkmark next to their ID.

#### Here is the result of `/mission R7B3`:
*(You can also obtain this reslut by clicking on the B3 button on the* **`/rundown`** *command result)*

![/mission command result](Images/mission.png?raw=true)

Here the mission types can have a checkmark when finished.

## More

For now all the infos about the rundowns, missions, and completion are stored in a single JSON file. 
In the future I intend to transfer it to a database with the completion being linked to the discord server the bot is in.
