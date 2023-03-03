If you want to launch the bot by yourself you'll need to:
- Create a discord app on <https://discord.com/developers/> 
- Create a `config.json` file using the template [`template-config.json`](/template-config.json) and put your created bot's details inside of it
- Run `npm install` in the project's folder to install the dependencies
- Launch the main program [`GTFOBot.js`](/GTFOBot.js) with node.js
- Deploy the commands by launching (only once) [`deploy-commands-global.js`](/deploy-commands-global.js) (also with node.js)  
  
I do recommend, however, to instead add the existing bot to your server, as it will allow you to get the frequent updates and bug fixes automatically.