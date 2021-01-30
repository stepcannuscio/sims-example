const express = require('express')
const router = express.Router() // allows us to create routes with the express server
const db = require("../db/dbConfig") // access to DB

router.get('/', async (req, res) => {

  // Gets all sales

  const query = `
    SELECT TO_CHAR(s.start_date, 'mm/dd/yyyy hh:mi AM') as "start", TO_CHAR(s.end_date, 'mm/dd/yyyy hh:mi AM') as "end", s.all_day as "allDay", s.title, s.description, v.id, v.name
    FROM sales s join vendors v on s.vendor=v.id
    ; 
  ` 
  if (req.user) {
    try {
      const result = await db.query(query)
      res.send(result.rows)
    } catch {
      console.log("Error: GET /sales/")
      res.send("Error")
    }
    
  } else {
    res.send("Not Authenticated")
  }
})


router.post("/", async (req, res) => {

  // Creates a sale

  const sale = req.body.sale

  const query = `
      INSERT INTO sales (start_date, end_date, all_day, title, description, vendor, user_id)
      values ($1, $2, $3, $4, $5, $6, $7)
  `;

  if (req.user) {

    try {
      const result = await db.query(query, [sale.start_date, sale.end_date, sale.all_day, sale.title, sale.description, sale.vendor, sale.user_id])
      res.send("Success")
    } catch {
      console.log("Error: POST /sales/")
      res.send("Error")
    }
    
  } else {
    res.send("Not Authenticated")
  }
})
    
module.exports = router;
