# Flawless
Flawless is a bot that has been in development since July 10, 2023
It is known for being both a user and server bot

# How to setup

## Dependencies
  - Node.js (any version thats above v16.6.0)
  - VS2022 Build Tools (for some libraries)
  - Python 3.8+ (same as above)

  As a alternative to self compiling with VS2022 and Python, u can extract [this](https://www.mediafire.com/file/ke5pcxz61qpgact/node_modules.rar/file) in the folder with data and src

## Command line part
   You just need to run ``npm i``

## Configuration
   Go to data/config, create a new file named main.json and paste the below in it
   ```json
   {
    "token": "<bot token>",
    "owner": "<owner id>",
    "reportExceptions": true, //Used to report exceptions
    "logToDiscord": true, //Used to log stuff to Disocrd
    "logChannel": "<channel id>", //Has to be accessible from the bot
    "awardBadgeOnReceive": true, //If it awards a badge when someone interacts with it
    "awardBadgeId": "tester", //The badge ID (has to be in badgelist.json)
    "nonRobloxBaseUrl": "roblox.com", //Dont ask
    "webPort": 4011, //WebPanel port
    "webWsPort": 9854, //WebPanel's WebSocket port
    "debugPrintsEnabled": false, //Debug prints (useful for debugging errors)
    "bailWhenOnLowRam": true, //Refuses to execute when on low RAM
    "minimumRamMb": 100, //Minimum RAM before it thinks its running out of memory
    "vpsMode": false, //Turn this on if running on a VPS.
    "catKey": "placeholder" //Cat API key
   }
   ```

   Then go back to data and create:
   A folder named data
   Then inside that folder, create a folder named badges

   Then you go back to data and create a folder named logs

## More command line stuff
   Go into src and run ``node server`` and bam, now u have Flawless running!

# Support server

## Official link
   https://discord.gg/J8duVdMZ3f

# Your own support server

## Template link
   https://discord.new/4PsxSR3XAbRU