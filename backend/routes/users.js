const express = require('express')
const router = express.Router() // allows us to create routes with the express server
const passport = require("passport") // access to authentication middleware

router.post("/login", (req, res, next) => {

    // Try to log in the user using the local strategy defined in passportConfig

    passport.authenticate("local", (err, user, info) => {
        if (err => console.log(err))
        if (!user) res.send("No User Exists")
        else {
            // Successfully authenticated
            req.logIn(user, err => {
                if (err => console.log(err))
                res.send("Successfully Authenticated")
            })
        }
    })(req, res, next)
})

router.get("/", (req, res) => {

    // Gets the user who is currently logged in

    if (req.user) {
        res.json({ user: req.user })
    } else {
        res.json({ user: null })
    }
})

router.get('/logout', function(req, res){

    // Log out the user

    req.logout();

    if (req.user) {
        res.json("Failed")
    } else {
        res.json("Success")
    }
    
  });

module.exports = router
