# IEM Discord bot

A nice and polite bot made for the Discord's server of the IEM P8 reworked by goat among the IEM P9.

## How to setup

This bot is built on top of [Discord.js](https://github.com/discordjs/discord.js) library for Node.js. See [this page](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to know how to register it on your Discord's server.

Then you'll need to tweak some files a little bit, because some of the variables are not stored in this repo for security reasons. To deploy the bot you'll need to configure them in 2 separate files :

### /src/config.json file
Rename the file `config.example.json` to `config.json` and update the variables inside. To find them, see [this page for the token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) and [this page for the IDs](https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands).

### .env file (environment variables)
Rename the file `example.env` to `.env` and update the URL the bot will visit to grab the planning. It's the page displaying only one week of the planning, given by the QR code available in the regular planning page. The page looks like this :<br />
![Web page to scrap](img/page-web.jpg "Web page to scrap")

## Deployment with Docker

 - Clone the repo on your server and `cd` into it
 - Add the `.env` and the `config.json` files
 - Build the image : `docker build . -t iem-discord-bot:latest`
 - Run the image : `docker run -d --name iem-discord-bot iem-discord-bot:latest`
 