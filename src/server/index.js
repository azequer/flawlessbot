//require() function, this is a module for some reason
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let globalSettings = require("../../data/config/main.json")
if(!globalSettings.vpsMode) {
  console.warn("This instance of Flawless is running in non-VPS mode!");
}
let tokk = globalSettings.token;

const os = require('os');

const schedule = require('node-schedule');

let watchedVariables = {};

function addToWatchList(name, v) {
    //Once at the watch list, it cannot be removed from the watch list.
    //console.log("Added "+name);
    watchedVariables[name] = v;
}

function onVarChange(name, v) {
    //let a = watchedVariables[name];
    //console.log(name+" changed");
    watchedVariables[name] = v;
}

function getFromWatchList(name) {
    return watchedVariables[name];
}

//Classes

class FWButtonInfo {
  constructor() {}

  isOwnerOnly = false;
  id = "";

  setIsOwnerOnly(yh) {
    this.isOwnerOnly = yh;
    return this;
  }

  setId(newId) {
    this.id = newId;
    return this;
  }
}

//Express and Axios <3
const express = require('express');
const axios = require('axios');
axios.defaults.timeout = 120000;
const app = express();
const port = 9853;
const wsport = 9854;
let startTime = Date.now()/1000;

//variables!!
let whoTheFuckOwnsThisBot = globalSettings.owner;
let addmin = {};
let logChannels = [];//["1147976618455859271"];
let blacklist = [

];
let words = [];
let wordsForWords = [];
let repsonse = "";

let commandBlacklist = [];
let commandBlacklistV2 = []; //channel blacklist
let commandBlacklistV3 = []; //user blacklist

let listOfBlacklists = {
    "server": commandBlacklist,
    "channel": commandBlacklistV2,
    "user": commandBlacklistV3
};

addToWatchList("listOfBlacklists", listOfBlacklists);
addToWatchList("commandBlacklist", commandBlacklist);
addToWatchList("commandBlacklistV2", commandBlacklistV2);
addToWatchList("commandBlacklistV3", commandBlacklistV3);
addToWatchList("words", words);
addToWatchList("wordsForWords", wordsForWords);
addToWatchList("repsonse", repsonse);
addToWatchList("blacklist", blacklist);
addToWatchList("logChannels", logChannels);
addToWatchList("addmin", addmin);
addToWatchList("whoTheFuckOwnsThisBot", whoTheFuckOwnsThisBot);

//Express <3
app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
})

//WebSocket
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: wsport });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    if(data.toString() == "stats") {
      let guildNum = client.guilds.size();
      ws.send(JSON.stringify({ messages: processedMessages, appCommands: processedAppCommands, guilds: guildNum, startTime: startTime, admins: padmins }));
    }
  });
});

function broadcast(thing) {
  wss.clients.forEach(function(client) {
    client.send(thing);
  });
}

//Ton of random stuff that is used later in the code

//DiscordJS
import DiscordJS, { Intents, Interaction } from "discord.js";
const { Attachment, Collection, MessageActionRow, MessageButton, MessageEmbed, MessageMentions: { USERS_PATTERN } } = require("discord.js");
const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection
} = require('@discordjs/voice');
import dotenv from "dotenv";

import { simpleGit } from "simple-git";

let localGit = simpleGit(__dirname+"/../../");

//stream, util n fs!!
import * as stream from 'stream';
import util, { promisify } from 'util';
import fs, { createWriteStream } from 'fs';

//UUID stuff
const { v4: uuidv4, v1: uuidv1 } = require('uuid');

const uuidtd = require('../base/uuidlib/index.cjs');

const rablaxlib = require('../base/rbxlib/rbxlib.cjs');

const crypto = require('crypto');

///Logging

const filenaem = '../data/logs/current-'+crypto.randomUUID()+".log";

addToWatchList("filenaem", filenaem);

var log_file = fs.createWriteStream(filenaem, {flags : 'w'});
var log_stdout = process.stdout;

const regexalig = /\((.*):(\d+):(\d+)\)$/

const path = require("path");
const moment = require("moment");

console.log = function(d) { //
  const column = moment().format("YYYY-MM-DD HH:mm:ss");
  log_file.write(util.format("[%s] [INFO] %s",column,d) + '\n');
  log_stdout.write(util.format("[%s] [INFO] %s",column,d) + '\n');
};

console.error = function(d) { //
  log_file.write(util.format("[ERROR] %s",d) + '\n');
  log_stdout.write(util.format("[ERROR] %s",d) + '\n');
};

let stateDb = {};
console.log("Opening StateDatabase file..");
try {
stateDb = JSON.parse(fs.readFileSync("../data/base/state.json"));
} catch (eee) {
stateDb = {};
console.error(eee);
}

function stateSave() {
fs.writeFile('../data/base/state.json', JSON.stringify(stateDb, null, 2), function(){});
}

function stateGet(name) {
if(stateDb[name]) {
return stateDb[name];
} else {
stateDb[name] = {};
return stateDb[name];
}
}

function stateSet(name, val) {
stateDb[name] = val;
stateSave();
}

//Statistics ;3
let statistics = {};

try {
statistics = stateGet("stat");
if(!statistics) {
statistics = {};
}
} catch(e) {
statistics = {};
}

let stat = {
  incrementCounter: function(id, extradata = null){
    let thing = statistics[id];
    if(thing == undefined && thing == null) {
      thing = {};
      thing["data"] = [];
      thing["amount"] = 0;
    }
    thing["amount"]++;
    if(extradata != null) {
      let newdata = {
        "count": thing["amount"],
        "data": extradata
      };
      thing["data"].push(newdata);
    }
  },
  reportStat: function(id, data = null) {
    let thing = statistics[id];
    if(thing == undefined && thing == null) {
      thing = [];
    }
    thing.push(data);
  }
};

//TempMessageDB (workaround for embeds)
let embdb = {};

try {
embdb = stateGet("embdb");
if(!embdb) {
embdb = {};
}
} catch(e) {
embdb = {};
}

function getDataForMessageId(id) {
  setTimeout(1000, () => { embdb[id] = undefined; stateSet("embdb", embdb); });
  return stateGet("embdb")[id];
}

function addDataForMessageId(id, dat) {
  embdb[id] = dat;
  stateSet("embdb", embdb);
}

class FWUser {
	id = "0";
	data = {};
	badges = [];
	
	constructor(id) {
		
	}
	
	load() {
		
	}
}

//random int (max needs to be max + 1 for accurate values)
function splitmix32(a) {
return function() {
 a |= 0;
 a = a + 0x9e3779b9 | 0;
 let t = a ^ a >>> 16;
 t = Math.imul(t, 0x21f0aaad);
 t = t ^ t >>> 15;
 t = Math.imul(t, 0x735a2d97);
 return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
}
}

function sfc32(a, b, c, d) {
return function() {
  a |= 0; b |= 0; c |= 0; d |= 0;
  let ttt = (a + b | 0) + d | 0;
  d = d + 1 | 0;
  a = b ^ b >>> 9;
  b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11);
  c = c + ttt | 0;
a = a + 0x9e3779b9 | 0;
let t = ttt ^ a >>> 16;
t = Math.imul(t, 0x21f0aaad);
t = t ^ t >>> 15;
t = Math.imul(t, 0x735a2d97);
  return (t >>> 0) / 4294967296;
}
}

const seedgen = () => (Math.random()*2**32)>>>0;
let getRand = sfc32(seedgen(), seedgen(), seedgen(), seedgen());

function getRandomInt(max) {
getRand = sfc32(seedgen(), seedgen(), seedgen(), seedgen());
return Math.floor(getRand() * max);
}

//JSON Database Logging
let db = {};

addToWatchList("db", db);
//var dbFile = fs.createWriteStream("./db.json", {flags : 'w'});
console.log("Opening database file..");
try {
db = JSON.parse(fs.readFileSync("../data/base/db.json"));
onVarChange("db", db);
} catch (eee) {
db = {};
console.error(eee);
}
console.log("Done!");

function reloadDb() {
  try {
    db = JSON.parse(fs.readFileSync("../data/base/db.json"));
    onVarChange("db", db);
    } catch (eee) {
    db = {};
    console.error(eee);
    }
}

let badgeDb = {};
let badgeids = {};

try {
  badgeids = JSON.parse(fs.readFileSync("../data/config/badgelist.json"));
} catch (eee) {
  badgeids = [];
  console.error(eee);
}

function loadBadges() {
  try {
    badgeids = JSON.parse(fs.readFileSync("../data/config/badgelist.json"));
  } catch (eee) {
    badgeids = [];
    console.error(eee);
  }
  badgeDb = {};
  let badgeDir = "../data/data/badges";
  let files = fs.readdirSync(badgeDir);

  files.forEach((file, ind) => {
    let filePath = badgeDir+"/"+file;
    let userId = file.split(".")[0];
    try {
      let userData = JSON.parse(fs.readFileSync(filePath));
      badgeDb[userId] = userData;
      for (var key in badgeDb[userId]) {
          const index = badgeids[badgeDb[userId][key]];
          if (!index) { // only splice array when item is found
            console.log("Illegal badge id "+badgeDb[userId][key]+" in "+userId+"'s badge collection");
            badgeDb[userId].splice(badgeDb[userId].indexOf(key), 1); // 2nd parameter means remove one item only
            saveBadges();
          }
      }
    } catch (eee) {
      badgeDb[userId] = [];
      console.error(eee);
    }
  });
}

function badgeIdToBadgeDesc(id) {
  let bid = badgeids[id];
  if(!bid) {
    return "missigno";
  }
  return bid;
}

function getBadges(uid) {
  if(!badgeDb[uid]) {
    badgeDb[uid] = []
  }
  return badgeDb[uid];
}

function saveBadges() {
  for (var key in badgeDb) {
    fs.writeFile('../data/data/badges/'+key+'.json', JSON.stringify(badgeDb[key], null, 2), function(){});
  }
}

function awardBadge(uid, id) {
  if(!badgeDb[uid]) {
    badgeDb[uid] = []
  }
  if(badgeDb[uid].indexOf(id) > -1) {
    return false;
  }
  badgeDb[uid].unshift(id);
  console.log(uid+" just got badge \""+id+"\"");
  saveBadges();
  return true;
}

async function easyAwardBadge(message, id) {
  var resultie = awardBadge(message.author.id, id);
      if(resultie && permissionCheck(message, false, "SEND_MESSAGES", true)) {
        await message.channel.send(generateBadgeAwardMessage(id, message.author.username));
      } else if (resultie && Reflect.get(message, "isFromCall")) {
        try {
        await message.author.createDM();
        await message.author.send(generateBadgeAwardMessage(id, message.author.username));
        } catch(e) {}
  }
}

async function easyAwardBadgeInteract(message, id) {
  var resultie = awardBadge(message.user.id, id);
      if(resultie && permissionCheck(message, true, "SEND_MESSAGES", true)) {
        await message.channel.send(generateBadgeAwardMessage(id, message.user.username));
      } else if (resultie && Reflect.get(message, "isFromCall")) {
        try {
        await message.author.createDM();
        await message.author.send(generateBadgeAwardMessage(id, message.user.username));
        } catch(e) {}
  }
}

