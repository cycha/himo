const mongoose = require("mongoose");
const Ad = require('./schema/schemaAd')

//Connexion à la base de donnée
async function connect() {
//TODO Change localhost to mongodb with ENV variable if in docker
    console.log("Connecting to mongoDB...");

    return new Promise((resolve, reject) => {
        mongoose
            .connect("mongodb://localhost/db", {
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
        console.log("Saving data...");
        Ad.insertMany(ads)
            .then(mongooseDocuments => {
                console.log("Saved to db");
                resolve();
            })
            .catch(err => {
                console.log(err);
                resolve();
            });
    });
}

exports.saveAdsToDb = saveAdsToDb;
exports.close = close;
exports.connect = connect;
// module.exports = mongoose;