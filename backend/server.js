// Modules
const express = require("express") // for server
const passport = require("passport") // for authentication
const cookieSession = require("cookie-session")
const path = require('path') // for navigating directory

// Routes
const userRoutes = require('./routes/users') 
const productRoutes = require('./routes/products')
const purchaseRoutes = require('./routes/purchases')
const saleRoutes = require('./routes/sales')
const orderRoutes = require('./routes/orders')
const vendorRoutes = require('./routes/vendors')

// Config files 
const db = require("./db/dbConfig") // access to DB
require('./auth/passportConfig')(passport) // access to authentication middleware
require("dotenv").config()

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(express.json())

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  secret: process.env.SECRET,
  name: 'session',
  keys: ['key1', 'key2'],
  cookie: { maxAge: 60000 }
}))

app.use(passport.initialize())
app.use(passport.session())

// Serve the static files from the React app
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Routes
app.use('/api/user', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/vendors', vendorRoutes)

// Sends all requests to the react app that aren't api routes (defined above)
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
 });

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})