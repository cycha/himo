const ScrappingTask = require('./tasks/scrapping')
const db = require('commons/db')
const cron = require('node-cron');
// const proxy = require('./proxy');
const Ad = require('commons/schema/schemaAd');
const mdq = require('mongo-date-query');

// proxy.start();

// Task to scrap le bon coin every 2 mins from 6 to midnight
const scrappingTask = cron.schedule('*/2 5-22 * * *', ScrappingTask);

// Clean db once a month
cron.schedule('0 0 1 * *', () => {
    console.log("Cleaning db...");
    db.connect()
        .then(() => Ad.countDocuments({release_date: mdq.beforeLastYear()}))
        .then(ads => console.log(ads))
        .then(() => db.close());
})

// Stop proxy at midnight
// cron.schedule('0 0 * * *', () => {
//     console.log("Stopping proxy instances");
//     proxy.scale(0, 0, 0);
// })

console.log("Scrapping task: " + scrappingTask.getStatus());

// Handle exit
const exitEvents = [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`];
exitEvents.forEach((eventType) => {
    process.on(eventType, error => console.error("Bot terminated with " + eventType + " " + error));
})