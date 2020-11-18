const { spawn } = require("child_process");

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
        console.log(`child process exited with code ${code}`);
    });
}

function stop() {
    return ls.kill();
}


module.exports.start = start;