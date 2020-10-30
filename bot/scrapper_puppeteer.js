const puppeteer = require('puppeteer');
// const siteUrl = "https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000";
const siteUrl = "https://remoteok.io/";
let siteName = "";
const titles = new Set();
const tags = new Set();
// const locations = new Set();
// const positions = new Set();


const getResults = async () => {
    /* Initiate the Puppeteer browser */
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    /* Go to the IMDB Movie page and wait for it to load */
    await page.goto(siteUrl, {waitUntil: 'networkidle0'});

    /* Run javascript inside of the page */
    let data = await page.evaluate(() => {
        let title = document.querySelector("#jobsboard > thead:nth-child(1) > tr > th > h1").innerText;
        // let rating = document.querySelector('span[itemprop="ratingValue"]').innerText;
        // let ratingCount = document.querySelector('span[itemprop="ratingCount"]').innerText;
        /* Returning an object filled with the scraped data */
        return {
            title,
            // rating,x
            // ratingCount
        }
    });
    /* Outputting what we scraped */
    console.log(data);
    await browser.close();

    titles.add(data.title)
    tags.add("Wesh Alors")
//Convert to an array so that we can sort the results.
    return {
        titles: [...titles].sort(),
        tags: [...tags].sort(),
        // locations: [...locations].sort(),
        // categories: [...categories].sort(),
        // siteName,
    };
};
module.exports = getResults;