function generateBadgeAwardMessage(id, uname) {
  let holyhsit = new MessageEmbed()
            .setTitle("Badge awarded")
            .addField(id, badgeIdToBadgeDesc(id), true)
            .setFooter("Awarded to "+uname);
  return { embeds:[holyhsit] };
}

loadBadges();

let padmins = {};
let padminsErrorMsg = "";

addToWatchList("padmins", padmins);
addToWatchList("padminsErrorMsg", padminsErrorMsg);

try {
padmins = JSON.parse(fs.readFileSync("../data/base/padmins.json"));
onVarChange("padmins", padmins);
} catch (eee) {
padmins = {};
console.error(eee);
padminsErrorMsg = eee.stack;
onVarChange("padmins", padmins);
onVarChange("padminsErrorMsg", padminsErrorMsg);
}

function loadPadmins() {
  try {
    padmins = JSON.parse(fs.readFileSync("../data/base/padmins.json"));
    onVarChange("padmins", padmins);
    } catch (eee) {
    padmins = {};
    console.error(eee);
    padminsErrorMsg = eee.stack;
    onVarChange("padmins", padmins);
    onVarChange("padminsErrorMsg", padminsErrorMsg);
    }
}

async function savePermAdmin() {
    fs.writeFile('../data/base/padmins.json', JSON.stringify(padmins, null, 2), function(){});
}

async function saveMessage(message) {
  if (!db[message.author.id]) {
    db[message.author.id] = [];
  }
  if (message.author.id == client.user.id) {
    return;
  }
  db[message.author.id].push({ content:message.content,authorId:message.author.id,dm:message.channel.type == 'DM' });
  fs.writeFile('../data/base/db.json', JSON.stringify(db, null, 2), function(){});
  console.log("Message saved!");
  onVarChange("db", db);
}

async function getMessages(id) {
  //let lim = offset !== null ? offset+", "+limit : limit;
  console.log("Ordering messages from "+id);
  return db[id];
}

//UUID generating

let startupUUID = uuidv1();

addToWatchList("startupUUID", startupUUID);

//DeployHistory

console.log("Loading deploy history..");

let testParsed = [];

let testSucksParsed = [];

let test = await axios.get("https://setup.rbxcdn.com/DeployHistory.txt");
     
let radnom1 = test.data.split('\n');

let testThisSucks = await axios.get("https://s3.amazonaws.com/setup.gametest2.robloxlabs.com/DeployHistory.txt");
     
let testThisSucks1 = testThisSucks.data.split('\n');

let radnom = radnom1.filter(item => {
  let isValid = item.includes("New");
  //New RccService version-336605f55f6847b4 at 11/10/2009 3:35:29 PM... Done!
  //New RccService version-978fdda2ac634c5b at 4/6/2011 11:21:51 PM, file verion: 0, 37, 0, 13...Done!
  if(isValid) {
    let splitla = item.split(" ");
    if(splitla.length == 8) { //no git hash
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": 0, "vvernumbuild": 0, "vorig": item, "vyear": yeartwothing };
      testParsed.push(slobj);
    }
    if(splitla.length == 13) { //no git hash, file ver
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": Number.parseInt(splitla[13-3]), "vvernumbuild": Number.parseInt(splitla[13-1]), "vorig": item, "vyear": yeartwothing };
      testParsed.push(slobj);
    }
    if(splitla.length == 14) { //no git hash, file ver
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": Number.parseInt(splitla[13-3]), "vvernumbuild": Number.parseInt(splitla[13-1]), "vorig": item, "vyear": yeartwothing };
      testParsed.push(slobj);
    }
    if(splitla.length == 17) { //no git hash, file ver
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": Number.parseInt(splitla[13-3]), "vvernumbuild": Number.parseInt(splitla[13-1]), "vorig": item, "vyear": yeartwothing };
      testParsed.push(slobj);
    }
  }
  return isValid == false ? false : true;
});

let radnomIHateThis = testThisSucks1.filter(item => {
  let isValid = item.includes("New");
  //New RccService version-336605f55f6847b4 at 11/10/2009 3:35:29 PM... Done!
  //New RccService version-978fdda2ac634c5b at 4/6/2011 11:21:51 PM, file verion: 0, 37, 0, 13...Done!
  if(isValid) {
    let splitla = item.split(" ");
    if(splitla.length == 8) { //no git hash
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": 0, "vvernumbuild": 0, "vorig": item, "vyear": yeartwothing };
      testSucksParsed.push(slobj);
    }
    if(splitla.length == 13) { //no git hash, file ver
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": Number.parseInt(splitla[13-3]), "vvernumbuild": Number.parseInt(splitla[13-1]), "vorig": item, "vyear": yeartwothing };
      testSucksParsed.push(slobj);
    }
    if(splitla.length == 14) { //no git hash, file ver
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": Number.parseInt(splitla[13-3]), "vvernumbuild": Number.parseInt(splitla[13-1]), "vorig": item, "vyear": yeartwothing };
      testSucksParsed.push(slobj);
    }
    if(splitla.length == 17) { //no git hash, file ver
      let yearll = splitla[4].split("/");
      let yeartwothing = Number.parseInt(yearll[2]);
      let datet = Date.parse(splitla[4]+" "+splitla[5]+" "+splitla[6]);
      let slobj = { "vhash": splitla[2], "vtype": splitla[1], "vdate": datet, "vvernum": Number.parseInt(splitla[13-3]), "vvernumbuild": Number.parseInt(splitla[13-1]), "vorig": item, "vyear": yeartwothing };
      testSucksParsed.push(slobj);
    }
  }
  return isValid == false ? false : true;
});

let radnomPos = 0;

let radnomFinalCount = 0;

for (radnomPos = 0; radnomPos < radnom.length; radnomPos++) {
  radnomFinalCount = radnomPos + 1;
  //console.log(radnomPos+". "+radnom[radnomPos]);
}

console.log("Counted "+radnomFinalCount+" deployhistory versions");

//let testWhy = await axios.get("http://setup.gametest2.robloxlabs.com/DeployHistory.txt");
     
let radnomFuck = [];//testWhy.data.split('\n');

addToWatchList("test", test);
addToWatchList("radnom", radnom);
//addToWatchList("testWhy", testWhy);
addToWatchList("radnomFuck", radnomFuck);

console.log("Done!");

//stuff cmds
let cmd = [];
let cmds = [];

//Emitter stuff

import { EventEmitter } from 'node:events';
import { setTimeout, setInterval } from 'timers/promises';
import { decode } from 'punycode';
class ClientEmitter extends EventEmitter {}
const emitting = new ClientEmitter();

//Plugin loader

let plugins = JSON.parse(fs.readFileSync("../data/config/plugs.json")); //plugs.json NEEDS TO EXIST (and be a valid json file)
let newPlugins = {};

addToWatchList("plugins", plugins);
addToWatchList("newPlugins", newPlugins);

function antiCache(path) {
    delete require.cache[require.resolve(path)];
}

function loadPlugins() {
  plugins = JSON.parse(fs.readFileSync("../data/config/plugs.json"));
  let i = 0;

  while (i < plugins.length) {
      console.log("Loading plugin "+plugins[i].name);
      antiCache(plugins[i].path);
      const plugin = require(plugins[i].path);
      newPlugins[plugins[i].name] = plugin;
      newPlugins[plugins[i].name].init(emitting, DiscordJS, axios);
      //console.log("Monitoring plugin: "+plugins[i].name);
      console.log("Loaded plugin "+plugins[i].name);
      i++;
  }
  onVarChange("newPlugins", newPlugins);
  onVarChange("plugins", plugins);
}

function loadPlugin(name) {
  console.log("Loading custom plugin "+name);
  let path = "../data/downloads/"+name;
  antiCache(path);
  const plugin = require(path);
  newPlugins[plugins[i].name] = plugin;
  newPlugins[plugins[i].name].init(emitting, DiscordJS, axios);
  console.log("Monitoring custom plugin: "+name);
  console.log("Loaded custom plugin "+name);
  onVarChange("newPlugins", newPlugins);
}

const finished = promisify(stream.finished); //i forgot what this does but DONT REMOVE IT

//File downloading stuff

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}

//Channel ID for the message-sending stuff
var ied = "";

addToWatchList("ied", ied);

//Admin thingy

function removeUser(id, msg) {
    if (!addmin[msg.guildId]) {
        throw new Error("addmin[msg.guildId] is undefined");
    }
    var index = addmin[msg.guildId].indexOf(id);
    if (index !== -1) {
    addmin[msg.guildId].splice(index, 1);
    msg.reply("Removed user successfully!");
    } else {
    msg.reply("User doesnt exist..");
    }
    onVarChange("addmin", addmin);
}

function isAdmin(id, msg) {
    if (isTrusted(id)) {
        return true;
    }
    if (!addmin[msg.guildId]) {
        throw new Error("addmin[msg.guildId] is undefined");
    }
    if (padmins[msg.guildId]) {
        if (padmins[msg.guildId].includes(id)) {
            return true;
        }
    }
    return addmin[msg.guildId].includes(id);
}

function isAdminStr(id, msg) {
    if (isTrusted(id)) {
        return "Trusted";
    }
    if (!addmin[msg.guildId]) {
        throw new Error("addmin[msg.guildId] is undefined");
    }
    if (padmins[msg.guildId]) {
        if (padmins[msg.guildId].includes(id)) {
            return "PermanentAdmin";
        }
    }
    if (addmin[msg.guildId].includes(id)) {
      return "Admin";
    }
    return "Normal";
}

let trustedray = {};

function loadTrusted() {
  try {
  trustedray = JSON.parse(fs.readFileSync("../data/base/trusties.json"));
  } catch(e) {
  trustedray = {
    "826488961626275854": true
  };
  console.error(e);
  }
}

console.log("Loading trusties.json");
loadTrusted();

function isTrusted(id) {
    if(id == whoTheFuckOwnsThisBot) { return true; }
    return trustedray[id]; //:3
}

function addUser(id, msg) {
	if (!addmin[msg.guildId]) {
        addmin[msg.guildId] = [];
    }
    if (!addmin[msg.guildId].includes(id)) {
        addmin[msg.guildId].push(id);
        msg.reply("Successfully ranked user.");
    } else if (blacklist.includes(id)) {
        msg.reply("User is blacklisted from being an admin. Ask the owner about it..");
    } else {
        msg.reply("User is already a admin!");
    }
    onVarChange("addmin", addmin);
}

//will be used soon
dotenv.config();

//the client itself
const client = new DiscordJS.Client({
  partials: ["CHANNEL"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.MESSAGE_CONTENT],
  shardCount: 1
});

