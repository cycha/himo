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
        image_url: {
            type: String
        },
        url: {
            type: String,
            required: true,
            unique: true
        },
        price: {
            type: Number,
            required: true
        },
        source: {
            type: String,
            required: true
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