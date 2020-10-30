const mongoose = require("mongoose");

const adSchema = mongoose.Schema(
    {
        title: {
            type: String,
            unique: true,
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
            type: String
        },
        website: {
            type: String,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            releaseDate: "release_date"
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