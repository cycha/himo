const Ad = require("commons/schema/schemaAd");

const adsPerPage = 35;

//TODO Add pagination and search parameters
async function search(req, res) {
    const body = req.body
    console.log("Received at " + new Date().toLocaleString());
    console.log(body);

    const query = {};
    if (body.title) {
        query["$text"] = {$search: body.title};
    }
    if (body.location) {
        let city;
        let political;
        try {
            city = body.location.address_components
                .find(o => o.types.find(o => o === "locality"))
                .short_name;
        } catch (e) {
            console.log(e);
            political = body.location.address_components
                .find(o => o.types.find(o => o === "political"))
                .short_name
        }

        let orArray = []
        if (body.location.coordinates) {
            orArray.push({
                "location.coordinates": {
                    $geoWithin: {$centerSphere: [body.location.coordinates, 5 / 6378]}
                }
            });
        }
        if (city) {
            orArray.push({"location.city": city})
        } else if (political) {
            orArray.push({"location.department_name": political})
            orArray.push({"location.region_name": political})
        }

        query["$or"] = orArray;
    }
    // console.log(query);
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