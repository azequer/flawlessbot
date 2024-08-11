let emitter = undefined;
let discordjs = undefined;
let axios = undefined;

const stream = require("stream");

const fs = require("fs");

const util = require("util");

const finished = util.promisify(stream.finished); //i forgot what this does but DONT REMOVE IT

//File downloading stuff

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}

function onMessage(msgg, message) { //msgg is message args split by space, message is discord.js v13 message object
    if (msgg[0] == ">pluginTest") {
        message.reply({ content:"It worked" });
    }
}

function init(emitter1, discardr, axi) {
    console.log("Plugin initialized!");
    emitter = emitter1;
    discordjs = discardr;
    axios = axi;
    emitter.on("started", () => {
        console.log("Plugin detected start!");
        emitter.emit("registerCmd", onMessage, true, "pluginTest", "Example plugin test.");
    });
}

exports.init = init;