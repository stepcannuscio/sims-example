const express = require("express") // for backend
const cors = require("cors") // for ajax requests
const mongoose = require("mongoose") // for db
const session = require("express-session") // for passport sessions
const passport = require("passport") // for passport 
// const passportLocalMongoose = require("passport-local-mongoose") // for passport
const User = require("./models/user.model.js") // user model for authentication

require("dotenv").config()

const app = express()
const port = process.env.PORT || 5000

// Set up middleware
app.use(cors())
app.use(express.json())

// Initialize session
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// Set up mongoDB connection
const uri = process.env.ATLAS_URI
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })

const connection = mongoose.connection
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
})

// // Use passport local strategy with user model
// userSchema.plugin(passportLocalMongoose)

// const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

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
app.post("/login", function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err) {
        if (err) {
            console.log(err)
           
        } else {
            passport.authenticate("local")(req, res, function(err) {
                console.log(req.user)
                res.json("authenticated")
            })
            // console.log('not authenticated')
        }
    })
})



app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})
