const express = require('express')
const router = express.Router() // allows us to create routes with the express server
const db = require("../db/dbConfig") // access to DB
const nodemailer = require("nodemailer") // use to send emails
var format = require('pg-format') // use to dynamically query DB
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const accountSid = process.env.TWILIO_ACCOUNT_SID // account SID for twilio
const authToken = process.env.TWILIO_AUTH_TOKEN // auth token for twilio
const twilioClient = require('twilio')(accountSid, authToken) // sets up the twilio client to access for sms

router.get('/:id', async (req, res) => {

  // Gets data for a specifc order

  const query = `
  SELECT p.title as "product", ven.id as "vendor_id", ven.name, v.id as "variant_id", v.title as "variant", o.id as "order_id",
  o.subtotal as "order_subtotal", o.discount as "order_discount", o.tracking, o.total as "order_total", o.status,
  TO_CHAR(o.submitted_date, 'mm/dd/yyyy hh:mi AM') as "submitted_date", TO_CHAR(o.fulfilled_date, 'mm/dd/yyyy hh:mi AM') as "fulfilled_date", 
  TO_CHAR(o.completed_date, 'mm/dd/yyyy hh:mi AM') as "completed_date",
  oi.id as "order_item_id", oi.subtotal, oi.quantity, oi.discount, oi.total, oi.cost
  
  FROM orders o join order_items oi on o.id=oi.order_id join vendors ven on ven.id=o.vendor
  JOIN variants v on v.id=oi.variant
  JOIN products p on p.id=v.product
  WHERE o.id=$1
  ;
  ` 
  if (req.user) {
    try {
      const result = await db.query(query, [req.params.id])
      res.send(result.rows)
    } catch {
      console.log("Error: GET /orders/:id")
      res.send("Error")
    }
    
  } else {
    res.send("Not Authenticated")
  }

})

router.get('/products/:id', async (req, res) => {

  // Loads variant data for the product passed in as a parameter

  const query = `
    SELECT v.id, v.title, v.cost
    FROM products p join variants v on p.id=v.product
    WHERE p.id=$1
    ORDER BY v.title asc;
  `
  if (req.user) {

    try {
      const result = await db.query(query, [req.params.id])
      res.send(result.rows)
    } catch {
      console.log("Error: GET /orders/products/:id")
      res.send("Error")
    }

  } else {
    res.send("Not Authenticated")
  }

  
})

router.get("/", async (req, res) => {

  // Gets all orders

  const query = `
    SELECT o.id, v.name, cast(round(cast(o.subtotal as numeric), 2) as money) as "subtotal", 
    cast(round(cast(o.discount as numeric), 2) as money) as "discount", cast(round(cast(o.total as numeric), 2) as money) as "total", 
    status, coalesce(TO_CHAR(o.submitted_date, 'mm/dd/yyyy hh:mi AM'), '01/01/1969 04:20AM') as "submitted_date", coalesce(TO_CHAR(o.fulfilled_date, 'mm/dd/yyyy hh:mi AM'), '01/01/1969 04:20AM') as "fulfilled_date", 
    coalesce(TO_CHAR(o.completed_date, 'mm/dd/yyyy hh:mi AM'), '01/01/1969 04:20AM') as "completed_date"
    FROM orders o join vendors v on o.vendor=v.id
    ORDER BY o.id desc
    ;
  `
  if (req.user) {

    try {
      const result = await db.query(query)
      res.send(result.rows)
    } catch {
      console.log("Error: GET /orders/")
      res.send("Error")
    }
    
  } else {
    res.send("Not Authenticated")
  }

})

router.post("/update-item", async (req, res) => {

  // Updates an order item

  if (req.user) {

    try {

      const updates = req.body.data ? req.body.data : null
      const orderId = req.body.id
      const deletes = req.body.deletes
      const inserts = req.body.inserts

      const values = []
      updates.forEach(item => values.push([item.order_item_id, item.cost, item.quantity, item.cost * item.quantity, item.discount, (item.cost * item.quantity) - item.discount]))

      if (values.length > 0) {
        // Updates the order items based on the data passed in
        const query = format("UPDATE order_items oi set cost=cast(new.cost as float), quantity=greatest(cast(new.quantity as float)), subtotal=cast(new.subtotal as float), discount=cast(new.discount as float), total=cast(new.total as float) from (values %L) as new (id, cost, quantity, subtotal, discount, total) where oi.id=cast(new.id as int)", values)
        const result = await db.query(query)
      
      }

      if (deletes.length > 0) {
        // Delete these items from the order
        const deleteQuery = format("DELETE FROM order_items where id in (%L)", deletes)
        const deleteResult = await db.query(deleteQuery)     
      }

      if (inserts.length > 0) {
        // Insert these items into the order
        const addValues = []
        inserts.forEach(item => {
          addValues.push([orderId, item.variant_id, item.quantity, item.cost * item.quantity, item.discount, (item.cost * item.quantity) - item.discount, item.cost])
        })
        const addQuery = format('INSERT INTO order_items (order_id, variant, quantity, subtotal, discount, total, cost) VALUES %L', addValues); 
      }

      res.send("Success")
    } catch {
      console.log("Error: POST /orders/update-item")
      res.send("Error")
    }

  } else {
    res.send("Not Authenticated")
  }

})

