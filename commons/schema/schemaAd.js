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
        thumb_url: String,
        url: {
            type: String,
            required: true,
            unique: true
        },
        surface: Number,
        price: {
            type: Number,
            required: true
        },
        provider: {
            type: String,
            required: true
        },
        location: {
            region_name: String,
            department_id: String,
            department_name: String,
            city: String,
            zipcode:  {
                type: String,
                required: true
            },
            lat: String,
            lng: String,
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

adSchema.methods = {
    // authenticate: function(password) {
    //     return passwordHash.verify(password, this.password);
    // },
    // getToken: function() {
    //     return jwt.encode(this, config.secret);
    // }
};

module.exports = mongoose.model("Ad", adSchema);