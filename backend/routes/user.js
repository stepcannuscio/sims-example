const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require("passport")

// Routes
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err => console.log(err))
        if (!user) res.send("No User Exists")
        else {
            // Successfully authenticated
            req.logIn(user, err => {
                if (err => console.log(err))
                res.send("Successfully Authenticated")
                console.log(req.user)
            })
        }
    })(req, res, next)
})

router.get("/", (req, res) => {
    if (req.user) {
        res.json({ user: req.user })
    } else {
        res.json({ user: null })
    }
})

router.get('/logout', function(req, res){
    req.logout();
    if (req.user) {
        res.json("Failed")
    } else {
        res.json("Success")
    }
  });

module.exports = router
