// Modules
const express = require("express") // for server
const cors = require("cors") // for ajax requests
const passport = require("passport") // for authentication
const cookieParser = require("cookie-parser") // for parsing cookies
const session = require("express-session") // for session
const cron = require('node-cron') // for scheduling tasks

// Routes
const userRoutes = require('./routes/users') 
const productRoutes = require('./routes/products')
const purchaseRoutes = require('./routes/purchases')
const saleRoutes = require('./routes/sales')
const orderRoutes = require('./routes/orders')
const vendorRoutes = require('./routes/vendors')
// const updateRoutes = require('./routes/updates')

// Config files 
const db = require("./db/dbConfig") // access to DB
require('./auth/passportConfig')(passport) // access to authentication middleware
require("dotenv").config()
const getLastUpdate = require('./tasks/pullData');

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors({
    origin: process.env.CLIENT_PORT,
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

// Routes
app.use('/user', userRoutes)
app.use('/products', productRoutes)
app.use('/purchases', purchaseRoutes)
app.use('/sales', saleRoutes)
app.use('/orders', orderRoutes)
app.use('/vendors', vendorRoutes)
// app.use('/updates', updateRoutes)

cron.schedule('0 9-19 * * *', () => {
  console.log('running a task every hour') // runs it at the start of every hour b/t 9am and 7pm (max business hours)
  getLastUpdate()
});

// getLastUpdate()


// Sunday	11AM–3PM
// Monday	9AM–7PM
// Tuesday	9AM–7PM
// Wednesday	9AM–7PM
// Thursday	9AM–7PM
// Friday	9AM–7PM
// Saturday	9AM–6PM


// getLastUpdate()

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})