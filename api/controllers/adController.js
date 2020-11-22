const Ad = require("commons/schema/schemaAd");

const adsPerPage = 35;

//TODO Add pagination and search parameters
async function search(req, res) {
    const body = req.body
    console.log("Received: " + body);

    const query = {};
    if (body.title) {
        query["$text"] = {$search: body.title};
    }
    if (body.location) {
        query["$or"] = [{
            "location.coordinates": {
                $geoWithin: {$centerSphere: [body.location.coordinates, 5 / 6378]}
            }
        },
            {
                "location.city": body.location.address_components
                    .find(o => o.types.find(o => o === "locality"))
                    .short_name
            }
        ]
    }

    const ads = await Ad.find(query)
        .collation({locale: "fr", strength: 1})
        .sort('-release_date')
        .skip(body.page * adsPerPage)
        .limit(adsPerPage);
    // console.log(ads);
    try {
        return res.status(200).json(ads);
    } catch (error) {
        return res.status(500).json({error});
    }
}

function getStringWithQuotes(value) {
    return "\"" + value + "\"";
}

module.exports.search = search;