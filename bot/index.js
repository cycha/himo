const leboncoin = require('./scrappers/leboncoin')
const db = require('commons/db')
const cron = require('node-cron');
const proxy = require('./proxy');
const Ad = require('commons/schema/schemaAd');
const mdq = require('mongo-date-query');


proxy.start();

// Task to scrap le bon coin every 10 mins
cron.schedule(' 6-0/10 * * * *', () => {
    console.log("##################################################################");
    console.log('## TASK LEBONCOIN STARTING... ' + new Date().toISOString());
    console.log("##################################################################");

    db.connect()
        .then(() => leboncoin.startScrapping())
        .then(results => {
            console.log("Scrapping completed, " + results.adsSaved + " ads saved with "
                + results.failurePercentage + "% requests needing a retry and an average of "
                + results.averageRetriesPerRequest + " retries per request with error.");
        })
        .then(() => db.close());
});

// Clean db once a month
cron.schedule(' 0 0 1 * *', () => {
    console.log("Cleaning db...");
    db.connect()
        .then(() => Ad.countDocuments({release_date: mdq.beforeLastYear()}))
        .then(ads => console.log(ads))
        .then(() => db.close());
})

// Handle exit
const exitEvents = [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`,`SIGTERM`];
exitEvents.forEach((eventType) => {
    process.on(eventType, () => console.log("Bot terminated with " + eventType));
})