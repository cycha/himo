const mongoose = require("mongoose");

const adSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        thumb_urls: [String],
        url: {
            type: String,
            required: true,
            unique: true
        },
        //Appartement, Maison...
        real_estate_type: String,
        rooms: Number,
        surface: Number,
        // Neuf ou vieux
        immo_sell_type: String,
        price: {
            type: Number,
            required: true
        },
        provider: {
            type: String,
            required: true
        },
        location: {
            region_name: {
                type: String
            },
            department_id: {
                type: String
            },
            department_name: {
                type: String
            },
            city: {
                type: String
            },
            zipcode: {
                type: String,
                required: true
            },
            coordinates: [Number] // lng, lat
        },
        release_date: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at"
        }
    }
);
adSchema.index({"title": "text", "description": "text"});
adSchema.index({"location.coordinates": "2dsphere"});

adSchema.methods = {
    // authenticate: function(password) {
    //     return passwordHash.verify(password, this.password);
    // },
    // getToken: function() {
    //     return jwt.encode(this, config.secret);
    // }
};

module.exports = mongoose.model("Ad", adSchema);