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

exports.getFromFile = getFromFile;
exports.saveToFile = saveToFile;