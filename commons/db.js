const mongoose = require("mongoose");
const Ad = require('./schema/schemaAd')
const dotenv = require('dotenv');
dotenv.config();

//Connexion à la base de donnée
async function connect() {
    console.log("Connecting to mongoDB...");
    return new Promise((resolve, reject) => {
        mongoose
            .connect(process.env.MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            })
            .then(() => {
                console.log("Connected to mongoDB");
                resolve();
            })
            .catch((e) => {
                console.log("Error while DB connecting");
                console.log(e);
                reject(e);
            });
    });
}

async function close() {
    return mongoose.connection.close()
        .then(console.log("Closed connection to Db"));
}

async function saveAdsToDb(ads) {
    return new Promise(resolve => {
        if (ads.length) {
            console.log("Saving data...");
            Ad.insertMany(ads)
                .then(mongooseDocuments => {
                    console.log("Saved to db");
                    resolve(mongooseDocuments.length);
                })
                .catch(err => {
                    console.error("Error saving to db: " + err.writeErrors);
                    resolve(err.insertedDocs.length);
                });
        } else {
            console.log("No data to save");
            resolve()
        }
    });
}

async function getMostRecentAdInDb(source) {
    return Ad.findOne({"provider": source})
        .sort('-release_date')
        .exec()
        .then(r => {
            console.log("Latest Ad in db for " + source + ": " + (r ? r.release_date : "No ads in DB"));
            return r;
        });
}

exports.saveAdsToDb = saveAdsToDb;
exports.close = close;
exports.connect = connect;
exports.getMostRecentAdInDb = getMostRecentAdInDb;
// module.exports = mongoose;