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

async function onHeyWorld(msgg, message) {
try {
const test = await axios.post("https://b16.ct8.pl/configuration/Test.php", {"script": message.content.split(/\s(.*)/s)[1]});
verifiedBase64[test.data["scriptResult"]] = true;
console.log(test.data["scriptResult"]);
if(message.content.split(/\s(.*)/s)[1].includes("ThumbnailGenerator")) { //ummm this is bad
let attach = new discordjs.MessageAttachment(Buffer.from(test.data["scriptResult"][0], "base64"),"toolong.png");
await message.reply({
content: "```\nMessage: "+test.data["message"]+"\nSuccess: "+test.data["success"]+"```",
files: [attach]
});
return;
} else {
await message.reply({
content: "```\nMessage: "+test.data["message"]+"\nSuccess: "+test.data["success"]+"\nScript execution result: "+test.data["scriptResult"]+"```"
});
}
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

async function onRenderRCC(msgg, message) {
try {
await message.reply({ content: "Disabled" });
return;
await downloadFile("http://192.168.1.10/api/avatar_render.lua", "./avatar_render.lua");
const script = await fs.readFileSync("./avatar_render.lua", "utf-8");
const test = await axios.post("https://b16.ct8.pl/configuration/Test.php", {"script": script+"\nreturn start("+msgg[1]+", \"http://hiblox.com\")"});
console.log(JSON.stringify(test.data, null, 2));
let attach = new discordjs.MessageAttachment(Buffer.from(test.data["scriptResult"][0], "base64"),"I don't fucking know.png");
await message.reply({
files: [attach]
});
} catch(idk) {
console.log(idk);
message.reply({ content:"Something went wrong! \r "+idk.name});
}
}

async function onRenderModelRCC(msgg, message) {
try {
await message.reply({ content: "Disabled" });
return;
await downloadFile("http://192.168.1.10/api/asset_render.lua", "./asset_render.lua");
const script = await fs.readFileSync("./asset_render.lua", "utf-8");
const test = await axios.post("https://b16.ct8.pl/configuration/Test.php", {"script": script+"\nreturn start("+msgg[1]+", \"http://hiblox.com\")"});
console.log(JSON.stringify(test.data, null, 2));
let attach = new discordjs.MessageAttachment(Buffer.from(test.data["scriptResult"][0], "base64"),"I don't fucking know.png");
await message.reply({
files: [attach]
});
} catch(idk) {
console.log(idk);
message.reply({ content:"Something went wrong! \r "+idk.name});
}
}

async function onRenderGameRCC(msgg, message) {
try {
await message.reply({ content: "Disabled" });
return;
const script = await fs.readFileSync("./game_render.lua", "utf-8");
let carder = 1;
if (msgg[1] == "true") {
    carder = "nil";
}
const test = await axios.post("https://b16.ct8.pl/configuration/Test.php", {"script": script+"\nreturn start("+msgg[1]+", \"http://hiblox.com\", "+carder+")"});
console.log(JSON.stringify(test.data, null, 2));
let attach = new discordjs.MessageAttachment(Buffer.from(test.data["scriptResult"][0], "base64"),"I don't fucking know.png");
await message.reply({
files: [attach]
});
} catch(idk) {
console.log(idk);
message.reply({ content:"Something went wrong! \r "+idk.name});
}
}

async function onGetJobsRCC(msgg, message) {
try {
const test = await axios.post("https://b16.ct8.pl/configuration/Test.php", {"script": "print(\"WHAT\")"});
console.log(JSON.stringify(test.data, null, 2));
await message.reply({
content:"```\n"+JSON.stringify(test.data["jobs"],null,4)+"\n```"
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
        emitter.emit("registerCmd", onCat, true, "cat", "Cat API (thanks hitpet)");
        emitter.emit("registerCmd", onHttpCat, true, "httpCat", "Http Cat API (thanks hitpet)");
        emitter.emit("registerCmd", onHeyWorld, true, "executeScript", "script executor");
        emitter.emit("registerCmd", onRenderRCC, true, "renderRCC", "script executor v2");
        emitter.emit("registerCmd", onRenderModelRCC, true, "renderModelRCC", "script executor v3");
        emitter.emit("registerCmd", onRenderGameRCC, true, "renderGameRCC", "script executor v4");
        emitter.emit("registerCmd", onGetJobsRCC, true, "getJobsRCC", "script executor v5");
    });
    emitter.on("settings", (shit) => {
        settings = shit;
    });
}

exports.init = init;