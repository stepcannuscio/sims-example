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
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/order')

require("dotenv").config()

const app = express()
const port = process.env.PORT || 5000


// <---> DB - EDIT BELOW

// Set up mongoDB connection
const uri = process.env.ATLAS_URI
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })

const connection = mongoose.connection
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
})

//  <---> DB - EDIT ABOVE

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
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})