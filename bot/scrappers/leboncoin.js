//TODO Add pagination
//Example url: "https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000"

const fetch = require("node-fetch");
const db = require('commons/db')
const Ad = require('commons/schema/schemaAd')
const utils = require('../utils')
const regex = /"ads"[:](\[.*\],"ads_alu")/g;
const url = "https://www.leboncoin.fr/recherche/?category=9"

startScrapping(url)
    .then(r => console.log("Scrapping completed"));
//################
// saveHtmlFromInternetToFile(url,"./mock/leboncoin.html");
//################

async function startScrapping(url) {
    console.log("Start scrapping Le Bon Coin...");
    return db.connect()
        .then(() => getAdsFromInternet(url))
        // .then(() => utils.getFromFile("./mock/leboncoin.html"))
        .then(results => parseAdsFromHtml(results))
        .then(jsonObject => db.saveAdsToDb(jsonObject))
        .then(() => db.close());
}

async function saveHtmlFromInternetToFile(url, fileName) {
    getAdsFromInternet(url)
        .then(results => utils.saveToFile(fileName, results))
}

async function getAdsFromInternet(url) {
    console.log("Request started")
    return fetch(url, {
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
            console.log("Request received, size= " + body.length);
            return body;
        })
        .catch(reason => {
            console.log(reason);
            return null;
        });
}

async function parseAdsFromHtml(results) {
    console.log("Parsing...")
    let array = results.toString().match(regex);
    let jsonArrayStr = array[array.length - 1]
        .replace('"ads":', '')
        .replace(",\"ads_alu\"", "");
    let jsonArray = JSON.parse(jsonArrayStr);

    let ads = [];
    const latestAdInDb = await db.getMostRecentAdInDb("lbc");
    const latestDate = latestAdInDb ? latestAdInDb.release_date : new Date(0);
    // Make some logic for latest date
    for (const element of jsonArray) {
        const surfaceArray = element.attributes.find(element => element.key === "square");
        const surface = surfaceArray ? parseInt(surfaceArray.value) : null;

        let ad = Ad({
            "title": element.subject,
            "description": element.body,
            "url": element.url,
            "provider": "lbc",
            "release_date": element.index_date,
            "price": element.price ? element.price[0] : null,
            "surface": surface,
            "thumb_url": element.images.thumb_url,
            "location": {
                "region_name": element.location.region_name,
                "department_id": element.location.department_id,
                "department_name": element.location.department_name,
                "city": element.location.city,
                "zipcode": element.location.zipcode,
                "lat": element.location.lat,
                "lng": element.location.lng,
            }
        });
        if (ad.release_date > latestDate && ad.title !== (latestAdInDb ? latestAdInDb.title : null)) {
            if (ad.price) {
                console.log(element.first_publication_date + " " + element.subject + " " + element.location.city + " - "
                    + element.price + " € ");
                ads.push(ad);
            }
        } else {
            break;
        }
    }
    console.log("------------\n" + jsonArray.length + " ads found. " + ads.length + " added.");
    return ads;
}