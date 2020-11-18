const puppeteer = require('puppeteer-extra')
// add stealth plugin and use defaults (all evasion techniques)
const stealthPlugin = require('puppeteer-extra-plugin-stealth')()

const url = "https://www.seloger.com/list.htm?tri=initial&enterprise=0&idtypebien=1&idtt=2,5&naturebien=1,2,4&ci=670482&m=search_hp_new";

const titles = new Set();
const tags = new Set();
// const locations = new Set();
// const positions = new Set();

function debug(...args) {
    console.log('🚀', args)
}

const getResults = async () => {
    puppeteer.use(stealthPlugin)
    console.log(stealthPlugin.availableEvasions)
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 1280});

    debug('Open chrome with url', url)
    await page.goto(url, {waitUntil: 'networkidle2'})
    console.log("Wait for selector")
    // await page.waitForSelector("#recaptcha-anchor > div.recaptcha-checkbox-border")
    await page.mainFrame().childFrames().find(frame => frame.name()).waitForSelector("#captcha-container > div.captcha__human > div > div.captcha__human__title")
    console.log("Clic")
    await page.click("#recaptcha-anchor > div.recaptcha-checkbox-borderAnimation")
    const data = await page.evaluate(() => {
        // Le bon coin
        const offers = document.querySelectorAll('[itemtype="http://schema.org/Offer"]')

        return Array.from(offers)
            .slice(0, 2)
            .map(dom => {
                return {
                    title: dom.querySelector('span [itemprop="name"]').innerText,
                    image: dom.querySelector('span [itemprop="image"]').getAttribute('src'),
                    price: dom.querySelector('span [itemprop="price"]').innerText
                }
            })

    })
    await page.screenshot({path: 'testresult.png', fullPage: true})
    await browser.close()

    console.log('🔥', data)
    return data;
};
module.exports = getResults;