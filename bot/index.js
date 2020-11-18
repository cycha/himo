const leboncoin = require ('./scrappers/leboncoin')
const db = require('commons/db')

// console.log()

db.connect()
    .then(() => leboncoin.startScrapping())
    .then(results => {
        console.log("Scrapping completed, " + results.adsSaved + " ads saved with "
            + results.failurePercentage + "% requests needing a retry and an average of "
            + results.averageRetriesPerRequest + " retries per request with error.");
    })
    .then(() => db.close());

//TODO Node Cron