function getUserFromMention(mention) {
	// The id is the first and only match found by the RegEx.
	const matches = mention.matchAll(USERS_PATTERN).next().value;

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return null;

	// The first element in the matches array will be the entire mention, not just the ID,
	// so use index 1.
	const id = matches[1];

	return client.users.cache.get(id);
}

function permissionCheck(msg, isInteraction, permission, isRequired = false) {
  if(!msg.guild && !isInteraction) {
    //Bail
    return false;
  } else if(!msg.guild && isInteraction) {
    switch(permission) {
      case "SEND_MESSAGES":
        if(!isRequired) {
          return true;
        }
        return false;
      default:
        return false;
    };
  }
  return msg.guild.me.permissionsIn(msg.channel).has(Reflect.get(DiscordJS.Permissions.FLAGS, permission));
}

client.commandList = new Collection();

client.buttonCommandInfo = new Collection();

addToWatchList("client.commandList", client.commandList);

addToWatchList("client.buttonCommandInfo", client.buttonCommandInfo);

console.log("Starting..."); //start the loading process

let pingCmd = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong')
        .setIntegrationType([0,1])
        .setContext([0,2]);

let callCmd = new SlashCommandBuilder()
        .setName('call')
        .setDescription('Call by name if command no work it might be my wifi or bot ded')
        .addStringOption(new SlashCommandStringOption()
            .setName('name')
            .setDescription('Command name')
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName('args')
            .setDescription('Command arguments (split with space)'))
        .setIntegrationType([0,1])
        .setContext([0,2]);
        
let helpCmd = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help')
        .setIntegrationType([0,1])
        .setContext([0,2]);
        
client.commandList.set('ping', pingCmd);

client.commandList.set("call", callCmd);

client.commandList.set("help", helpCmd);

client.commandList.set("purge", new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes all messages in a channel')
        .addStringOption(new SlashCommandStringOption()
            .setName('limit')
            .setDescription('How many messages')
            .setRequired(true))
        .setIntegrationType([0])
        .setContext([0]));
client.commandList.set("inviteLink", new SlashCommandBuilder()
        .setName("invitelink")
        .setDescription("Invite link (technically self promo)")
        .setIntegrationType([0])
        .setContext([0]));

let testignInfo = new FWButtonInfo()
        .setIsOwnerOnly(true)
        .setId("testign");

let viewbadInfo = new FWButtonInfo()
        .setIsOwnerOnly(true)
        .setId("viewbadge");

let ballrollThing = new FWButtonInfo()
        .setIsOwnerOnly(true)
        .setId("ballroll");

let deployroll = new FWButtonInfo()
        .setIsOwnerOnly(false)
        .setId("deployroll");

let deploygeeroll = new FWButtonInfo()
        .setIsOwnerOnly(false)
        .setId("deploygroll");

client.buttonCommandInfo.set("testign", testignInfo);

client.buttonCommandInfo.set("viewbadge", viewbadInfo);

client.buttonCommandInfo.set("ballroll", ballrollThing);

client.buttonCommandInfo.set("deployroll", deployroll);
client.buttonCommandInfo.set("deploygroll", deploygeeroll);

onVarChange("client.commandList", client.commandList);

onVarChange("client.buttonCommandInfo", client.buttonCommandInfo);

client.commands = new Collection();

client.buttonCommands = new Collection();

addToWatchList("client.commands", client.commands);

addToWatchList("client.buttonCommands", client.buttonCommands);

client.commands.set("ping", async (interaction) => {
  if(!permissionCheck(interaction, true, "SEND_MESSAGES")) { await interaction.reply({ content:"I cannot send messages in here!", ephemeral: true }); return; }
    await interaction.reply("Pong! My ping is"+Math.round(client.ws.ping)+"ms.");
});

client.commands.set("call", async (interaction) => {
    if(!permissionCheck(interaction, true, "SEND_MESSAGES")) { await interaction.reply({ content:"I cannot send messages in here!", ephemeral: true }); return; }
	let usernami = interaction.member?.username ?? interaction.user.username;
    console.log("Processing request from "+usernami);
    await interaction.deferReply();
    let msg = {};
    Reflect.set(msg, "author", interaction.member ?? interaction.user);
    Reflect.set(msg.author, "id", interaction.member?.user.id ?? interaction.user.id);
    Reflect.set(msg.author, "send", interaction.member?.send ?? interaction.user.send);
    Reflect.set(msg.author, "createDM", interaction.member?.createDM ?? interaction.user.createDM);
    Reflect.set(msg.author, "username", interaction.member?.username ?? interaction.user.username);
    Reflect.set(msg, "channel", interaction.channel);
    Reflect.set(msg, "reply", async function(varg) {
        let gbgggrb = await interaction.editReply(varg);
        return gbgggrb;
    });
    Reflect.set(msg, "guildId", "1183397391307645031");
	let trueArgs = interaction.options.getString("args") ?? "noargs";
    Reflect.set(msg, "content", ">"+interaction.options.getString("name")+" "+trueArgs);
    Reflect.set(msg, "isFromCall", true);
    let argas = (">"+interaction.options.getString("name")+" "+trueArgs).split(" ");
    console.log(argas);
    let funcT = cmd[interaction.options.getString("name")];
    if (funcT !== undefined && funcT !== null) {
    try {
    await funcT(argas, msg);
    } catch(balls) {
    console.error(balls);
    await interaction.editReply("Didnt work, "+balls);
    excpetionHandler(balls, interaction.options.getString("name"), argas);
    console.log(balls);
    }
    } else {
    await interaction.editReply("What kind of command is that");
    }
});

client.commands.set("purge", async (interaction) => {
    if (!isAdmin(interaction.user.id)) {
        await interaction.reply("you are not a admin, dummy..");
        return;
    }
    if(!permissionCheck(interaction, true, "SEND_MESSAGES")) { await interaction.reply({ content:"I cannot send messages in here!", ephemeral: true }); return; }
    if(!permissionCheck(interaction, true, "MANAGE_MESSAGES")) { await interaction.reply({ content:"I cannot delete messages!", ephemeral: true }); return; }
    let fetcheed = await interaction.channel.messages.fetch({limit: Number.parseInt(interaction.options.getString("limit"))});
    let msggg = await interaction.channel.send("fetching messages..");
    let i=0;
    let fetched=[];
    console.log(fetcheed);
    interaction.channel.bulkDelete(fetcheed);
    //fetcheed.forEach(msg => { // Checking if the message author has a certain ID.
    //        if (msggg && msg.id != msggg.id) msg.delete()
    //});
    await msggg.delete();
    await interaction.reply("done");
});

client.commands.set("help", async (interaction) => {
  if(!permissionCheck(interaction, true, "SEND_MESSAGES")) { await interaction.reply({ content:"I cannot send messages in here!", ephemeral: true }); return; }
    let cmdsLis = new DiscordJS.MessageAttachment(Buffer.from("```"+JSON.stringify(cmds, null, 2)+"```"), 'message.txt');
    await interaction.reply({ content: "sending as file since it goes over 2000 characters also note that if command no work it might be my wifi or bot ded", files: [cmdsLis], ephemeral: true });
});

client.commands.set("invitelink", async (interaction) => {
  if(!permissionCheck(interaction, true, "SEND_MESSAGES")) { await interaction.reply({ content:"I cannot send messages in here!", ephemeral: true }); return; }
    await interaction.reply({ content: "You can add or invite me [here](https://discord.com/oauth2/authorize?client_id=1128020016441327779)" });
});

client.buttonCommands.set("ballroll", async (interaction) => {
  let lineas = fs.readFileSync("../data/assets/8ball.txt").toString().split("\n");
    let linerand = lineas[getRandomInt(lineas.length + 1)];
	if(!linerand) {
	  linerand = "No way in hell";
	}
    let holyhsit = new MessageEmbed()
            .setTitle("The balls says...")
            .setDescription(linerand);
            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Re-roll')
                    .setStyle('PRIMARY')
                    .setCustomId('ballroll') 
            );
  await interaction.update({ embeds:[holyhsit], components:[row] });
});

client.buttonCommands.set("deployroll", async (interaction) => {
  let msgg = getDataForMessageId(interaction.message?.id);
  if (msgg[0] == ">randomdeployhistory") {
    let infol = "";
    let thiang = testParsed.filter(item => {
      if(Number.parseInt(msgg[1])) {
        infol = "1 is valid int (parseint)";
        if(msgg[2]) {
          infol = "1 is valid int, 2 is valid";
          let yeart = Number.parseInt(msgg[2]);
          if(yeart) {
            infol = "1 is valid int, 2 is valid int";
            if(msgg[3]) {
              if(yeart >= 2009) { //wheat
        infol = "1 is valid int, 2 is valid int and year, 3 is type";
                if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                  return true;
                }
              } else { //version
        infol = "1 is valid int, 2 is valid int";
                if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                  return true;
                }
              }
            } else {
              
              if(yeart >= 2009) { //wheat
    infol = "1 is valid int, 2 is valid int and year";
                if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2])) {
                  return true;
                }
              } else { //version
    infol = "1 is valid int, 2 is valid int";
                if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2])) {
                  return true;
                }
              }
            }
          } else {
            infol = "1 is valid int, 2 is type";
            if(yeart >= 2009) { //wheat
      infol = "1 is valid int and year, 2 is type";
            if(item.vyear == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
              return true;
            }
          } else { //version
            if(item.vvernum == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
              return true;
            }
          }
          }
        } else {
          let yeart = Number.parseInt(msgg[1]);
          if(yeart) {
    infol = "1 is valid int (msgg 2 else)";
          if(yeart >= 2009) { //wheat
            if(item.vyear == Number.parseInt(msgg[1])) {
              return true;
            }
          } else { //version
            if(item.vvernum == Number.parseInt(msgg[1])) {
              return true;
            }
          }
          }
        }
      } else if(msgg[1]) {
  infol = "1 is type (else)";
        if(item.vtype == msgg[1]) {
          return true;
        }
}
if(msgg[1] == undefined || msgg[1] == null) { return true; }
      return false;
    });
    const row = new MessageActionRow()
          .addComponents(
              new MessageButton()
                  .setLabel('Re-roll')
                  .setStyle('PRIMARY')
                  .setCustomId('deployroll') 
          );
    let shitlb = thiang[getRandomInt(thiang.length + 1)];
	for(let lbg = 0; lbg < 500; lbg++) {
	  if(!shitlb) {
		  shitlb = thiang[getRandomInt(thiang.length + 1)];
	  }
	  }
    addDataForMessageId(interaction.message.id, msgg);
    if(shitlb) {
      interaction.update({ content: "```"+infol+"\n"+shitlb.vorig+"```", components:[row] });
    } else {
      interaction.update({ content: "```"+infol+"\nNo version found.```", components:[row] });
    }
  }
});

