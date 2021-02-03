const { Pool } = require('pg') // This allows us to create a pool connection to the DB
const path = require("path")
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  // We're deciding how to query when db.query is called in the routes
  query: (text, params) => pool.query(text, params),
}