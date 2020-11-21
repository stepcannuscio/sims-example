const axios = require("axios");
const mongoose = require("mongoose");
const path = require('path')

const Update = require('../models/update');
const Product = require('../models/product');
const Order = require("../models/order");

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

// Set up mongoDB connection
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })


function getAllShopifyOrderData(url, ordersUpdated) {
  console.log(url)

  // Make request to Shopify API
  axios.get(url)
    .then(res => {
      const orders = [];

      // Get all relevant product data
      res.data.orders.forEach(order => {
        console.log(order)

        const newOrder = {
            purchaseDate: order.created_at,
            totalPrice: order.total_price,
            totalDiscount: order.total_discounts,
            source: "Shopify",
            itemsOrdered: []
        }

        // Get all data for items in order
        order.line_items.forEach(item => {
            const newItem = {
                // productId: item.product_id,
                // variantId: item.variant_id,
                id: item.variant_id,
                // price: item.price,
                // discount: item.total_discount,
                quantity: item.quantity
            }

            newOrder.itemsOrdered.push(newItem)
        })
        
        // Add order to array
        orders.push(newOrder)

      });

      // Use Order model to save order and its data into DB
      orders.forEach(order => {
          const newOrder = new Order({
              purchaseDate: order.purchaseDate,
              totalPrice: order.totalPrice,
              source: order.source,
              totalDiscount: order.totalDiscount,
              itemsOrdered: order.itemsOrdered
          })
          newOrder.save()
          ordersUpdated++
          console.log(order.purchaseDate)
      })

      const link = res.headers.link
      // Check to see if more pages to load
      const links = link.split(',');
     

      if (links.length > 1) {
        // Loading the middle pages (still more data to load)
        const nextPage = links[1].split(';')[0].slice(2,-1);
        const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
        console.log(newUrl);
        getAllOrderProductData(newUrl, productsUpdated);
      } else {
        // Loading the first page (still more data to load)
        if (link.includes('next')) {
          const nextPage = link.split(';')[0].slice(1,-1);
          const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
          console.log(newUrl);
          // getAllOrderProductData(newUrl, productsUpdated);

          // UNCOMMENT ABOVE AND DELETE BELOW TO LOAD ALL DATA
          var dt = new Date();
          dt.setHours(dt.getHours()) 
          dt.setMinutes(dt.getMinutes())

          const update = new Update({
              date: dt,
              source: "Shopify",
              type: "Order Data",
              amountUpdated: ordersUpdated
          })

          update.save();

          console.log('Finished!!!')
        } else {
          // Loaded last page (done) => save data
          var dt = new Date();
          dt.setHours(dt.getHours()) 
          dt.setMinutes(dt.getMinutes())

          const update = new Update({
              date: dt,
              source: "Shopify",
              type: "Order Data",
              amountUpdated: ordersUpdated
          })

          update.save();

          console.log('Finished!!!')
          
        }
      }
    })
    .catch("error", (err) => {
      console.log("Error: " + err.message);
    });
}

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

// Initial Shopify data to load into db
const shopifyKey = process.env.SHOPIFY_KEY;
const shopifyUrl = process.env.SHOPIFY_URL;
const endpoint = 'orders.json'
const options = "?fields=created_at,total_price,total_discounts,line_items"
var url = 'https://' + shopifyKey + shopifyUrl + endpoint + options;

getAllShopifyOrderData(url, 0)

// Connect to Woo API
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const WooCommerce = new WooCommerceRestApi({
  url: "https://burmanshealthshop.com",
  consumerKey: process.env.WOO_KEY,
  consumerSecret: process.env.WOO_SECRET,
  version: 'wc/v3'
});

getAllWooOrderData(0)
