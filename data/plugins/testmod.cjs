let emitter = undefined;
let discordjs = undefined;
let axios = undefined;
let settings = {};

const stream = require("stream");

const fs = require("fs");

const util = require("util");

const Scraper = require("images-scraper");

const idu = require("image-data-uri");

const finished = util.promisify(stream.finished); //i forgot what this does but DONT REMOVE IT

const g = new Scraper({
puppeteer: {
headless: false,
},
});

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

async function onFunny(msgg, message) {
	let cont = message.content.split(/\s(.*)/s)[1];
	g.getImageUrl(cont, 10).then(async (a) => {
		if(a == null) {
			message.reply("An error ocurred, sorry!");
			return;
		}
		let thing = a[cont.replace(/\s/g, '')];
		if(thing == null || thing.length <= 0) {
			console.log(thing);
			message.reply("No results found for ||\""+cont+"\"||");
			return;
		}
		let shoturl = thing[0].url;
		
		if(shoturl.startsWith("data:image")) {
			let thing1 = idu.decode(shoturl);
			shoturl = thing1.dataBuffer;
		}

        let mesvsage = new discordjs.MessageAttachment(shoturl,"SPOILER_ERRORIMAGE.png");

        await message.reply({
          files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
        });
	});
}


function init(emitter1, discardr, axi) {
    //console.log("Plugin initialized!");
    emitter = emitter1;
    discordjs = discardr;
    axios = axi;
    emitter.on("started", () => {
        //console.log("Plugin detected start!");
        emitter.emit("registerCmd", onFunny, true, "google", "GooglyEyes");
    });
    emitter.on("settings", (shit) => {
        settings = shit;
    });
}

exports.init = init;