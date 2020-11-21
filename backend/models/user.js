const mongoose = require("mongoose")
const passport = require("passport")

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

const User = mongoose.model("User", userSchema)
module.exports = User