client.buttonCommands.set("deploygroll", async (interaction) => {
  let msgg = getDataForMessageId(interaction.message?.id);
  if (msgg[0] == ">randomgametest2deployhistory") {
    let infol = "";
    let thiang = testSucksParsed.filter(item => {
      if(Number.parseInt(msgg[1])) {
        infol = "1 is valid int (parseint)";
        if(msgg[2]) {
          infol = "1 is valid int, 2 is valid";
          let yeart = Number.parseInt(msgg[2]);
          if(yeart) {
            infol = "1 is valid int, 2 is valid int";
            if(msgg[3]) {
              if(yeart >= 2009) { //wheat
        infol = "1 is valid int, 2 is valid int and year, 3 is type";
                if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                  return true;
                }
              } else { //version
        infol = "1 is valid int, 2 is valid int";
                if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                  return true;
                }
              }
            } else {
              
              if(yeart >= 2009) { //wheat
    infol = "1 is valid int, 2 is valid int and year";
                if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2])) {
                  return true;
                }
              } else { //version
    infol = "1 is valid int, 2 is valid int";
                if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2])) {
                  return true;
                }
              }
            }
          } else {
            infol = "1 is valid int, 2 is type";
            if(yeart >= 2009) { //wheat
      infol = "1 is valid int and year, 2 is type";
            if(item.vyear == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
              return true;
            }
          } else { //version
            if(item.vvernum == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
              return true;
            }
          }
          }
        } else {
          let yeart = Number.parseInt(msgg[1]);
          if(yeart) {
    infol = "1 is valid int (msgg 2 else)";
          if(yeart >= 2009) { //wheat
            if(item.vyear == Number.parseInt(msgg[1])) {
              return true;
            }
          } else { //version
            if(item.vvernum == Number.parseInt(msgg[1])) {
              return true;
            }
          }
          }
        }
      } else if(msgg[1]) {
  infol = "1 is type (else)";
        if(item.vtype == msgg[1]) {
          return true;
        }
}
if(msgg[1] == undefined || msgg[1] == null) { return true; }
      return false;
    });
    const row = new MessageActionRow()
          .addComponents(
              new MessageButton()
                  .setLabel('Re-roll')
                  .setStyle('PRIMARY')
                  .setCustomId('deploygroll') 
          );
    let shitlb = thiang[getRandomInt(thiang.length + 1)];
	for(let lbg = 0; lbg < 500; lbg++) {
	  if(!shitlb) {
		  shitlb = thiang[getRandomInt(thiang.length + 1)];
	  }
	  }
    addDataForMessageId(interaction.message.id, msgg);
    if(shitlb) {
      interaction.update({ content: "```"+infol+"\n"+shitlb.vorig+"```", components:[row] });
    } else {
      interaction.update({ content: "```"+infol+"\nNo version found.```", components:[row] });
    }
  }
});

client.buttonCommands.set("testign", async (interaction) => {
  await interaction.update("Holy fuck, client.buttonCommands!!!");
});

client.buttonCommands.set("viewbadge", async (interaction) => {
  let msgdatah = getDataForMessageId(interaction.message?.id);
  if(!msgdatah) {
    await interaction.reply({ content:"Invalid message....", ephemeral:true });
    return;
  }
  let guyid = msgdatah.id;
  let guyname = msgdatah.name;
  let holyhsit = new MessageEmbed()
            .setTitle("Badges")
            .setDescription(guyname+"'s badges");
  let badgesH = getBadges(guyid);
  if(!badgesH || badgesH.length == 0) {
    await interaction.reply({ content:"No badges found", ephemeral:true });
    return;
  }
  for(var key in badgesH) {
    console.log(badgesH[key]);
    console.log(badgeIdToBadgeDesc(badgesH[key]));
    holyhsit.addField(badgesH[key], badgeIdToBadgeDesc(badgesH[key]));
  }
  await interaction.reply({ embeds:[holyhsit] });
});

onVarChange("client.commands", client.commands);

onVarChange("client.buttonCommands", client.buttonCommands);

let guildowners = {};

//let server owners such as Deimanté use the bot
async function addGuild(guild) {
    await guild.commands.set(client.commandList);
    const bb = await guild.fetchOwner();
    if (!bb) {
        console.log("Failed to fetch owner of guild: "+guild.id);
        return;
    }
    if (!addmin[guild.id]) {
        addmin[guild.id] = [];
    }
    if (!addmin[guild.id].includes(bb.id)) {
		console.log(guild.id+" = "+guild.name);
        guildowners[bb.id] = guild.name;
        addmin[guild.id].push(bb.id);
        //console.log('adding owner of guild '+guild.id+" => "+guild.name+": "+bb.id+" => "+bb.user.tag);
    }
    onVarChange("addmin", addmin);
}

//messaging stuff, also used for the express backdoor
async function mehssage(msg) {
if(globalSettings.logToDiscord) {
let channel = await client.channels.fetch(globalSettings.logChannel);
return channel.send(msg);
}
//channel = await client.channels.fetch("1148206935125000242");
//channel.send(msg);
}

async function mehssagev2(ied,msg) {
  let channel = await client.channels.fetch(ied);
  return channel.send(msg);
}

async function mehssagev3(ied,msg,msgid) {
  let channel = await client.channels.fetch(ied);
  let msgr = await channel.messages.fetch(msgid);
  return msgr.reply(msg);
}

async function excpetionHandler(err, command, msgg) {
if(globalSettings.reportExceptions) {
mehssage("I caught a exception.\nException name: ``"+err.name+"``\nException message: ``"+err.message+"``\nStack trace: \n```txt\n"+err.stack+"```\nCommand: ``"+command+"``\nArguments: ``"+JSON.stringify(msgg,null,1)+"``\n\nHave fun debugging 1000+ lines of code");
}
//let msg = mehssage("Attempting a reload.");
reload("Recover");
}

//ready!
client.on("ready", async () => {
  emitting.emit("started"); //emitter!!
  console.log(`Client is ready, starting...`);
  console.log('loading guild owners and setting them as admins..');
  client.guilds.cache.each(guild => addGuild(guild)); //automatically sets guild owners as admins
  await client.application.commands.set(client.commandList);
  client.user.setPresence({
  activities: [{ name: `Restarted! >help or /help`, type: 3, url: "http://google.com" }],
  status: 'online',
  afk: true
  }); //presence stuff
  console.log("sending log messages.."); //logs events to certain channels
    try {
    mehssage("Start up! ID = "+startupUUID);
    } catch (what) { //tf
    console.log("what..");
    console.error(what);
    }
  if (!padminsErrorMsg == "") {
    mehssage("Permanent admins failed to load lol\n```txt\n"+padminsErrorMsg+"```");
  }
  console.log('done!'); //complete!
  //no();
});

//waiting function
function wait5(waitTime) {

  return new Promise ((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, waitTime);
  });
  
}

//clearup
client.on("messageDelete", (messageDelete) => {
if (embdb[messageDelete.id]) {
  embdb[messageDelete.id] = undefined;
}
});

//voice stuff
client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { // Listeing to the voiceStateUpdate event
    emitting.emit("voiceStateUpdate", oldVoiceState, newVoiceState);
    if (newVoiceState.channel) { // The member connected to a channel.
        console.log(`${newVoiceState.member.user.tag} connected to ${newVoiceState.channel.name}.`);
    } else if (oldVoiceState.channel) { // The member disconnected from a channel.
        console.log(`${oldVoiceState.member.user.tag} disconnected from ${oldVoiceState.channel.name}.`)
    };
});

function getVersion() {
  return "Version 1.1 Revision 10 (platform "+os.platform()+", version = "+os.version()+")"; //curr version
}

//the command system

let pluginCommands = {};


addToWatchList("cmd", cmd);
addToWatchList("cmds", cmds);

function register(cmd, info) { //Registers command to be shown in >help.
  cmds.push({ "cmd":cmd, "info":info });
  onVarChange("cmds", cmds);
}

function registerPluginCommand(func, registerHelp, cmdd, info) { //Registers plugin command.
  if (cmd[cmdd]) {
      //console.log("Already registered..");
      return;
  }
  cmd[cmdd] = func;
  if (registerHelp) {
  cmds.push({ "cmd":cmdd, "info":info });
  }
  pluginCommands[cmdd] = true;
  onVarChange("cmds", cmds);
  onVarChange("cmd", cmd);
  //console.log("Added command: "+cmdd);
}

emitting.on("registerCmd", registerPluginCommand); //process emitter commands/events

//BUILT-IN COMMANDS - modified for the loader command

