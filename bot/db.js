// Not working yet

const mongoose = require("mongoose");

//Connexion à la base de donnée
console.log("Connecting to mongoDB...");
// Change localhost to mongodb if in docker
mongoose
    .connect("mongodb://localhost/db", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connected to mongoDB");
    })
    .catch((e) => {
        console.log("Error while DB connecting");
        console.log(e);
    });

module.exports = mongoose