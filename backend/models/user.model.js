const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: {
        type: String,
        require: true,
        unique: true,
    },
    password: String,
}, {
    timestamps: true,
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema)
module.exports = User