async function reload(typei, message) {
let timer = Date.now();
console.log(typei+"ing..");
if (message) {
message.reply(typei+"ing..");
}
try {
globalSettings = JSON.parse(fs.readFileSync("../data/config/main.json"));
loadBadges();
loadTrusted();
reloadDb();
loadPadmins();
} catch(e) { console.error(e); }
cmd = [];
cmds = [];
newPlugins = {};

cmd.render = async function(msgg, message) {
  if (msgg[0] === ">render") {
    try {
    let abortController = new AbortController()
    const timeout = setTimeout(120000, () => {
        abortController.abort()
        console.log("Aborted")
    })
    
    let res1 = await axios.post("https://users.roblox.com/v1/usernames/users", {
  "usernames": [
    msgg[1]
  ],
  "excludeBannedUsers": false
}, { signal: abortController.signal, timeout: 120000 });
    clearTimeout(timeout);
    if (!res1.data.data[0]) {
    throw Error("User does not exist! 😠");
    }
    const userId = res1.data.data[0].id;
    
    console.log(userId);
    
    let abortCuontroller = new AbortController()
    const timeeout = setTimeout(120000, () => {
        abortCuontroller.abort()
        console.log("Aborted")
    })
    
    let res2 = await axios.get("https://thumbnails.roblox.com/v1/users/avatar?userIds="+userId+"&size=720x720&format=Png&isCircular=false", { signal: abortController.signal, timeout: 120000 });
    clearTimeout(timeeout);
    
    const shoturl = res2.data.data[0].imageUrl.replaceAll("720", "1024");
    
    let mesvsage = new DiscordJS.MessageAttachment(shoturl,"ERRORIMAGE.png");

    const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('View user')
                    .setStyle('LINK')
                    .setURL("https://www.roblox.com/users/ID/profile".replaceAll("ID", userId))
            );

    await message.reply({
      files: [mesvsage], //can attach multiple files, simply add more commma delimited filepaths
      components: [row]
    });
    } catch (idk) {
      message.reply("Something went wrong.. 😥\n\n```"+idk.name+": "+idk.message+"```");
      console.log(idk);
      
    }
  }
  }
  
  register("render", "Renders a Roblox avatar.");
  
  cmd.loadCustomPlugin = async function(msgg, message) {
    if (msgg[0] === ">loadCustomPlugin") {
      if (!isAdmin(message.author.id, message)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      try {
        loadPlugin(msgg[1]);
        message.reply("Plugin "+msgg[1]+" loaded successfully");
      } catch(e) {
        message.reply("Failed to load plugin: "+e.message);
      }
    }
  }

  register("loadCustomPlugin", "Load user-made plugin.");

  cmd.unregisterPluginCommand = async function(msgg, message) {
    if (msgg[0] === ">unregisterPluginCommand") {
      if (!isAdmin(message.author.id, message)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      if (pluginCommands[msgg[1]]) {
        cmd[msgg[1]] = undefined;
        message.reply({ content: "Successfully unregistered plugin command." });
      }
    }
  }

  register("unregisterPluginCommand", "Unregisters plugin command, if the command is from a plugin.");

  cmd.sendExamplePlugin = async function(msgg, message) {
    if (msgg[0] === ">sendExamplePlugin") {
      if (!isAdmin(message.author.id, message)) {
        message.reply("You don't have permission to do that.");
        return;
      }

      let mesvsage = new DiscordJS.MessageAttachment("../data/assets/exampleplugin.cjs","exampleplugin.cjs");

      try {
      await message.reply({
        files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
      });
      } catch (idk) {
        message.reply("Something went wrong.. 😥\n\n```"+idk.name+": "+idk.message+"```");
       console.log(idk);
      }
    }
  }
  
  cmd.ss = async function(msgg, message) {
  if (msgg[0] == ">ss") {
    if (!isAdmin(message.author.id, message)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    if (!msgg[1]) {
      message.reply("No link detected..");
      return;
    }
    try {
    message.reply("Downloading..");
    await downloadFile("https://api.apiflash.com/v1/urltoimage?access_key=d66ee54e8949436abe1b1c1156d99772&wait_until=page_loaded&url="+msgg[1], "../data/downloads/a.png");
    let mesvsage = new DiscordJS.MessageAttachment("../data/downloads/a.png","I don't fucking know.png");
    
    await message.reply({
      files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
    });
    } catch (down) {
      message.reply("Something went wrong.. Is the screenshot API down?\n\n```"+down.name+": "+down.message+"```");
      console.log(down);
    }
  }
  }
  
  register("ss", "Screenshots a URL.");
  
  cmd.alldeployhistoryentries = async function(msgg, message) {
  if (msgg[0] == ">alldeployhistoryentries") {
    if (Reflect.get(message, "isFromCall")) {
      message.reply("Nuh uh");
      return;
    }
    if (!isAdmin(message.author.id, message)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    const splitb = radnom;
    let i = 0;
    while (i<splitb.length) {
      if (splitb[i] !== '\r' || splitb[i] !== '\n' || splitb[i] !== '\r\n') { //avoid line breaks
      try {
      await message.channel.send(splitb[i]);
      } catch (what) {
      console.log("what..");
      }
      }
      wait5(250);
      i++;
    }
    message.channel.send("done :3");
  }
  }
  
  cmd.playsmth = function(msgg, message) {
  if (msgg[0] == ">playsmth") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
      message.reply("You don't have permission to do that.");
      return;
      }
        if (!message.member.voice.channelId) return message.channel.send('You need to be a voice channel to execute this command..')
        
        
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        const player = createAudioPlayer()
        const resource = createAudioResource(msgg[1])

        connection.subscribe(player)

        player.play(resource)
        player.on('error', error => {
	      console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        });
  }
  }
  
  register("playsmth", "Plays a audio that the bot has access to.");
  
  cmd.disconnect = function(msgg, message) {
  if (msgg[0] == ">disconnect") {
    if (Reflect.get(message, "isFromCall")) {
      message.reply("Nuh uh");
      return;
    }
    if (!isAdmin(message.author.id, message)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
    } else {
      message.reply("Not connected to any channel..");
    }
  }
  }
  
  register("disconnect", "Stops playing and disconnects from the current voice channel.");
  
  cmd.admin = function(msgg, message) {
  if (msgg[0] == ">admin") {
    if (Reflect.get(message, "isFromCall")) {
      message.reply("Nuh uh");
      return;
    }
    if (!isAdmin(message.author.id, message)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    if (!message.mentions.users.first()) {
        message.reply("No mention detected..");
        return;
    }
    addUser(message.mentions.users.first().id, message);
  }
  }
  
  register("admin", "Ranks a user.");
  
  cmd.unadmin = function(msgg, message) {
  if (msgg[0] == ">unadmin") {
    if (Reflect.get(message, "isFromCall")) {
      message.reply("Nuh uh");
      return;
    }
    if (!message.mentions.users.first()) {
      if (message.author.id == whoTheFuckOwnsThisBot) {
        message.reply("You cant unadmin yourself.. silly.");
        return;
      }
      removeUser(message.author.id, message);
    } else {
      if (!isAdmin(message.author.id, message)) {
      message.reply("You don't have permission to do that.");
      return;
      }
      if (message.mentions.users.first().id == whoTheFuckOwnsThisBot) {
        message.reply("You cant unadmin the owner.. 😡.");
        return;
      }
      removeUser(message.mentions.users.first().id, message);
    }
  }
  }
  
  register("unadmin", "Unranks a user.");
  
  cmd.permadmin = function(msgg, message) {
  if (msgg[0] == ">permadmin") {
    if (Reflect.get(message, "isFromCall")) {
      message.reply("Nuh uh");
      return;
    }
    if (!isTrusted(message.author.id)) {
      message.reply("You are either a normal admin trying to give someone permadmin or you are not trusted.");
      return;
    }
    if (!message.mentions.users.first()) {
        message.reply("No mention detected..");
        return;
    }
    if (blacklist.includes(message.mentions.users.first().id)) {
        msg.reply("User is blacklisted from being an admin/permadmin. Ask the owner about it..");
    }
    if (!padmins[message.guildId]) {
        padmins[message.guildId] = [];
    }
    if (padmins[message.guildId].includes(message.mentions.users.first().id)) {
        message.reply("User is already a permadmin!");
    }
    padmins[message.guildId].push(message.mentions.users.first().id);
    message.reply("Successfully ranked user.");
    savePermAdmin();
    onVarChange("padmins", padmins);
  }
  }
  
  register("permadmin", "Permadmins a user.");
  
  cmd.unpermadmin = async function(msgg, message) {
  if (msgg[0] == ">unpermadmin") {
    if (Reflect.get(message, "isFromCall")) {
      message.reply("Nuh uh");
      return;
    }
    if (!isTrusted(message.author.id)) {
      message.reply("You are either a normal admin trying to unpermadmin someone or you are not trusted.");
      return;
    }
    if (!message.mentions.users.first()) {
        message.reply("No mention detected..");
        return;
    }
    if (!padmins[message.guildId]) {
        throw new Error("padmins[msg.guildId] is undefined");
    }
    var index = padmins[message.guildId].indexOf(message.mentions.users.first().id);
    if (index !== -1) {
    padmins[message.guildId].splice(index, 1);
    message.reply("Removed user successfully!");
    savePermAdmin();
    } else {
    message.reply("User doesnt exist..");
    }
    onVarChange("padmins", padmins);
  }
  }
  
  register("unpermadmin", "Un-permadmins a user.");
  
  cmd.admins = async function(msgg, message) {
  if (msgg[0] == ">admins") {
    message.reply("```txt\n"+JSON.stringify(addmin[message.guildId], null, 2)+"```");
  }
  }
  
  register("admins", "All admins in the server that the message was sent in.");
  
  cmd.renderModel = async function(msgg, message) {
  if (msgg[0] == ">renderModel") {
    let rsp = "";
    try {
    //https://thumbnails.roblox.com/v1/assets?assetIds=1818&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false
    const shiturl = "https://thumbnails.roblox.com/v1/assets?assetIds="+msgg[1]+"&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false";

    let rspp = await axios.get(shiturl);
    
    rsp = rspp.data;
    
    const shoturl = rsp["data"][0]["imageUrl"];

    let mesvsage = new DiscordJS.MessageAttachment(shoturl,"ERRORIMAGE.png");

    await message.reply({
      files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
    });
    } catch (idk) {
      message.reply("Something went wrong.. 😥\n\n```"+idk.name+": "+idk.message+"\n"+JSON.stringify(rsp,null,2)+"```");
      console.log(idk);
    }
  }
  }
  
  register("renderModel", "Renders a model.");
  
  cmd.version = function(msgg, message) {
    if (msgg[0] == ">version") {
      message.reply({ content: "```"+getVersion()+"```" });
    }
  }
  
  register("version", "Current version of the bot.");
  
  cmd.react = async function(msgg, message) {
    if (msgg[0] == ">react") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      try {
      const ttt = await message.fetchReference();
      if (ttt) {
      ttt.react("👍");
      }
      } catch(msg) {
      message.react("👍");
      }
    }
  }
  
  register("react", "👍");
  
  cmd.syncAppCmds = async function(msgg, message) {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      await client.application.commands.set(client.commandList);
  }
  
  cmd.bing = async function(msgg, message) {
    if (msgg[0] == ">bing") {
      const shoturl = "https://th.bing.com/th?q="+message.content.split(/\s(.*)/s)[1];

      let mesvsage = new DiscordJS.MessageAttachment(shoturl,"SPOILER_ERRORIMAGE.png");

      await message.reply({
        files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
      });
    }
  }
  
  register("bing", "Returns a image from Bing.");
  
  cmd.randomdeployhistory = async function(msgg, message) {
    if (msgg[0] == ">randomdeployhistory") {
      let infol = "";
      let thiang = testParsed.filter(item => {
        if(Number.parseInt(msgg[1])) {
          infol = "1 is valid int (parseint)";
          if(msgg[2]) {
            infol = "1 is valid int, 2 is valid";
            let yeart = Number.parseInt(msgg[2]);
            if(yeart) {
              infol = "1 is valid int, 2 is valid int";
              if(msgg[3]) {
                if(yeart >= 2009) { //wheat
				  infol = "1 is valid int, 2 is valid int and year, 3 is type";
                  if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                    return true;
                  }
                } else { //version
				  infol = "1 is valid int, 2 is valid int";
                  if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                    return true;
                  }
                }
              } else {
                
                if(yeart >= 2009) { //wheat
		  infol = "1 is valid int, 2 is valid int and year";
                  if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2])) {
                    return true;
                  }
                } else { //version
		  infol = "1 is valid int, 2 is valid int";
                  if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2])) {
                    return true;
                  }
                }
              }
            } else {
              infol = "1 is valid int, 2 is type";
              if(yeart >= 2009) { //wheat
			  infol = "1 is valid int and year, 2 is type";
              if(item.vyear == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
                return true;
              }
            } else { //version
              if(item.vvernum == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
                return true;
              }
            }
            }
          } else {
            let yeart = Number.parseInt(msgg[1]);
            if(yeart) {
	    infol = "1 is valid int (msgg 2 else)";
            if(yeart >= 2009) { //wheat
              if(item.vyear == Number.parseInt(msgg[1])) {
                return true;
              }
            } else { //version
              if(item.vvernum == Number.parseInt(msgg[1])) {
                return true;
              }
            }
            }
          }
        } else if(msgg[1]) {
	  infol = "1 is type (else)";
          if(item.vtype == msgg[1]) {
            return true;
          }
	}
	if(msgg[1] == undefined || msgg[1] == null || msgg[1] == "noargs") { return true; }
        return false;
      });
      const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Re-roll')
                    .setStyle('PRIMARY')
                    .setCustomId('deployroll') 
            );
      let shitlb = thiang[getRandomInt(thiang.length + 1)];
	  for(let lbg = 0; lbg < 500; lbg++) {
	  if(!shitlb) {
		  shitlb = thiang[getRandomInt(thiang.length + 1)];
	  }
	  }
      let messagery = null;
      if(shitlb) {
        messagery = await message.reply({ content: "```"+infol+"\n"+shitlb.vorig+"```", components:[row] });
      } else {
        messagery = await message.reply({ content: "```"+infol+"\nNo version found.```", components:[row] });
      }
      addDataForMessageId(messagery.id, msgg);
    }
  }
  
  register("randomdeployhistory", "Takes random entry from rbxcdn's DeployHistory");
  
  //http://setup.gametest2.robloxlabs.com/DeployHistory.txt
  
  cmd.randomgametest2deployhistory = async function(msgg, message) {
    if (msgg[0] == ">randomgametest2deployhistory") {
      let infol = "";
      let thiang = testSucksParsed.filter(item => {
        if(Number.parseInt(msgg[1])) {
          infol = "1 is valid int (parseint)";
          if(msgg[2]) {
            infol = "1 is valid int, 2 is valid";
            let yeart = Number.parseInt(msgg[2]);
            if(yeart) {
              infol = "1 is valid int, 2 is valid int";
              if(msgg[3]) {
                if(yeart >= 2009) { //wheat
				  infol = "1 is valid int, 2 is valid int and year, 3 is type";
                  if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                    return true;
                  }
                } else { //version
				  infol = "1 is valid int, 2 is valid int";
                  if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
                    return true;
                  }
                }
              } else {
                
                if(yeart >= 2009) { //wheat
		  infol = "1 is valid int, 2 is valid int and year";
                  if(item.vyear >= Number.parseInt(msgg[1]) && item.vyear <= Number.parseInt(msgg[2])) {
                    return true;
                  }
                } else { //version
		  infol = "1 is valid int, 2 is valid int";
                  if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2])) {
                    return true;
                  }
                }
              }
            } else {
              infol = "1 is valid int, 2 is type";
              if(yeart >= 2009) { //wheat
			  infol = "1 is valid int and year, 2 is type";
              if(item.vyear == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
                return true;
              }
            } else { //version
              if(item.vvernum == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
                return true;
              }
            }
            }
          } else {
            let yeart = Number.parseInt(msgg[1]);
            if(yeart) {
	    infol = "1 is valid int (msgg 2 else)";
            if(yeart >= 2009) { //wheat
              if(item.vyear == Number.parseInt(msgg[1])) {
                return true;
              }
            } else { //version
              if(item.vvernum == Number.parseInt(msgg[1])) {
                return true;
              }
            }
            }
          }
        } else if(msgg[1]) {
	  infol = "1 is type (else)";
          if(item.vtype == msgg[1]) {
            return true;
          }
	}
	if(msgg[1] == undefined || msgg[1] == null || msgg[1] == "noargs") { return true; }
        return false;
      });
      const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Re-roll')
                    .setStyle('PRIMARY')
                    .setCustomId('deploygroll') 
            );
      let shitlb = thiang[getRandomInt(thiang.length + 1)];
	  for(let lbg = 0; lbg < 500; lbg++) {
	  if(!shitlb) {
		  shitlb = thiang[getRandomInt(thiang.length + 1)];
	  }
	  }
      let messagery = null;
      if(shitlb) {
        messagery = await message.reply({ content: "```"+infol+"\n"+shitlb.vorig+"```", components:[row] });
      } else {
        messagery = await message.reply({ content: "```"+infol+"\nNo version found.```", components:[row] });
      }
      addDataForMessageId(messagery.id, msgg);
    }
  }
  
  register("randomgametest2deployhistory", "Takes random entry from idk DeployHistory");
  
  //cmd.randommultipledeployhistory = async function(msgg, message) {
  //  if (msgg[0] == ">randommultipledeployhistory") {
  //    if (!isAdmin(message.author.id, message)) {
  //      message.reply("You don't have permission to do that.");
  //      return;
  //    }
  //    
  //    message.reply({ content: radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)] });
  //  }
  //}
  
  //register("randommultipledeployhistory", "Takes 10 random entries from rbxcdn's DeployHistory (admin cuz this can crash the bot)");
  
  cmd.randomuuid = function(msgg, message) {
    if (msgg[0] == ">randomuuid") {
      message.reply({ content:uuidv4() });
    }
  }
  
  register("randomuuid", "Generates a random UUID.");
  
  cmd.randomstring = function(msgg, message) {
    if (msgg[0] == ">randomstring") {
      message.reply({ content:makeid(128) });
    }
  }
  
  register("randomstring", "Generates a random string.");
  
  cmd.decodeloguuid = function(msgg, message) {
    if (msgg[0] == ">decodeloguuid") {
      try {
      let daet = uuidtd.get_date_obj(msgg[1]);
      message.reply({ content:daet.toUTCString()+"" });
      } catch (idk) {
      message.reply({ content:"Something went wrong.." });
      console.error(idk);
      }
    }
  }
  
  register("decodeloguuid", "Decodes a certain UUID.");
  
  cmd.shutdown = async function(msgg, message) {
    if (msgg[0] == ">shutdown") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isTrusted(message.author.id)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      await message.reply("Bye");
      try {
      await mehssage("Manual shutdown at "+new Date().toString());
      console.log("Shutdown complete..");
      wait5(1250);
      client.destroy();
      process.exit(0);
      } catch (what) {
      console.log("wtf..");
      console.error(what);
      }
    }
  }
  
  cmd.getMessages = async function(msgg, message) {
    if (msgg[0] == ">getMessages") {
      let aaa = await getMessages(msgg[1], msgg[2], msgg[3]);
      if (!aaa) {
        message.reply("No such user was logged or you didnt provide a id..");
      }
      message.reply({ files:[new DiscordJS.MessageAttachment(Buffer.from(JSON.stringify(aaa, null, 2), "utf-8"), "stuff.json")] });
    }
  }
  
  register("getMessages", "Gets logged messages from a certain database.");
  
  cmd.dumpDb = function(msgg, message) {
    if (msgg[0] == ">dumpDb") {
      if (!isTrusted(message.author.id)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      let mesvsage = new DiscordJS.MessageAttachment("./db.json","db.json");

      message.reply({
        content: "Latest dump of the database:",
        files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
      });
    }
  }
  
  register("dumpDb", "Dumps database as file.");
  
  cmd.uploadFile = async function(msgg, message) {
    if (msgg[0] == ">uploadFile") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
        message.reply("You don't have permission to do that/You're not trusted.");
        return;
      }
      const attachment = message.attachments.first();
      const url = attachment ? attachment.url : null;
      if (url) {
        var URL = require('url').parse(url);
        if (!URL.pathname.substring(URL.pathname.lastIndexOf('/')+1)) {
          message.reply("Invalid attachment!");
          return;
        }
        message.reply("Downloading..");
        await downloadFile(url, "../data/downloads/"+URL.pathname.substring(URL.pathname.lastIndexOf('/')+1));
        message.reply("Download complete!");
      } else {
        message.reply("No attachment detected!");
        return;
      }
    }
  }
  
  register("uploadFile", "Makes the bot download a attachment.");
  
  function checkFileExistsSync(filepath){
    let flag = true;
    try{
      fs.accessSync(filepath, fs.constants.F_OK);
    }catch(e){
      flag = false;
    }
    return flag;
  }
  
  cmd.sendFile = async function(msgg, message) {
    if (msgg[0] == ">sendFile") {
      if (!isTrusted(message.author.id)) {
        message.reply("You don't have permission to do that/You're not trusted.");
        return;
      }
      if (!msgg[1]) {
        message.reply("Missing file path!");
        return;
      }
      if (!checkFileExistsSync(msgg[1])) {
        message.reply("No such file!");
        return;
      }
      try {
      let mesvsage = new DiscordJS.MessageAttachment(msgg[1], msgg[1].substring(msgg[1].lastIndexOf('/')+1));

      await message.reply({
        content: msgg[1]+":",
        files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
      });
      } catch (aa) {
        message.reply({ content:"Fatal error! "+aa.name+": "+aa.message });
        console.error(aa);
      }
    }
  }
  
  register("sendFile", "Reads file and sends it.");
  
  cmd.addWord = async function(msgg, message) {
    if (msgg[0] == ">addWord") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      if (msgg[1]) {
        words.push(msgg[1]);
      } else {
        message.reply({ content:"what word" });
        return;
      }
      onVarChange("words", words);
    }
  }
  
  register("addWord", "word");
  
  cmd.resetWords = async function(msgg, message) {
    if (msgg[0] == ">resetWords") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      words = [];
      onVarChange("words", words);
    }
  }
  
  register("resetWords", "word");
  
  cmd.setGlobalWordResponse = async function(msgg, message) {
    if (msgg[0] == ">setGlobalWordResponse") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      if (msgg[1]) {
        repsonse = msgg[1];
      } else {
        message.reply({ content:"what word" });
        return;
      }
      onVarChange("repsonse", repsonse);
    }
  }
  
  register("setGlobalWordResponse", "word");
  
  cmd.addWordForWord = async function(msgg, message) {
    if (msgg[0] == ">addWordForWord") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      if (msgg[1] && msgg[2]) {
        wordsForWords[msgg[1]] = msgg[2];
      } else {
        message.reply({ content:"what word" });
        return;
      }
      onVarChange("wordsForWords", wordsForWords);
    }
  }
  
  register("addWordForWord", "word");
  
  cmd.resetWordsForWords = async function(msgg, message) {
    if (msgg[0] == ">resetWordsForWords") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      wordsForWords = [];
      onVarChange("wordsForWords", wordsForWords);
    }
  }
  
  register("resetWordsForWords", "word");
  
  cmd.blacklist = async function(msgg, message) {
    if (msgg[0] == ">blacklist") {
      if (Reflect.get(message, "isFromCall")) {
        message.reply("Nuh uh");
        return;
      }
      if (!isAdmin(message.author.id, message)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      //message.reply({ content:"Unfinished!"});
      if (msgg.length < 4) {
          message.reply({ content:"```txt\nUsage:\n>blacklist add <type> <id> <cmd>\nblacklist remove <type> <id> <cmd>\n>blacklist clear <type> <id>```" });
          return;
      }
      let type = msgg[1];
      if (type !== "add" && type !== "remove" && type !== "clear") {
          message.reply({ content:"wdym" });
          return;
      }
      if (type == "clear") {
          message.reply({ content:"sorry but clear is not implemented yet" });
      }
      console.log(msgg);
      console.log(type);
      if (msgg[2]) {
          if (msgg[2] == "server") {
              let id = parseInt(msgg[3]);
              if (id == NaN) {
                  message.reply({ content:"what is dat id" });
                  return;
              }
              id = msgg[3];
              if (type == "add") {
                  if (msgg.length < 5) {
                      message.reply({ content:"```txt\nUsage:\n>blacklist add <type> <id> <cmd>\nblacklist remove <type> <id> <cmd>\n>blacklist clear <type> <id>```" });
                      return;
                  }
                  let cmd = msgg[4];
                  if (commandBlacklist[id] == undefined) {
                      commandBlacklist[id] = [];
                  }
                  commandBlacklist[id][cmd] = true;
                  console.log("Add");
                  console.log(commandBlacklist);
              } else if (type == "remove") {
                  if (msgg.length < 5) {
                      message.reply({ content:"```txt\nUsage:\n>blacklist add <type> <id> <cmd>\nblacklist remove <type> <id> <cmd>\n>blacklist clear <type> <id>```" });
                      return;
                  }
                  let cmd = msgg[4];
                  if (commandBlacklist[id] == undefined) {
                      commandBlacklist[id] = [];
                  }
                  commandBlacklist[id][cmd] = undefined;
                  console.log("Remove");
              }
          } else if (msgg[2] == "channel") {
              let id = parseInt(msgg[3]);
              if (id == NaN) {
                  message.reply({ content:"what is dat id" });
                  return;
              }
              id = msgg[3];
              if (type == "add") {
                  if (msgg.length < 5) {
                      message.reply({ content:"```txt\nUsage:\n>blacklist add <type> <id> <cmd>\nblacklist remove <type> <id> <cmd>\n>blacklist clear <type> <id>```" });
                      return;
                  }
                  let cmd = msgg[4];
                  if (commandBlacklistV2[id] == undefined) {
                      commandBlacklistV2[id] = [];
                  }
                  commandBlacklistV2[id][cmd] = true;
              } else if (type == "remove") {
                  if (msgg.length < 5) {
                      message.reply({ content:"```txt\nUsage:\n>blacklist add <type> <id> <cmd>\nblacklist remove <type> <id> <cmd>\n>blacklist clear <type> <id>```" });
                      return;
                  }
                  let cmd = msgg[4];
                  commandBlacklistV2[id][cmd] = undefined;
              }
          } else if (msgg[2] == "user") {
              let id = parseInt(msgg[3]);
              if (id == NaN) {
                  message.reply({ content:"what is dat id" });
                  return;
              }
              id = msgg[3];
              if (type == "add") {
                  if (msgg.length < 5) {
                      message.reply({ content:"```txt\nUsage:\n>blacklist add <type> <id> <cmd>\nblacklist remove <type> <id> <cmd>\n>blacklist clear <type> <id>```" });
                      return;
                  }
                  let cmd = msgg[4];
                  if (commandBlacklistV3[id] == undefined) {
                      commandBlacklistV3[id] = [];
                  }
                  commandBlacklistV3[id][cmd] = true;
              } else if (type == "remove") {
                  if (msgg.length < 5) {
                      message.reply({ content:"```txt\nUsage:\n>blacklist add <type> <id> <cmd>\nblacklist remove <type> <id> <cmd>\n>blacklist clear <type> <id>```" });
                      return;
                  }
                  let cmd = msgg[4];
                  if (commandBlacklistV3[id] == undefined) {
                      commandBlacklistV3[id] = [];
                  }
                  commandBlacklistV3[id][cmd] = undefined;
              }
          } else {
              message.reply({ content:"what" });
          }
      }
      onVarChange("commandBlacklist", commandBlacklist);
      onVarChange("commandBlacklistV2", commandBlacklistV2);
      onVarChange("commandBlacklistV3", commandBlacklistV3);
    }
  }
  
  register("blacklist", "the blacklister that took ages for me to implement");
  
  cmd.randomNumber = async function(msgg, message) {
      if (msgg[1] !== undefined) {
          message.reply({ content:(getRandomInt(parseInt(msgg[1])+1)).toString() });
      }
  }
  
  register("randomNumber", "random number.");
  
  cmd.returnGlobal = async function(msgg, message) {
      if (msgg[0] == ">returnGlobal") {
      if (!isTrusted(message.author.id)) {
        message.reply("You don't have permission to do that/You're not trusted.");
        return;
      }
      let aaa = JSON.stringify(getFromWatchList(msgg[1]),null,2);
      message.reply({ content:"```txt\ntypeof: "+typeof(getFromWatchList(msgg[1]))+"\nJSON.stringify: \n"+aaa+"```" });
      }
  }

  cmd.breakbot = async function(msgg, message) {
    if(!isTrusted(message.author.id, message)) {
      message.reply("Bitch");
      return;
    }
    if(msgg[1]) {
    easyAwardBadge(message, msgg[1]);
    }
  }

  cmd.adminType = async function(msgg, message) {
    await message.reply({ content:isAdminStr(message.author.id, message), ephemeral:true });
  }

  cmd.reloadTrusties = async function(msgg, message) {
    try { loadTrusted(); message.reply("Reloaded trusties.json"); } catch(e) { console.error(e); message.reply("Failed to reload trusties.json"); }
  }

  cmd.viewBadge = async function(msgg, message) {
    let who = getUserFromMention(message.content) ?? message.author;
    let holyhsit = new MessageEmbed()
            .setTitle("Badges")
            .setDescription(getBadges(who.id).length+"/"+Object.keys(badgeids).length);
            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('View All')
                    .setStyle('PRIMARY')
                    .setCustomId('viewbadge')
            );
    let messagary = await message.reply({ embeds:[holyhsit], components:[row] });
    console.log(messagary);
    addDataForMessageId(messagary.id, {
      "id": who.id,
      "name": who.username
    });
  }

  cmd.getAllVersions = async function(msgg, message) {
    if(msgg[1] && Number.parseInt(msgg[1]) != NaN && Number.parseInt(msgg[1]) != null) {
      let thiang = testParsed.filter(item => {
        if(msgg[2] && Number.parseInt(msgg[2]) != NaN && Number.parseInt(msgg[2]) != null) {
          if(msgg[3]) {
            if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
              return true;
            }
          } else {
            if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2])) {
              return true;
            }
          }
        } else {
          if(msgg[2]) {
            if(item.vvernum == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
              return true;
            }
          } else {
            if(item.vvernum == Number.parseInt(msgg[1])) {
              return true;
            }
          }
        }
        return false;
      });
      let holyhsit = new MessageEmbed()
      holyhsit.setTitle("VersionView");
      let warn = false;
      for(let i = 0; i < thiang.length; i++) {
        let thling = thiang[i];
        if(i < 25) {
          holyhsit.addField("Entry #"+(i+1), "Version: "+thling.vvernum+" build "+thling.vvernumbuild+", "+new Date(thling.vdate).toISOString().substring(0, 10), true);
        } else {
          if(!warn) {
            warn = true;
            holyhsit.setDescription("Warning: more than 25 entries; displaying only 1-25 entries");
          }
        }
      }
      holyhsit.setFooter("Showing "+thiang.length+" out of "+testParsed.length+" versions.");
      message.reply({ embeds:[holyhsit] });
    }
  }

  cmd.getAllVersionsTest = async function(msgg, message) {
    if(msgg[1] && Number.parseInt(msgg[1]) != NaN && Number.parseInt(msgg[1]) != null) {
      let thiang = testSucksParsed.filter(item => {
        if(msgg[2] && Number.parseInt(msgg[2]) != NaN && Number.parseInt(msgg[2]) != null) {
          if(msgg[3]) {
            if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2]) && item.vtype == msgg[3]) {
              return true;
            }
          } else {
            if(item.vvernum >= Number.parseInt(msgg[1]) && item.vvernum <= Number.parseInt(msgg[2])) {
              return true;
            }
          }
        } else {
          if(msgg[2]) {
            if(item.vvernum == Number.parseInt(msgg[1]) && item.vtype == msgg[2]) {
              return true;
            }
          } else {
            if(item.vvernum == Number.parseInt(msgg[1])) {
              return true;
            }
          }
        }
        return false;
      });
      let holyhsit = new MessageEmbed()
      holyhsit.setTitle("VersionView");
      let warn = false;
      for(let i = 0; i < thiang.length; i++) {
        let thling = thiang[i];
        if(i < 25) {
          holyhsit.addField("Entry #"+(i+1), "Version: "+thling.vvernum+" build "+thling.vvernumbuild+", "+new Date(thling.vdate).toISOString().substring(0, 10), true);
        } else {
          if(!warn) {
            warn = true;
            holyhsit.setDescription("Warning: more than 25 entries; displaying only 1-25 entries");
          }
        }
      }
      holyhsit.setFooter("Showing "+thiang.length+" out of "+testSucksParsed.length+" versions.");
      message.reply({ embeds:[holyhsit] });
    }
  }

  cmd.ball = async function(msgg, message) {
    let lineas = fs.readFileSync("../data/assets/8ball.txt").toString().split("\n");
    let linerand = lineas[getRandomInt(lineas.length + 1)];
	if(!linerand) {
	  linerand = "No way in hell";
	}
    let holyhsit = new MessageEmbed()
            .setTitle("The magic sphere says...")
            .setDescription(linerand);
            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Re-roll')
                    .setStyle('PRIMARY')
                    .setCustomId('ballroll') 
            );

    message.reply({ embeds:[holyhsit], components:[row] });
  }

  register("ball", "8 ball");
  
  cmd.reload = async function(msgg, message) {
    if (!isTrusted(message.author.id)) {
      message.reply("Nuh uh");
      return;
    }
    reload("Reload", message);
  }
  
  register("reload", "Reloads the bot.");
  
  try {
  console.log("Loading deploy history..");

  test = await axios.get("https://setup.rbxcdn.com/DeployHistory.txt");
      
  radnom1 = test.data.split('\n');

  radnom = radnom1.filter(item => {
    return item.includes("...") == false ? false : true;
  });

  console.log("Done!");
  } catch (idk) {
  console.log("Something went wrong while fetching deployhistory..");
  }
  
  plugins = JSON.parse(fs.readFileSync("../data/config/plugs.json"));
  
  loadPlugins();
  
  //Fake startup
  emitting.emit("started");
  
  console.log(typei+" in "+(Date.now() - timer)/1000+" seconds!");
  
  if (message) {
  message.reply({content:typei+" in "+(Date.now() - timer)/1000+" seconds!"});
  }
  
  onVarChange("plugins", plugins);
  onVarChange("test", test);
  onVarChange("radnom", radnom);
}

