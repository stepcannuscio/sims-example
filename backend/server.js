const express = require("express") // for backend
const cors = require("cors") // for ajax requests
const mongoose = require("mongoose") // for db
const passport = require("passport")
const passportLocal = require("passport-local").Strategy
const cookieParser = require("cookie-parser")
const bcrypt = require("bcryptjs")
const session = require("express-session")
const User = require("./models/user.js") // user model for authentication
const userRoutes = require('./routes/user')
// const { use } = require("passport")

require("dotenv").config()

const app = express()
const port = process.env.PORT || 5000

// Set up mongoDB connection
const uri = process.env.ATLAS_URI
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })

const connection = mongoose.connection
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
})

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use(express.json())

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(cookieParser(process.env.SECRET))
app.use(passport.initialize())
app.use(passport.session())

require('./passportConfig')(passport)

// Routes
app.use('/user', userRoutes)

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})





// // Initialize session
// app.use(session({
//     secret: ,
//     // cookie: { 
//     //     secure: true
//     // },
//     resave: false,
//     saveUninitialized: false
// }))

// app.use(passport.session()) // calls the deserializeUser

// app.use((req, res, next) => {
//     console.log('req.session', req.session);
//     return next();
//   });





// passport.use(User.createStrategy())

// Passport







// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())


// passport.deserializeUser(function(id, done) {
//     var userService = new UserService();
//     userService.findUnique({"_id": new ObjectID(id)}, function(err, user) {
//         console.log(user)
//         done(err, user);
//       });
//   });

// const productsRouter = require("./routes/products")
// const updatesRouter = require("./routes/updates")
// const usersRouter = require("./routes/users")

// app.use("/products", productsRouter)
// app.use("/updates", updatesRouter)
// app.use("/users", updatesRouter)

// app.get('/*', (req, res, next) => {
//     // Return React App index.html
//   });


// Authentication routes
// app.post("/login", function(req, res) {

//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     })

//     req.login(user, function(err) {
//         if (err) {
//             console.log(err)
           
//         } else {
//             passport.authenticate("local")(req, res, function(err) {
//                 console.log(req.user)
//                 // console.log(req.isAuthenticated())
//                 // return done(null, user)
//                 req.session.username = req.body.username
//                 res.json("authenticated")
//                 console.log(req.session)
                
//             })
//             // console.log('not authenticated')
//         }
//     })
// })




// app.get("/user", function(req, res) {
//     console.log('*** User request ***')
//     console.log(req.sessionStore.sessions)
//     console.log(req.user)
//     console.log(req.isAuthenticated())
//     if (req.sessionStore.sessions[0] == null) {
//         console.log('null')
//         // console.log(req.sessionStore.sessions)
//         // console.log(req.sessionStore.sessions.Object == null)
        
//         // console.log(req.sessionStore.sessions.user == null)
//     } else {
//         console.log('not null')
//         // console.log(req.sessionStore.sessions)
//         console.log(req.sessionStore.sessions[0].cookie)
//         // console.log(req.sessionStore.sessions)
//         // console.log(req.sessionStore.sessions.user == null)
//     }
// })



