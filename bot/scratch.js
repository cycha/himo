fetch = require("node-fetch");
fs = require('fs');
// db = require('db')

const regex = /"ads"[:](\[.*\],"ads_alu")/g;
// const regex = /\s(\".*\")/;
// const text = "\"ElevationFilenameIn\": \"Input raster elevation file\",\n" +
//     "\"TargetCRS\": \"Target vertical coordinate reference system Type\",\n" +
//     "\"TargetCRScode\": \"Target vertical coordinate system Code\",\n" +
//     "\"TargetCRSfile\": \"The projection (.prj) file in shoebox to be used for this inputfile\"";
// regex.exec(text)
//     .forEach(element => console.log("Value :" + element));
function getAdsFromDisk(callback) {
    fs.readFile("requestContent.html", (err, data) => {
        let array = data.toString().match(regex)
        let jsonArrayStr = array[array.length - 1]
            .replace('"ads":', '')
            .replace(",\"ads_alu\"", "");
        const jsonArray = JSON.parse(jsonArrayStr);
        // console.log(jsonArray);
        callback(jsonArray);
        // fs.writeFile("result.html", jsonArrayStr, err => console.log(err))

    })
}

function getAdsFromInternet(callback) {
    console.log("Request started")
    fetch("https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000", {
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
            callback(JSON.parse(jsonArrayStr));
            // fs.writeFile("requestContent.html", body, err => console.log(err))
            // fs.writeFile("requestContent.html", jsonArrayStr, err => console.log(err))

            // fs.writeFile("draft.html", body, err => console.log(err))
        })
        .catch(reason => console.log(reason));
}

function convertJsonArrayToObject(jsonArray) {
    console.log()
    jsonArray.forEach(element => console.log(element.first_publication_date + " " + element.subject + " - " + element.price + " €"));
    console.log("------------\n" + jsonArray.length + " ads found.")
}

function saveAdsToDisk(fileName, data) {
    fs.writeFile("requestContent.html", data, err => {
        console.log(err === null ? fileName + " saved" : err)
    })
}
//###############@

// getAdsFromDisk(function (response) {
//     convertJsonArrayToObject(response);
// })

getAdsFromInternet(function (response) {
    convertJsonArrayToObject(response);
})

// fetch("https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000", {
//     "headers": {
//         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//         "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
//         "cache-control": "max-age=0",
//         "sec-fetch-dest": "document",
//         "sec-fetch-mode": "navigate",
//         "sec-fetch-site": "none",
//         "sec-fetch-user": "?1",
//         "upgrade-insecure-requests": "1",
//         "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"
//     },
//     "referrer": "https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": null,
//     "method": "GET",
//     "mode": "cors"
// })
//     .then(res => res.text())
//     // .then(res => res.text())
//     .then(body => {
//         // body.substringData()
//         // console.log(body)
//         // let array = body.toString().match(regex)
//         // let jsonArrayStr = array[array.length-1]
//         //     .replace('"ads":','')
//         //     .replace(",\"ads_alu\"", "");
//         // regex.exec(body)
//         //     .forEach(element => console.log("Value :" + element));
//         // fs.writeFile("requestContent.html", body, err => console.log(err))
//         // fs.writeFile("requestContent.html", jsonArrayStr, err => console.log(err))
//         fs.writeFile("draft.html", body, err => console.log(err))
//     })
//     .catch(reason => console.log(reason));