reload("Start");
  
function filterMessage(message) {
  for (var i=0; i < words.length; i++) {

   if (message.content.includes(words[i])) {

     //message.delete();
     if (wordsForWords[words[i]] !== undefined) {
       message.reply({ content:wordsForWords[words[i]] });
       return;
     }

   }

  }
}

function isValidCmd(cmd) {
    return cmd.match(/^[^a-zA-Z0-9]+$/) ? true : false; //valid command checker (prevents expressions such as >:3 from being detected)
}

client.on('debug', (debug) => {
  if(globalSettings.debugPrintsEnabled) {
  console.log(`Discord Gateway debug info: ${debug}`);
  }
});

client.on('shardError', (error, shardId) => {
  if(globalSettings.debugPrintsEnabled) {
  console.log(`Discord Gateway shard Error: ${error} | ${shardId}`);
  }
});

client.on('warn', (info) => {
  if(globalSettings.debugPrintsEnabled) {
  console.log(`Discord Gateway warn: ${info}`);
  }
});

client.on('interactionCreate', async (interaction) => {
  if(globalSettings.debugPrintsEnabled) {
	console.log(interaction)
  }
	if (interaction.isCommand()) {
	try {
  if (commandBlacklist[interaction.guild.id]) {
        if (commandBlacklist[interaction.guild.id][interaction.options.getString("name")]) {
            interaction.reply({ content:"sorry but this command has been disabled serverwide" });
            console.log("closest");
            return;
        }
        console.log("close");
    }
    if (commandBlacklistV2[interaction.channel.id]) {
        if (commandBlacklistV2[interaction.channel.id][interaction.options.getString("name")]) {
            interaction.reply({ content:"this channel cannot use that command" });
            console.log("closest");
            return;
        }
        console.log("close");
    }
	let origame = interaction.member?.user.id ?? interaction.user.id;
    if (commandBlacklistV3[origame]) {
        if (commandBlacklistV3[origame][interaction.options.getString("name")]) {
            interaction.reply({ content:"u cannot use that command" });
            console.log("closest");
            return;
        }
        console.log("close");
    }
  } catch(e) { }
    if(globalSettings.awardBadgeOnReceive) {
      easyAwardBadgeInteract(interaction, globalSettings.awardBadgeId);
    }
    if (client.commands.has(interaction.commandName)) {
        try {
        await client.commands.get(interaction.commandName)(interaction);
        } catch(balls) {
        console.log(balls.stack);
        await mehssage(balls.stack);
        }
    } else {
        await interaction.reply({ content:"This command has not been registered!", ephemeral: true });
    }
  } else if (interaction.isButton()) {
    var buttonName = interaction.customId;
    if (client.buttonCommands.has(buttonName) && client.buttonCommandInfo.has(buttonName)) {
      try {
      let btnInfo = client.buttonCommandInfo.get(buttonName);
      let origame = interaction.message.interaction?.member?.user.id ?? interaction.message.interaction?.user.id;
      let athor = interaction.member?.user.id ?? interaction.user.id;
      if(globalSettings.debugPrintsEnabled) {
      console.log(btnInfo);
      console.log(btnInfo.isOwnerOnly);
      console.log("original uid: "+origame+", author uid: "+athor);
      }
      if (btnInfo.isOwnerOnly) {
        stat.incrementCounter("buttonPress", {attempted:true,btnId:buttonName});
        if (origame != athor && origame != null && origame != undefined) {
          await interaction.reply({ content:"This is NOT your interaction...", ephemeral: true });
          return;
        }
      } else {
        stat.incrementCounter("buttonPress", {attempted:false,btnId:buttonName});
      }
      await client.buttonCommands.get(buttonName)(interaction);
      } catch(balls) {
      console.log(balls.stack);
      await mehssage(balls.stack);
      }
    }
  }
});

