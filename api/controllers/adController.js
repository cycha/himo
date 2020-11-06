const Ad = require("commons/schema/schemaAd");

async function search(req, res) {
    const ads = await Ad.find()
    try {
        return res.status(200).json(ads);
    } catch (error) {
        return res.status(500).json({error});
    }
}

module.exports.search = search;