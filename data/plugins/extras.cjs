let emitter = undefined;
let discordjs = undefined;
let axios = undefined;
let settings = {};

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

let verifiedBase64 = {};

function onMessage(msgg, message) {
    if (msgg[0] == ">pluginTest") {
        message.reply({ content:"Hi my name is flawless and i was written in discord.js v13!" });
    }
}

async function onCat(msgg, message) {
try {
const test = await axios.get("https://api.thecatapi.com/v1/images/search?has_breeds=true&mime_types=jpg,png&size=small&sub_id="+message.author.id+"&limit=1", {headers:{'X-API-KEY': settings.catKey}});
console.log(test.data);
const image = test.data[0];

await message.reply({
content: "***"+"cat"+"***",
files: [image.url]
});
} catch(idk) {
console.log(idk);
message.reply({ content:"Something went wrong! \r "+idk.name});
}
}

async function onHttpCat(msgg, message) {
try {
if (!msgg[1]) {
msgg[1] = "404";
}
await message.reply({
content: "*"+"HttpCat"+"*",
files: ["http://http.cat/"+msgg[1]+".jpg"]
});
} catch(idk) {
console.log(idk);
message.reply({ content:"Something went wrong! \r "+idk.name});
}
}

async function onBase64Dec(msgg, message) {
  try {
  if(!verifiedBase64[message.content.split(/\s(.*)/s)[1]]) {
    await message.reply("Not trusted");
  }
  let attach = new discordjs.MessageAttachment(Buffer.from(message.content.split(/\s(.*)/s)[1], "base64"),"I don't fucking know.png");
  await message.reply({
  files: [attach]
  });
  } catch(idk) {
  console.log(idk);
  message.reply({ content:"Something went wrong! \r "+idk.name});
  }
  }


function init(emitter1, discardr, axi) {
    //console.log("Plugin initialized!");
    emitter = emitter1;
    discordjs = discardr;
    axios = axi;
    emitter.on("started", () => {
        //console.log("Plugin detected start!");
        emitter.emit("registerCmd", onMessage, true, "pluginTest", "Example plugin test.");
        emitter.emit("registerCmd", onBase64Dec, true, "b64dec", "Bass64");
        emitter.emit("registerCmd", onCat, true, "cat", "Cat API");
        emitter.emit("registerCmd", onHttpCat, true, "httpCat", "Http Cat API");
    });
    emitter.on("settings", (shit) => {
        settings = shit;
    });
}

exports.init = init;