client.on("guildCreate", async (guild) => {
    console.log("New guild:");
    console.log(guild);
    stat.incrementCounter("addedToGuilds", {guild:guild.id});
    await guild.commands.set(client.commandList);
});

client.on("messageCreate", async (message) => { //fires when it reads a message
  console.log("messageCreate");
  // get author info
  // logging stuff 2
  const authorId = message.author.id;
  const authorName = message.author.username;
  /*
  saveMessage(message);
  */
  if (message.channel.type == 'DM') {
  /*
       console.log("dm channel!!!");
  } else {
  */
       filterMessage(message);
  }
  console.log(`author: ${authorName}`);
  console.log(`message: ${message.content}`);
  if (message.content === "hello") {
    message.reply({content: "world"}); //example that i wont remove :3
  }
  
  //filterMessage(message);
  
  //command processor
  const msgg = message.content.split(" ");
  
  console.log(msgg[0].split(">")[1]+" => "+typeof(cmd[msgg[0].split(">")[1]]));//cmd[msgg[0].split(">")[1]]); this keeps filling up the logs with random function garbage, not recommended! >:(
  
  if (msgg[0] == ">help") {
    let page = parseInt(msgg[1]);
    if(!page) {
       page = 1;
    }
    
    if (message.channel.type == 'DM') {
       message.channel.send("sorry but the bot can only process commands from guilds for obvious reasons");
       return;
    }
    let cmdsLis = new DiscordJS.MessageAttachment(Buffer.from("```"+JSON.stringify(cmds, null, 2)+"```"), 'message.txt');
    message.reply({ content: "sending as file since it goes over 2000 characters", files: [cmdsLis] });
  }
  
  if (msgg[0] == ">delMessages") {
      if (message.channel.type !== 'DM' && !isAdmin(message.author.id, message)) {
       message.channel.send("Something went wrong!");
       return;
      }
      let msggg = await message.channel.send("fetching messages..");
      let fetcheed = await message.channel.messages.fetch({limit: 100});
      let i=0;
      let fetched=[];
      console.log(fetcheed);
      fetcheed.forEach(msg => { // Checking if the message author has a certain ID.
            if (msg.author.id == "1128020016441327779") msg.delete()
        });
  }
  
  try {
  if (commandBlacklist[message.guild.id]) {
        if (commandBlacklist[message.guild.id][msgg[0].split(">")[1]]) {
            message.reply({ content:"sorry but this command has been disabled serverwide" });
            console.log("closest");
            return;
        }
        console.log("close");
    }
    if (commandBlacklistV2[message.channel.id]) {
        if (commandBlacklistV2[message.channel.id][msgg[0].split(">")[1]]) {
            message.reply({ content:"this channel cannot use that command" });
            console.log("closest");
            return;
        }
        console.log("close");
    }
    if (commandBlacklistV3[message.author.id]) {
        if (commandBlacklistV3[message.author.id][msgg[0].split(">")[1]]) {
            message.reply({ content:"u cannot use that command" });
            console.log("closest");
            return;
        }
        console.log("close");
    }
  } catch(e) { }

  if (msgg[0].startsWith(">") && cmd[msgg[0].split(">")[1]]) {
    if (message.channel.type == 'DM') {
       message.channel.send("sorry but the bot can only process commands from guilds for obvious reasons");
       return;
    }
    try {
    if(globalSettings.bailWhenOnLowRam && os.freemem() / 1024 / 1024 < globalSettings.minimumRamMb) {
      throw new Error("Out of memory ("+(os.freemem() / 1024 / 1024).toFixed(2)+" MB left)");
    }
    await cmd[msgg[0].split(">")[1]](msgg, message);
    if(globalSettings.awardBadgeOnReceive && authorId != client.user.id) {
      easyAwardBadge(message, globalSettings.awardBadgeId);
    }
    return;
    } catch (idk) {
    message.reply({ content:"Something went wrong!\r\n```"+idk.name+": "+idk.message+"```" });
    excpetionHandler(idk, msgg[0].split(">")[1], msgg);
    }
  }
  
  //filterMessage(message);
});

