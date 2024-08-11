# Flawless
Flawless is a bot that has been in development since July 10, 2023
It is known for being both a user and server bot

# How to setup

## Dependencies
  - Node.js (any version thats above v16.6.0)
  - VS2022 Build Tools (for some libraries)
  - Python 3.8+ (same as above)

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
    "minimumRamMb": 100 //Minimum RAM before it thinks its running out of memory
   }
   ```

## More command line stuff
   Go into src and run ``node server`` and bam, now u have Flawless running!
