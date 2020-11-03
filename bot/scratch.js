const fetch = require("node-fetch");
const fs = require('fs');
const Ad = require('./schema/schemaAd')
const db = require('./db')

const regex = /"ads"[:](\[.*\],"ads_alu")/g;

db.connection.once("open", function () {
    getAdsFromInternet()
    // getAdsFromDisk()
        .then(jsonArray => convertJsonArrayToObject(jsonArray))
        .then(jsonObject => saveAdsToDb(jsonObject))
        .then(() => db.connection.close());
})

//################

async function getAdsFromDisk() {
    return new Promise(resolve => {
        fs.readFile("requestContent.html", (err, data) => {
            let array = data.toString().match(regex)
            let jsonArrayStr = array[array.length - 1]
                .replace('"ads":', '')
                .replace(",\"ads_alu\"", "");
            const jsonArray = JSON.parse(jsonArrayStr);
            // console.log(jsonArray);
            resolve(jsonArray)
        })
    });
}

async function getAdsFromInternet() {
    console.log("Request started")
    return fetch("https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"
        },
        "referrer": "https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
        .then(res => res.text())
        .then(body => {
            // console.log(body)
            let array = body.toString().match(regex);
            let jsonArrayStr = array[array.length - 1]
                .replace('"ads":', '')
                .replace(",\"ads_alu\"", "");
            console.log("Request received ,lenght=" + jsonArrayStr.length);

            return JSON.parse(jsonArrayStr);
        })
        .catch(reason => {
            console.log(reason);
            return null;
        });
}

async function convertJsonArrayToObject(jsonArray) {
    let ads = [];
    jsonArray.forEach(element => {
            console.log(element.first_publication_date + " " + element.subject + " - " + element.price + " €")
            let ad = Ad({
                "title": element.subject,
                "description": element.body,
                "url": element.url,
                "source": "leboncoin",
                "release_date": element.index_date,
                "price": element.price[0]
            });

            ads.push(ad);
        }
    );
    console.log("------------\n" + jsonArray.length + " ads found.")
    return ads;
}

function saveAdsToDisk(fileName, data) {
    fs.writeFile("requestContent.html", data, err => {
        console.log(err === null ? fileName + " saved" : err)
    })
}

async function saveAdsToDb(ads) {
    return new Promise(resolve => {
        console.log("Saving data...");
        Ad.insertMany(ads)
            .then(mongooseDocuments => {
                console.log("Saved to db");
                resolve();
            })
            .catch(err => {
                console.log(err);
                resolve();
            });
    });
}