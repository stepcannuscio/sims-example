const User = require("./models/user")
const bcrypt = require("bcryptjs")
const localStrategy = require("passport-local").Strategy

module.exports = function(passport) {
    passport.use(
        new localStrategy((username, password, done) => {

            // <---> DB - EDIT BELOW
            User.findOne({username: username}, (err, user) => {
                if (err => console.log(err))
                if (!user) return done(null, false)
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err => console.log(err))
                    if (result === true) {
                        return done(null, user)
                    } else {
                        return done(null, false)
                    }
                })
            })
            // <---> DB - EDIT ABOVE
        })
    )
    // sets cookie
    passport.serializeUser((user, cb) => {
        cb(null, user.id)
    })

    // sets data you're storing for the logged in user
    passport.deserializeUser((id, cb) => {

        // <---> DB - EDIT BELOW

        User.findOne({_id: id}, (err, user) => {
            const userInformation = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
            }
            cb(err, userInformation)
        })

        // <---> DB - EDIT ABOVE
    })
}