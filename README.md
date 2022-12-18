# GTFO Companion app
This is a Discord bot I made to assist my GTFO team in expedition management.

It's able to show the state of the game's rundowns and to display details about the missions.
We use it to follow our progress through the complex and to familiarise with the next mission intels and objectives before dropping in.

## The application
The application itself is just a bot named Dauda (like one of the bots in the game).

![The bot](Images/dauda.png?raw=true)

It allows only one command:  

![Command list](Images/commands.png?raw=true)

`/rundowns` displays the list of available rundowns:

![rundowns list](Images/rundownsList.png?raw=true)

From there, you'll be able to check any rundowns state and mission intel, but also to mark missions and subsectors as completed or not.

## Examples

#### Here is the result of an user clicking the `R7` button:

![/rundown command result](Images/rundown.png?raw=true)

You can see that the missions that have been successfully finished are represented in green.

#### Here is the result of an user clicking the `B3` button:

![/mission command result](Images/mission.png?raw=true)

Here the subsectors can have a checkmark if completed.

At the bottom, you can click on a button to mark a sector as complete (or as not complete).  
*Note: To use those buttons, the user needs the permission to manage events.*

## More

For now all the infos about the rundowns, missions, and completion are stored in a several JSON files. 
In the future I intend to transfer all of it into a database with the completion being linked to the discord server the bot is in.
