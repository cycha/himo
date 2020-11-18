//TODO Add pagination
//Example url: "https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000"

const fetch = require("node-fetch");
const axios = require('axios')
const db = require('commons/db')
const Ad = require('commons/schema/schemaAd')
const utils = require('../utils')
const HttpsProxyAgent = require('https-proxy-agent');
const agent = new HttpsProxyAgent('http://127.0.0.1:8888');

const regex = /"ads"[:](\[.*\],"ads_alu")/g;
const defaultUrl = "https://www.leboncoin.fr/recherche/?category=9";
const pagesLimit = 10; // Maximum pages to scrap
const maxRetry = 10;
const waitSuccess = 5;
const waitError = 15

//################ SAVE MOCK DATA EXAMPLE #########
// saveHtmlFromInternetToFile(url,"./mock/leboncoin.html");
// saveAdsFromFileToDb("./mock/leboncoin.html");
//###############################

async function startScrapping(url) {
    console.log("Start scrapping Leboncoin...");
    let isDbUpToDate = false;
    let pageNumber = 1;
    let adsSaved = 0;
    const retryArray = []

    const latestAdInDb = await db.getMostRecentAdInDb("lbc");
    // Compare latest ad date and title from db to know if it can be saved
    const latestDate = latestAdInDb ? latestAdInDb.release_date : new Date(0);
    const latestTitle = latestAdInDb ? latestAdInDb.title : "";

    do {
        try {
            const urlWithPage = (url ? url : defaultUrl) + (pageNumber === 1 ? "" : "&page=" + pageNumber);
            let requestWorked = false;
            let retry = 0;
            let html;
            do {
                try {
                    // html = await getAdsFromInternet(urlWithPage);
                    html = await getAdsWithAxiosFromInternet(urlWithPage);
                    requestWorked = true;
                    retryArray.push(retry);
                } catch (e) {
                    console.error("Request failed: " + e + ", retry " + retry);
                    if (retry < maxRetry) {
                        retry++;
                    } else {
                        retryArray.push(retry);
                        throw "Max retry reached for request";
                    }
                    // Wait a long time
                    await utils.sleep(waitError + 15 * Math.random());
                }
            } while (!requestWorked)
            // Handle exception when capcha
            const {ads, isUpToDate} = await parseAdsFromHtml(html, latestDate, latestTitle);
            isDbUpToDate = isUpToDate
            adsSaved += await db.saveAdsToDb(ads).catch(reason => console.error(reason));
            pageNumber++;
            // Wait a little bit before scrapping again`
            if (!isDbUpToDate && pageNumber < pagesLimit) {
                await utils.sleep(waitSuccess + 15 * Math.random());
            }
        } catch (e) {
            console.error(e)
            break;
        }
    } while (!isDbUpToDate && pageNumber < pagesLimit)
    console.log("##############################################");
    console.log("Requests retries array: " + retryArray);
    return {
        "adsSaved": adsSaved,
        "failurePercentage": Math.round(((retryArray.reduce((a, b) => b === 0 ? a : a + 1,0)) / retryArray.length) * 100),
        "averageRetriesPerRequest": Math.round((retryArray.reduce((a, b) => a + b) / (retryArray.reduce((a, b) => b === 0 ? a : a + 1,0))))
    };
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

async function getAdsWithAxiosFromInternet(url) {
    const randomUserAgent = getRandomUserAgent();
    console.log("Request started for " + url + " - " + randomUserAgent);

    let response = await axios.get(url,
        {
            headers: {
                'Connection': 'keep-alive',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': randomUserAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'fr-FR,fr;q=0.9'
            },
            httpsAgent: agent
        });
    return response.data;
}

// Unused, prefer axios
async function getAdsFromInternet(url) {
    const randomUserAgent = getRandomUserAgent();
    console.log("Request started for " + url + " - " + randomUserAgent);

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
            // "user-agent": randomUserAgent
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
        },
        "referrer": "https://www.leboncoin.fr/recherche/?category=9",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "agent": agent
    })
        .then(res => {
            if (res.ok) {
                const body = res.text();
                console.log("Request received " + res.statusText + ", size= " + res.size);
                if (res.size === 0) {
                    throw "Response empty";
                }
                return body
            } else {
                throw "Response error => " + res.status + " - " + res.statusText;
            }
        })
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

function getRandomUserAgent() {
    const uaArray = ["Mozilla/5.0 (Linux; Android 10; ONEPLUS A6003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15",
        "Mozilla/5.0 (Linux; Android 9; Mi 9 Lite) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.185 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; U; Android 9; fr-fr; Mi 9 Lite Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/12.5.2-go",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36 Edg/86.0.622.69"]
    const random = Math.floor(Math.random() * uaArray.length);
    return uaArray[random];
}

module.exports.startScrapping = startScrapping;