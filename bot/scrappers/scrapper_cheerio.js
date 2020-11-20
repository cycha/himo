const cheerio = require("cheerio");
const axios = require("axios");
const siteUrl = "https://www.leboncoin.fr/recherche/?category=9&locations=Strasbourg__48.572862300652176_7.7376447971243545_10000";
let siteName = "";
const titles = new Set();
// const tags = new Set();
// const locations = new Set();
// const positions = new Set();

const fetchData = async () => {
    const result = await axios.get(siteUrl);
    return cheerio.load(result.data);
};
const getResults = async () => {
    const $ = await fetchData();
    // siteName = $('.top > .action-post-job').text();
    // $("#container > main > div > div._3iQ0i > div.l17WS.bgMain > div > div._2Njaz._3GLp9 > div._358dQ > div > div:nth-child(1) > div > ul > li:nth-child(1) > a > section > div:nth-child(1) > p > span")
    $("#container > main > div > div._3iQ0i > div.l17WS.bgMain > div > div._2Njaz._3GLp9 > div._358dQ > div > div:nth-child(1) > div > ul > li:nth-child(1) > a > section > div:nth-child(1) > p > span")
        .each((index, element) => {
        titles.add($(element).text());
    });
    // $(".location").each((index, element) => {
    //     locations.add($(element).text());
    // });
    // $("div.nav p").each((index, element) => {
    //     categories.add($(element).text());
    // });
    //
    // $('.company_and_position [itemprop="title"]')
    //     .each((index, element) => {
    //         positions.add($(element).text());
    //     });
//Convert to an array so that we can sort the results.
    return {
        titles: [...titles].sort(),
        // tags: [...tags].sort(),
        // locations: [...locations].sort(),
        // categories: [...categories].sort(),
        // siteName,
    };
};
module.exports = getResults;