router.post("/update", async (req, res) => {

  // Updates an order

  if (req.user) {

    try {

    const updates = req.body.data ? req.body.data : null
    const order = req.body.orderData
    const orderId = req.body.id

    const values = [orderId, order.status, order.tracking, order.discount, order.subtotal, order.subtotal - order.discount]
  
    // Updates the status and order data
    const query = format(`
      UPDATE orders
      SET status=$2, %I=NOW(), tracking=$3, discount=$4, subtotal=$5, total=$6
      WHERE id=$1
      RETURNING discount, subtotal, total
      ;
    `, `${order.status}_date`);

    const result = await db.query(query, values)
  


    if (order.status === "completed") {
      // Updates the order items data if the data is 0 or null (meaning the user hasn't updated this data)

      const orderDiscount = result.rows[0].discount ? result.rows[0].discount : 0
      const orderSubtotal = result.rows[0].subtotal
      const orderTotal = result.rows[0].total

      const newValues = []
      updates.forEach(item => {
        const weight = item.subtotal / orderSubtotal
        const weightedDiscount = orderDiscount * weight
        const discount = item.discount ? item.discount : Math.round(weightedDiscount * 100, 2) / 100
        const total = item.total ? item.total : Math.round((item.subtotal - weightedDiscount) * 100, 2) / 100
        newValues.push([item.order_item_id, discount, total])
      })

      // Updates the discount and total for the items in the order
      const newQuery = format("UPDATE order_items oi set discount=cast(new.discount as float), total=cast(new.total as float) from (values %L) as new (id, discount, total) where oi.id=cast(new.id as int)", newValues)
      const newResult = await db.query(newQuery)

      const newestValues = []
      updates.forEach(item => {
        newestValues.push([item.variant_id, item.quantity])
      })

      // Updates the quantity of the variants in the order
      const newestQuery = format("UPDATE variants v set quantity=greatest(v.quantity+cast(new.quantity as float), 0) from (values %L) as new (variant_id, quantity) where v.id=cast(new.variant_id as int)", newestValues)
      const newestRows = await db.query(newestQuery)
    }

    // All data updated successfully
    res.send("Success")

    }

    catch {
      console.log("Error: POST /orders/update")
      res.send("Error")
    }

  
} else {
  res.send("Not Authenticated")
}
})
    

router.post("/", async (req, res) => {

  // This creates a new order

  if (req.user) {

    try {
      const order = req.body.order
      const orderItems = req.body.orderItems
      const user = req.body.user
      
      const query = `
          INSERT INTO orders (vendor, subtotal, status, user_id)
          values ($1, $2, $3, $4)
          RETURNING id
      `;

      const values = [order.vendor, Math.round(order.subtotal * 100, 2) / 100, order.status, user]

      // Creates the new order in the DB
      const result = await db.query(query, values)
    
      const newValues = []
      orderItems.forEach(item => {
        newValues.push([result.rows[0].id, item.variant, Math.round(item.subtotal * 100, 2) / 100, item.quantity])
      })

    
      // Creates the order items in the DB
      const newQuery = format('INSERT INTO order_items (order_id, variant, subtotal, quantity) VALUES %L', newValues); 
      const newResult = await db.query(newQuery)
    
      // All data has been created for the order and order_items
      res.send("Success")
      
    } catch {
      console.log("Error: POST /orders/ ")
      res.send("Error")
    }

  } else {
    res.send("Not Authenticated")
  }
})


router.post("/text", async (req, res) => {

  // This sends an order text to a vendor

  if (req.user) {
    /* Example:

    Hey John!

      Hope all is well. Can you please fulfill this order for us?

        - Shake Weight - 10in: 15 units

      Thanks!
      Burman's Health Shop

    */
    const message = 
    `Hey ${req.body.contactName}!\n\nHope all is well. Can you please fulfill this order for us?\n
    ${req.body.data.map((orderItem, index) => {
        var item = orderItem.productTitle 
        if (orderItem.variantTitle) {
            item += " - " + orderItem.variantTitle
        }
        return (index === 0 ? `- ${item}: ${orderItem.quantity} units`: `  - ${item}: ${orderItem.quantity} units`)
    }).join("\n")}\n\nThanks!\nBurman's Health Shop`
    twilioClient.messages
      .create({
          body: message,
          from: '+12066274392', // change to new number and put in env variable
          to: `+1${req.body.to}`
      })
      .then(message => res.send("Success"))
      .catch(error => {
        console.log("Error sending text /orders/text")
        res.send("Error")
      })
  } else {
    res.send("Not Authenticated")
  }
})


router.post("/email", async (req, res) => {

  // This sends an order email to a vendor

  /* Example:

    Hey John!

    Hope all is well. Can you please fulfill this order for us?

      - Shake Weight - 10in: 15 units

    Thanks!
    Burman's Health Shop

  */

  if (req.user) {

    const message = 
    `Hey ${req.body.contactName}!\n\nHope all is well. Can you please fulfill this order for us?\n
    ${req.body.data.map((orderItem, index) => {
        var item = orderItem.productTitle 
        if (orderItem.variantTitle) {
            item += " - " + orderItem.variantTitle
        }
        return (index === 0 ? `- ${item}: ${orderItem.quantity} units`: `  - ${item}: ${orderItem.quantity} units`)
    }).join("\n")}\n\nThanks!\nBurman's Health Shop`


    // Creates reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Sends mail with defined transport object
    const info = transporter.sendMail({
      from: `"Burman's Health Shop" <stepan.cannuscio@gmail.com>`, // HAVE TO CHANGE THIS
      to: req.body.to,
      subject: "Burman's Health Shop Order", // Subject line
      text: message, // plain text body
    })
    .then(() => res.send("Success"))
    .catch(error => {
      console.log("Error sending email /orders/email")
      res.send("Error")
    })

    } else {
      res.send("Not Authenticated")
    }
})
 
module.exports = router;
