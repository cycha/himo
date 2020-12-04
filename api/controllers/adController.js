const Ad = require("commons/schema/schemaAd");

const adsPerPage = 35;

async function search(req, res) {
    const body = req.body
    const query = {};
    if (body.title) {
        query["$text"] = {$search: body.title};
    }
    if (body.type) {
        query["real_estate_type"] = body.type;
    }
    if (body.sellType) {
        query["immo_sell_type"] = body.sellType;
    }
    if (body.priceMin || body.priceMax) {
        let priceObj = {};
        if (body.priceMin) {
            priceObj["$gte"] = body.priceMin;
        }
        if (body.priceMax) {
            priceObj["$lte"] = body.priceMax;
        }
        query["price"] = priceObj;
    }

    if (body.surfaceMin || body.surfaceMax) {
        let surfaceObj = {};
        if (body.surfaceMin) {
            surfaceObj["$gte"] = body.surfaceMin;
        }
        if (body.surfaceMax) {
            surfaceObj["$lte"] = body.surfaceMax;
        }
        query["surface"] = surfaceObj;
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

module.exports.search = search;