const proxy = require('../proxy');
const leboncoin = require('../scrappers/leboncoin')
const db = require('commons/db')

module.exports = function () {
    const timeTaken = "Time taken to scrap";
    console.time(timeTaken);
    console.log("##################################################################");
    console.log('## TASK LEBONCOIN STARTING... ' + new Date().toLocaleString());
    console.log("##################################################################");
    // Check if proxy ready
    // proxy.getInstances()
    //     .then(async instances => {
    //         if (instances <= 1) {
    //             await proxy.scale(0, 10, 10)
    //         }
    //     })
    //     // Then start scrapping
    //     .then(() => db.connect())
    db.connect()
        .then(() => leboncoin.startScrapping())
        .then(results => {
            console.log("Scrapping completed, " + results.adsSaved + " ads saved with "
                + results.failurePercentage + "% requests needing a retry and an average of "
                + results.averageRetriesPerRequest + " retries per request with error.");
        })
        .then(() => db.close())
        // .then(() => proxy.scale(0,0,0))
        .then(() => console.timeEnd(timeTaken));
}