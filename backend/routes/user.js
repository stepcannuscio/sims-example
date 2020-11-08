const express = require('express')
// const session = require('express-session')
// const cors = require("cors") // for ajax requests
const router = express.Router()
const User = require('../models/user')
const passport = require("passport")

// router.use(cors())

// router.use(res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'))

// router.use(session({
//     secret: process.env.SECRET,
//     // cookie: { 
//     //     secure: true
//     // },
//     resave: false,
//     saveUninitialized: false
// }))

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
    // console.log("router.get('/')")
    if (req.user) {
        res.json({ user: req.user })
    } else {
        res.json({ user: null })
    }
})

router.get('/logout', function(req, res){
    // console.log(req.user)
    req.logout();

    if (req.user) {
        res.json("Failed")
    } else {
        res.json("Success")
    }
    // console.log(req.user)
    // res.json("Logged out")
  });

// router.post(
//     '/login',
//     function (req, res, next) {
        
//         console.log('routes/auth.js, login, req.body: ');
        
//         console.log(req.body)
//         console.log(req.session)
//         next()
//     },
//     passport.authenticate('local'),
//     (req, res) => {
//         console.log('logged in', req.user);
//         req.logIn(req.user, err => {
//             if (err) {
//                 res.json(err)
//             } else {
//                 res.json("authenticated");
//             }
//         })
//         // req.session.reload(function(err) {
//         //     // session updated
//         //   })
//         // passport.session()
//         // var userInfo = {
//         //     username: req.user.username
//         // };
//         // user object attaches to the request as req.user
        
        
        
//         // done(err, user)
//         // var userService = new UserService();
//         // userService.findUnique({"_id": new ObjectID(id)}, function(err, user) {
//         //     console.log(user)
//         //     done(err, user);
//         // });
 
//     }
// )


// router.get('/', (req, res, next) => {
//     res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
//     res.set('Access-Control-Allow-Credentials', true)
//     console.log('===== user!!======')
//     console.log(req.user)
//     if (req.user) {
//         res.json({ user: req.user })
//     } else {
//         res.json({ user: null })
//     }
// })

module.exports = router
