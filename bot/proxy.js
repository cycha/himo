const {spawn} = require("child_process");
const axios = require('axios');
require('dotenv').config();
const headers = {headers: {'Authorization': new Buffer.from(process.env.COMMANDER_PASSWORD).toString('base64')}};
const {sleep} = require("./utils/utils");

let ls;

async function start() {
    console.log("Starting proxy...");
    ls = spawn("scrapoxy", ["start", "config.js"]);

    ls.stdout.on("data", data => {
        console.log(`[PROXY] ${data}`);
    });

    ls.stderr.on("data", data => {
        console.log(`[PROXY] stderr: ${data}`);
    });

    ls.on('error', (error) => {
        console.log(`[PROXY] error: ${error.message}`);
    });

    ls.on("[PROXY] close", code => {
        console.log(`Scrapoxy exited with code ${code}`);
    });
}

async function scale(min, required, max) {
    console.log("Scaling proxy to " + required + " instances...")
    return await axios.patch("http://localhost:8889/api/scaling",
        {
            min: min,
            required: required,
            max: max,
        },
        headers)
        .then(data => {
            if (data.error) {
                throw data.error
            }
            console.log("Scaling request sent.");
        })
        .then(async () => {
            let instancesAlive = 0;
            while (instancesAlive < required / 2) {
                await sleep(10)
                    .then(() => getInstances())
                    .then(instances => {
                        instancesAlive = instances.filter(instance => instance.alive).length
                        console.log(instancesAlive + " instances alive.");
                    });
            }
            console.log("Proxy scaled to " + instancesAlive + " instances.");
        });
}

async function getInstances() {
    return axios.get("http://localhost:8889/api/instances", headers)
        .then(res => {
            return res.data;
        });
}

function stop() {
    return ls.kill();
}

module.exports.start = start;
module.exports.getInstances = getInstances;
module.exports.scale = scale;