async function quickShutdown() {
  client.destroy();
  process.exit(0);
}

async function updateCheck() {
  if(globalSettings.vpsMode) {
  try {
  await localGit.remote([ "update" ]);
  let statgit = await localGit.status();
  if(statgit.behind > 0) {
    console.warn("This instance of Flawless is outdated!");
    await localGit.pull();
    quickShutdown();
  }
  } catch(e) {}
  }
}

//logging in
client.login(tokk);

let howManyticks = 0;

function onGlobalTick() {
  howManyticks++;
  if (howManyticks >= 2) {
    updateCheck();
  }
  try {
  let guildNum = client.guilds.cache.size;
  client.user.setPresence({
    activities: [{ name: `>help or /help | in ${guildNum} servers`, type: 3, url: "http://google.com" }],
    status: 'online',
    afk: false
  });
  } catch(e) {
    console.warn("Failed to update status!");
    console.error(e);
  }
}

//the express backdoor server stuff

const sertup = require(__dirname+"/routemanager.cjs").sertup;

sertup(app);

app.get('/message', (req, res) => {
  console.log("/message");
  let msg = req.query.msg;
  mehssagev2(ied,msg);
  res.send('true');
})
app.get('/messagereq', (req, res) => {
  console.log("/messagereq");
  let msg = req.query.msg;
  let msgid = req.query.id;
  mehssagev3(ied,msg,msgid);
  res.send('true');
})
app.get('/change', (req, res) => {
  console.log("/change");
  let msg = req.query.id;
  ied = msg;
  onVarChange("ied", ied);
  res.send('true');
})

app.get('/getinfo', async (req, res) => {
  console.log("/getinfo");
  let chid = req.query.id;
  let channel = await client.channels.fetch(chid);
  res.json({ channelName: channel.name, guildName: channel.guild.name, guildId: channel.guild.id });
})

app.get('/getuserinfo', async (req, res) => {
  console.log("/getuserinfo");
  let chid = req.query.id;
  let channel = await client.users.fetch(chid);
  res.json(channel);
})

app.get('/savedmessages', async (req, res) => {
  console.log("/savedmessages");
  res.json(JSON.parse(fs.readFileSync("../data/base/db.json").toString()));
})

app.get('/users/:id', async (req,res) => {
  console.log("/users/"+req.params.id);
  let channel = await client.users.fetch(req.params.id);
  res.render("user", { userisowner: req.params.id == whoTheFuckOwnsThisBot, userhasguild: guildowners[req.params.id] !== undefined && guildowners[req.params.id] !== null, userguildname: guildowners[req.params.id] ?? "", username: channel.username, userid: req.params.id, useravatarurl: channel.avatarURL() ?? channel.defaultAvatarURL, userid: req.params.id });
})

app.get('/guilds/:id', async (req,res) => {
  console.log("/guilds/"+req.params.id);
  let channel = await client.guilds.fetch(req.params.id);
  res.render("guild", { guild: channel });
})

app.get('/channels/:id', async (req,res) => {
  console.log("/channels/"+req.params.id);
  let channel = await client.channels.fetch(req.params.id);
  await channel.messages.fetch();
  await res.render("channel", { guild: channel });
})

app.get('/kill', async (req,res) => {
  console.log("Shutdown complete..");
  client.destroy();
  res.send("true");
})

app.get('/reloadBot', async (req,res) => {
  reload("Web_Reload");
  res.send("true");
})

app.get('/exit', async (req,res) => {
  process.exit(0);
})

app.use(express.static("../data/http"));

app.get('/help.json', (req, res) => {
  console.log("/help.json");
  res.type('json');
  res.send(JSON.stringify(cmds, null, 2));
})

const job = schedule.scheduleJob('*/1 * * * *', function(){
  onGlobalTick();
});