const mongoose = require("mongoose");
const passwordHash = require("password-hash");
const jwt = require("jwt-simple");

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    },
    { timestamps: { createdAt: "created_at" } }
);

userSchema.methods = {
    authenticate: function(password) {
        return passwordHash.verify(password, this.password);
    },
    getToken: function() {
        return jwt.encode(this,"mediumMernAppCreation"); //TODO Set secret to ENV file
    }
};

module.exports = mongoose.model("User", userSchema);