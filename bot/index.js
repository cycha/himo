const leboncoin = require('./scrappers/leboncoin')
const db = require('commons/db')
const cron = require('node-cron');
const proxy = require('./proxy');


proxy.start();

// Task to scrap le bon coin every 10 mins
cron.schedule(' */10 * * * *', () => {
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
