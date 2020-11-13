//TODO Add pagination
//Example url: "https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000"

const fetch = require("node-fetch");
const db = require('commons/db')
const Ad = require('commons/schema/schemaAd')
const utils = require('../utils')
const regex = /"ads"[:](\[.*\],"ads_alu")/g;
const url = "https://www.leboncoin.fr/recherche/?category=9"
const pagesLimit = 10 // Maximum pages to scrap

db.connect()
    .then(() => startScrapping(url))
    .then(adsSaved => {
        console.log("Scrapping completed, " + adsSaved + " ads saved.");
    })
    .then(() => db.close());
//################ SAVE MOCK DATA EXAMPLE #########
// saveHtmlFromInternetToFile(url,"./mock/leboncoin.html");
// saveAdsFromFileToDb("./mock/leboncoin.html");
//###############################

async function startScrapping(url) {
    console.log("Start scrapping Leboncoin...");
    let isDbUpToDate = false;
    let pageNumber = 1;
    let adsSaved = 0;

    const latestAdInDb = await db.getMostRecentAdInDb("lbc");
    // Compare latest ad date and title from db to know if it can be saved
    const latestDate = latestAdInDb ? latestAdInDb.release_date : new Date(0);
    const latestTitle = latestAdInDb ? latestAdInDb.title : "";

    do {
        try {
            const urlWithPage = url + (pageNumber === 1 ? "" : "&page=" + pageNumber);
            const html = await getAdsFromInternet(urlWithPage);
            // Handle exception when capcha
            const {ads, isUpToDate} = await parseAdsFromHtml(html, latestDate, latestTitle);
            isDbUpToDate = isUpToDate
            adsSaved += await db.saveAdsToDb(ads).catch(reason => console.error(reason));
            pageNumber++;
        } catch (e) {
            console.error(e)
            break;
        }


    } while (!isDbUpToDate && pageNumber < pagesLimit)

    return adsSaved;
}

async function saveAdsFromFileToDb(fileName) {
    utils.getFromFile(fileName)
        .then(results => parseAdsFromHtml(results))
        .then(jsonObject => db.saveAdsToDb(jsonObject));
}

async function saveHtmlFromInternetToFile(url, fileName) {
    getAdsFromInternet(url)
        .then(results => utils.saveToFile(fileName, results))
}

async function getAdsFromInternet(url) {
    console.log("Request started for " + url)
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
            // "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"
        },
        "referrer": "https://www.leboncoin.fr/recherche/?category=9",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
        .then(res => {
            if (res.ok) {
                return res.text()
            } else {
                throw "Error " + res.status + " - " + res.statusText;
            }
        })
        .then(body => {
            console.log("Request received, size= " + body.length);
            return body;
        });
}


async function parseAdsFromHtml(results, latestDate, latestTitle) {
    console.log("Parsing...")
    let array = results.toString().match(regex);
    let jsonArrayStr = array[array.length - 1]
        .replace('"ads":', '')
        .replace(",\"ads_alu\"", "");
    let jsonArray = JSON.parse(jsonArrayStr);

    let ads = [];
    let isUpToDate = false
    // Make some logic for latest date
    for (const element of jsonArray) {
        const surfaceArray = element.attributes.find(element => element.key === "square");
        const surface = surfaceArray ? parseInt(surfaceArray.value) : null;
        let immoCellType = element.attributes.find(element => element.key === "immo_sell_type").value;
        if (!immoCellType) {
            immoCellType = element.attributes.find(element => element.key === "type_real_estate_sale").value;
            if (immoCellType === "Ancien") {
                immoCellType = "old";
            }
        }
        let rooms = element.attributes.find(element => element.key === "rooms");
        rooms = rooms ? rooms.value : null;
        let realEstateType = element.attributes.find(element => element.key === "real_estate_type");
        if (realEstateType) {
            switch (realEstateType.value) {
                case "1":
                    realEstateType = "home";
                    break
                case "2":
                    realEstateType = "flat";
                    break
                case "3":
                    realEstateType = "land";
                    break
                case "4":
                    realEstateType = "parking";
                    break
                case "5":
                    realEstateType = "building";
                    break
            }
        } else {
            console.error("Cannot find realEstateType, element.attributes => " + element.attributes);
        }
        let ad = Ad({
            "title": element.subject,
            "description": element.body,
            "url": element.url,
            "provider": "lbc",
            "release_date": element.index_date,
            "price": element.price ? element.price[0] : null,
            "surface": surface,
            "thumb_urls": element.images.urls_thumb,
            "real_estate_type": realEstateType,
            "rooms": rooms,
            "immo_sell_type": immoCellType,
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
        if (ad.release_date > latestDate && ad.title !== latestTitle) {
            if (ad.price) {
                console.log(ad.release_date + " " + element.subject + " " + element.location.city + " - "
                    + element.price + " € - " + ad.immo_sell_type + " " + ad.real_estate_type);
                ads.push(ad);
            } else {
                console.error("Ad not added: " + ad);
            }
        } else {
            isUpToDate = true
            console.log("Db is up to date");
            break;
        }
    }
    console.log("------------\n" + jsonArray.length + " ads found. " + ads.length + " added.");
    return {"ads": ads, "isUpToDate": isUpToDate};
}