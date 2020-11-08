const Ad = require("commons/schema/schemaAd");

//TODO Add pagination and search parameters
async function search(req, res) {
    const title = req.query.title;
    const location = req.query.location;
    const ads = await Ad.find({
        "title": new RegExp(title ? title : "", "i"),
        "location.city": new RegExp(location ? location : "", "i")
    })
        .sort('-release_date')
        .limit(35);
    try {
        return res.status(200).json(ads);
    } catch (error) {
        return res.status(500).json({error});
    }
}

module.exports.search = search;