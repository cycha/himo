// const playwright = require('playwright');
// const userAgent = require('real-user-agent');
const userAgents = require('./utils/userAgents');

const axios = require('axios');
// const mdq = require('mongo-date-query');
// const db = require('commons/db')
// const Ad = require('commons/schema/schemaAd')

(async () => {

    var request = require('request');

    var headers = {
        'Connection': 'keep-alive',
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Accept-Language': 'fr-FR,fr;q=0.9'
    };

    var options = {
        url: 'https://www.leboncoin.fr/recherche/?category=9',
        headers: headers
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    }

    request(options, callback);

    // await axios.post("https://enanijesk1lx0uo.m.pipedream.net",
    //     {"url" :"https://www.leboncoin.fr/recherche/?category=9",
    //     "userAgent": getRandomUserAgent()})
    //     .then(res => console.log(res.data));

// db.connect()
//     .then(() => Ad.countDocuments({release_date: mdq.beforeLastYear()}))
//     .then(ads => console.log(ads))
//     .then(() => db.close());

// for (const browserType of ['chromium'/*, 'firefox', 'webkit'*/]) {
//     try {
//         const browser = await playwright[browserType].launch(/*{proxy: {server: "62.91.90.130:8080"}}*/);
//         const randomUserAgent = await userAgent.cycle(Math.random());
//         const context = await browser.newContext({userAgent: randomUserAgent});
//         const page = await context.newPage();
//         console.log(browserType)
//         // await page.goto('http://whatsmyuseragent.org/');
//         await page.goto('https://www.leboncoin.fr/recherche/?category=9');
//         // await page.waitForTimeout(5000)
//         // const handle = await (await page.$("#captcha-submit > div > div > iframe"))
//         // const frame = await handle.contentFrame()
//         // await frame.click("#recaptcha-anchor > div.recaptcha-checkbox-border")
//         // await page.waitForTimeout(5000)
//         await page.screenshot({path: `example-${browserType}.png`});
//         await browser.close();
//     } catch (e) {
//         console.error(e)
//     }
//
// }
})();

function getRandomUserAgent() {
    const random = Math.floor(Math.random() * userAgents.length);
    return userAgents[random].useragent;
}
