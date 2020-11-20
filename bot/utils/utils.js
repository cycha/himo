const fs = require('fs');

async function getFromFile(fileName) {
    return new Promise(resolve => {
        fs.readFile(fileName, (err, data) => {
            console.log(err === null ? "Opened " + fileName : err)
            resolve(data.toString())
        });
    });
}

async function saveToFile(fileName, data) {
    return new Promise(resolve => {
        fs.writeFile(fileName, data, err => {
            console.log(err === null ? fileName + " saved" : err);
            resolve(data);
        });
    });
}

function sleep(s) {
    return new Promise((resolve) => {
        // console.log(`Wait for ${Math.round(s)} seconds.`);
        setTimeout(resolve, s * 1000);
    });
}

exports.sleep = sleep;
exports.getFromFile = getFromFile;
exports.saveToFile = saveToFile;