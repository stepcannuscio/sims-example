const bcrypt = require("bcryptjs") // to encrypt/decrypt password
const localStrategy = require("passport-local").Strategy // strategy we set for passport to authenticate the user
const db = require("../db/dbConfig") // access to DB

module.exports = function(passport) {
    passport.use(

        // This sets the local strategy to query the db for the username entered
        // If the user exists then we compare the encrypted password to the one stored in DB
        // If at any point it fails, we send back an error which is handled on the frontend

        new localStrategy((username, password, done) => {

        const query = `
            SELECT *
            FROM users
            WHERE username='${username}'
        `;      
      
        db.query(query)
            .then(res => {
                if (res.rows[0]) {
                    const user = res.rows[0]

                    bcrypt.compare(password, user.password, (err, result) => {
                        if (err => console.log(err))
                        if (result === true) {
                            return done(null, user)
                        } else {
                            return done(null, false)
                        }
                    })
                } else {
                    return done(null, false)
                }
            })      
            .catch(err => console.log(err))
            })
    )
    // sets cookie
    passport.serializeUser((user, cb) => {
        cb(null, user.id)
    })

    // sets data we're storing for the logged in user
    passport.deserializeUser((id, cb) => {

        const query = `
        SELECT *
        FROM users
        WHERE id='${id}'
        `;      
        
        db.query(query)
            
            .then(res => {
                const user = res.rows[0]
                const userInformation = {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                }
                cb(null, userInformation)
            }) 
        
        .catch(err => console.log(err))
    })
}