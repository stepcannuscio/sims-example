const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const Update = require('../models/update');
const Order = require("../models/order");
const mongoose = require("mongoose")

// Connect to Woo API
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

// Set up mongoDB connection
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })


const WooCommerce = new WooCommerceRestApi({
  url: "https://burmanshealthshop.com",
  consumerKey: process.env.WOO_KEY,
  consumerSecret: process.env.WOO_SECRET,
  version: 'wc/v3'
});

getAllWooOrderData(0)

function getAllWooOrderData(ordersUpdated) {
    // Set options for the payload
    const data = {
       status: "completed",
       per_page: "50",
     };

     const orders = []

     WooCommerce.get("orders", data)
     .then((res) => {
        //  console.log(res.data)
       res.data.forEach(order => {
           
        const newOrder = {
            purchaseDate: order.date_created,
            totalPrice: order.total,
            totalDiscount: order.discount_total,
            source: "Woo",
            itemsOrdered: []
        }

        // Get all data for items in order
        order.line_items.forEach(item => {
            const newItem = {
                // productId: item.product_id,
                // variantId: item.variation_id,
                // price: item.total,
                // discount: item.total_discount,
                id: item.sku,
                quantity: item.quantity
            }

            newOrder.itemsOrdered.push(newItem)
        })
        
        // Add order to array
        orders.push(newOrder)

      });

    //   console.log(orders)
    //   console.log(orders.length)

            // Use Order model to save order and its data into DB
            orders.forEach(order => {
                const newOrder = new Order({
                    purchaseDate: order.purchaseDate,
                    totalPrice: order.totalPrice,
                    totalDiscount: order.totalDiscount,
                    source: order.source,
                    itemsOrdered: order.itemsOrdered
                })
                newOrder.save()
                ordersUpdated++
                console.log(order.purchaseDate)
            })
            var dt = new Date();
            dt.setHours(dt.getHours()) 
            dt.setMinutes(dt.getMinutes())

            const update = new Update({
                date: dt,
                source: "Woo",
                type: "Order Data",
                amountUpdated: ordersUpdated
            })

            update.save();

       })
    

 .catch("error", (err) => {
   console.log("Error: " + err.message);
 });
}