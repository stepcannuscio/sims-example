const axios = require('axios')
var format = require('pg-format') // use to dynamically query DB
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const db = require("../db/dbConfig") // access to DB
const shopifyKey = process.env.SHOPIFY_KEY;
const shopifyUrl = process.env.SHOPIFY_URL;
const accountSid = process.env.TWILIO_ACCOUNT_SID // account SID for twilio
const authToken = process.env.TWILIO_AUTH_TOKEN // auth token for twilio
const twilioClient = require('twilio')(accountSid, authToken) // sets up the twilio client to access for sms
const nodemailer = require("nodemailer") // use to send emails

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const WooCommerce = new WooCommerceRestApi({
  url: "https://burmanshealthshop.com",
  consumerKey: process.env.WOO_KEY,
  consumerSecret: process.env.WOO_SECRET,
  version: 'wc/v3'
});


async function getLastUpdate() {
    // Get last update from database

    query = `
        SELECT date
        FROM updates
        ORDER BY date desc 
        limit 1
    ;
    `;
    const result = await db.query(query)
    const lastUpdate = result.rows[0].date
    

    // console.log(result.rows)

//     idQuery = `
//     SELECT source_id
//     FROM purchases
//     WHERE source='Woo'
//     ORDER BY source_id desc 
//     limit 1
// ;
// `;

//     const idResult = await db.query(idQuery)
//     const lastId = idResult.rows[0].source_id



    // MAKE SURE YOU HAVE A VENDOR, PRODUCT, VARIANT, AND PURCHASE WITH ID OF -999

    // insert into vendors (id, name) values (-999, 'No Vendor');
    // insert into products (id, title) values (-999, 'No Product');
    // insert into variants (id, title) values (-999, 'No Variant');
    // insert into purchases (id, source) values (-999, 'No Purchase');

    // const lastUpdate = new Date('2018-01-01T00:00:00.264')
    // const lastUpdate = new Date('2020-09-01T00:00:00.264')

    const endpoint = 'products.json'
    var options = "?published_at_min="+lastUpdate.toISOString()+"&limit=250&fields=id,title,vendor,image,variants&order=id%20asc";

    var url = 'https://' + shopifyKey + shopifyUrl + endpoint + options;

    // console.log(lastUpdate)

    // console.log(lastUpdate.toISOString())

    pullShopifyProductData(url, 0, 0, lastUpdate)

    // const shopifyProducts = async() => {
    //     await pullShopifyProductData(url, 0, 0)
    // }

    // const shopifyPurchases = async() => {
    //     options = "?processed_at_min="+lastUpdate.toISOString()+"&fields=id, created_at, total_price, total_discounts, subtotal_price, line_items&order=id%20asc";
    //     url = 'https://' + shopifyKey + shopifyUrl + 'orders.json' + options;
    //     await pullShopifyPurchaseData(url, 0, 0, lastUpdate.toISOString())
    // }
    
    // const wooPurchases = async() => {
    //     const issueItems = []
    //     await pullWooPurchaseData(1, 0, 0, lastUpdate.toISOString(), issueItems)
    // }
    

    // shopifyProducts()
    // shopifyPurchases()
    // wooPurchases()


}

// Pull product data
function pullShopifyProductData(url, dataUpdated, subDataUpdated, date) {
    
    // Make request to Shopify API
    axios.get(url).then(res => {
      const products = [];
      const variants = []
  
      // Get all relevant product data
      res.data.products.forEach(product => {
        products.push({
          shopify_id: product.id,
          title: product.title,
          vendor: product.vendor.toLowerCase(),
          image: product.image ? product.image.src : null
        })
  
        // Loop through product's variants
        product.variants.forEach(variant => {
          const newVariant = {
            shopify_id: variant.id,
            title: variant.title,
            price: variant.price,
            quantity: 0,
            inventoryId: variant.inventory_item_id,
            product: product.id.toString()
          }
          variants.push(newVariant)
          
        })
      })
    //   console.log(products)
      if (products.length > 0) {
        updateProductData(products, {}, "products", variants, res.headers.link, dataUpdated, subDataUpdated, date)
      } else {
        console.log("No new products")
        const query = `
            INSERT INTO updates (source, data_updated, subdata_updated, type)
            VALUES ('Shopify', '0', '0', 'Insert Product Data')
        `;
        const result = db.query(query)

        // I added &financial_status=paid so hopefully that works
        options = "?processed_at_min="+date.toISOString()+"&limit=250&financial_status=paid&fields=id, created_at, total_price, total_discounts, subtotal_price, line_items&order=id%20asc";
        url = 'https://' + shopifyKey + shopifyUrl + 'orders.json' + options;
        pullShopifyPurchaseData(url, 0, 0, date, [])

      }
    })   
  }
  
  
async function updateProductData(array, costDict, type, variants, link, dataUpdated, subDataUpdated, date) {

    const values = []
    // const values2 = []

    for (const item of array) {

        if (type === "products") {
            values.push(item.vendor)
        } else if (type === "variants") {
            values.push(item.product)
        } 
        
    }

    var query = ""

    if (type === "products") {
        query = format('SELECT id, name FROM vendors WHERE name in (%L)', values); 
    } else if (type === "variants") {
        query = format('SELECT id, shopify_id FROM products WHERE shopify_id in (%L)', values); 
    } 
    

    
    // if (type === "products") {
    //     console.log(query)
    // }
    
    const result = await db.query(query)

    // if (type === "products") {
    //     console.log(result.rows)
    // }
  

    const newArray = []
    const itemDict = {}

    if (result.rows.length > 0) {
        result.rows.forEach(item => {

            if (type === "products") {
                itemDict[item.name] = item.id
            } else if (type === "variants") {
                itemDict[item.shopify_id] = item.id
            }
            
        })    
    }

    // console.log("<=========================>")
    // console.log(itemDict)
    // console.log("<=========================>")
  
  
    for (const item of array) {

        if (type === "products") {
            item.vendor = itemDict[item.vendor] ? itemDict[item.vendor] : -999;
        } else if (type === "variants") {
            item.cost = costDict[item.inventoryId] ? costDict[item.inventoryId] : null
            item.product = itemDict[item.product.toString()] ? itemDict[item.product.toString()] : -999;
        }

        newArray.push(item)
    }

    insertProductData(newArray, type, variants, link, dataUpdated, subDataUpdated, date)

    // var query = ""

    // for (const item of array) {


    //     var values = []
    

    //     if (type === "products") {
    //         query = `
    //             SELECT *
    //             FROM vendors
    //             WHERE name=$1
    //         `;
    //         values = [item.vendor.replace(/'/g, "''")]
        
    //     } else if (type === "variants") {
    //     // Update product ID
    //         query = `
    //             SELECT *
    //             FROM products
    //             WHERE shopify_id=$1
    //         `;
    //         values = [item.productId]
    //     }
    //     const result = await db.query(query, values)
    
    //     if (type === "products") {
    //         item.vendor = result.rows.length > 0 ? result.rows[0].id : -999; // SET THIS ID TO SAY "NO VENDOR IN SIMS THAT MATCHES THIS PRODUCT"
    //     } else if (type === "variants") {
    //         item.productId = result.rows.length > 0 ? result.rows[0].id : -999;
    //     }
    
    //     newArray.push(item)
    //     if (newArray.length === array.length) {
    //         insertProductData(newArray, type, variants, link, dataUpdated, subDataUpdated, date)
    //     }
    // }

  
}
  
  
  async function insertProductData(data, type, variants, link, dataUpdated, subDataUpdated, date) {

    var query = ""

    const values = []
      
    data.forEach(item => {

        if (type === "products") {
            values.push([item.shopify_id, item.title.replace(/'/g, "''"), item.vendor, item.image])
        } else if (type === "variants") {
            values.push([item.shopify_id, item.title.replace(/'/g, "''"), item.price, item.quantity, item.product, item.cost])
        }

    })

    if (type === "products") {
        query = format('INSERT INTO products (shopify_id, title, vendor, image) VALUES %L', values); 
    } else if (type === "variants") {
        query = format('INSERT INTO variants (shopify_id, title, price, quantity, product, cost) VALUES %L', values); 
    }
    const result = await db.query(query)
    console.log(`Successfully inserted ${values.length} ${type} into DB`)

    if (type === "products") {
        getCost(variants, link, dataUpdated + values.length, subDataUpdated, date)
    } else if (type === "variants") {
        checkProductPages(link, dataUpdated, subDataUpdated + values.length, date)
    }
  }

  async function getCost(variants, link, dataUpdated, subDataUpdated, date) {
    const ids = []
    variants.forEach(variant => {
      ids.push(variant.inventoryId)
    })
    // console.log(ids.length)
    const costDict = {}
    axios.get('https://' + shopifyKey + shopifyUrl + '/inventory_items.json?limit=250&ids=' + ids)
      .then(res => {
        res.data.inventory_items.forEach(item => {
          if (item.cost) {
            costDict[item.id] = item.cost
          } else {
            costDict[item.id] = 0
          }
        })
        updateProductData(variants, costDict, "variants", [], link, dataUpdated, subDataUpdated, date)
      })
      .catch(err => console.log(err))
  }
  
  
  async function checkProductPages(link, dataUpdated, subDataUpdated, date) {
  
    // Check to see if more pages to load
    const links = link ? link.split(',') : []
  
    if (links.length > 1) {
      // Loading the middle pages (still more data to load)
      const nextPage = links[1].split(';')[0].slice(2,-1);
      const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
      pullShopifyProductData(newUrl, dataUpdated, subDataUpdated, date);
    } else {
      // Loading the first page (still more data to load)
      if (link && link.includes('next')) {
        const nextPage = link.split(';')[0].slice(1,-1);
        const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
        pullShopifyProductData(newUrl, dataUpdated, subDataUpdated, date);
  
        } else {
        // Loaded last page (done) => save data

        // amount_data refers to the outer data that was inserted while amount_subdata
        // refers to the inner data 
        // i.e. if it's product data, the outer data is products and the inner data is variants
        // if it's purchase data, the outer data is purchases and the inner data is purchase_items

          const query = `
            INSERT INTO updates (source, data_updated, subdata_updated, type) 
            VALUES ('Shopify', $1, $2, 'Insert Product Data')
          `;

          const result = await db.query(query, [dataUpdated, subDataUpdated])
          console.log(`Successfully logged Shopify update into DB`)

          console.log(date)

          options = "?processed_at_min="+date.toISOString()+"&fields=id, created_at, total_price, total_discounts, subtotal_price, line_items&order=id%20asc";
          url = 'https://' + shopifyKey + shopifyUrl + 'orders.json' + options;
          pullShopifyPurchaseData(url, 0, 0, date, [])
        }
    }
  }


// const axios = require("axios");
// const mongoose = require("mongoose");
// const path = require('path')

// const Update = require('../models/update');
// const Product = require('../models/product');
// const Order = require("../models/order");


async function pullShopifyPurchaseData(url, dataUpdated, subDataUpdated, date, issueItems) {
  // Make request to Shopify API
  axios.get(url)
    .then(res => {
        // console.log(res.data.orders)

      const purchases = [];
      const purchaseItems = [];

      // Get all relevant product data
      res.data.orders.forEach(purchase => {
        // console.log(purchase)

        const newOrder = {
            date: purchase.created_at,
            total: purchase.total_price,
            discount: purchase.total_discounts,
            subtotal: purchase.subtotal_price,
            source: "Shopify",
            sourceId: purchase.id
        }
        purchases.push(newOrder)

        // Get all data for items in order
        purchase.line_items.forEach(item => {
            const newItem = {
                purchase: purchase.id,
                variant: item.variant_id,
                total: item.price,
                discount: item.total_discount,
                subtotal: Math.round((parseFloat(item.price) + parseFloat(item.total_discount))*100) / 100,
                quantity: item.quantity
            }

            if (item.variant_id) {
                purchaseItems.push(newItem)
            } else {
                issueItems.push(`${purchase.id} - ${item.title}`)
            }

            
        })
      });

      if (purchases.length > 0) {
        insertPurchaseData(purchases, "purchases", purchaseItems, res.headers.link, dataUpdated, subDataUpdated, "Shopify", 0, date, issueItems)
      } else {
        console.log("No new Shopify purchases")
        const query = `
            INSERT INTO updates (source, data_updated, subdata_updated, type)
            VALUES ('Shopify', '0', '0', 'Insert Purchase Data')
        `;
        const result = db.query(query)

        console.log("Pulling Woo data...")
        pullWooPurchaseData(1, 0, 0, date, issueItems)
        // pullWooPurchaseData(1, 0, date)
      }

      
      // updateData(client, purchases, {}, "purchases", purchaseItems, res.headers.link, itemsUpdated)
    })
  }



  async function pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems) {
    // Set options for the payload

    const newDate = new Date(date)

    const timeAdjusted = new Date(newDate.setHours(newDate.getHours()-5))
    // const today = new Date()
    const lastWeek = new Date(newDate.setDate(newDate.getDate()-7))

    // console.log(date)



    const data = {
        status: "completed",
        after: lastWeek.toISOString().slice(0,-1), // '2021-01-16T16:16:00.000'
        per_page: "100",
        orderby: "date",
        order: "asc",
        page: pageNum
    }

    // console.log(data)
  
    WooCommerce.get("orders", data)
    .then((res) => {

        // console.log(res.data)
  
      const purchases = [];
      const purchaseItems = [];
  
      res.data.forEach(purchase => {

        // console.log(date)
        // console.log(date.toISOString())

        // console.log(`${purchase.date_completed} vs ${timeAdjusted.toISOString().slice(0,-1)}`)
        // console.log(`${purchase.date_completed} vs 2021-01-18T15:45:00.000}`)
        
        // if (purchase.date_completed >= timeAdjusted.toISOString().slice(0,-1)) {
        if (purchase.date_completed >= timeAdjusted.toISOString().slice(0,-1)) {
            // console.log(`${purchase.date_completed} vs ${date.toISOString().slice(0,-1)}`)
        
            // Get all relevant order data
              const newOrder = {
                  date: purchase.date_completed,
                  total: purchase.total,
                  discount: purchase.discount_total,
                  subtotal: Math.round((parseFloat(purchase.total) + parseFloat(purchase.discount_total) - parseFloat(purchase.total_tax) - parseFloat(purchase.shipping_total)) * 100) / 100,
                  source: "Woo",
                  sourceId: purchase.id
              }
              purchases.push(newOrder)
        
                // Get all data for items in order
              purchase.line_items.forEach(item => {
      
                  // Don't log purchase data for variants w/o a SKU b/c won't be able to find a product match
                  if (item.sku === "") {
                      if (!issueItems.includes(item.product_id)) {
                          issueItems.push(item.product_id)
                      }
                      
                  } else {
                      const newItem = {
                          purchase: purchase.id,
                          variant: item.sku,
                          total: item.total,
                          subtotal: item.subtotal,
                          discount: Math.round((parseFloat(item.subtotal) - parseFloat(item.total))*100) / 100,
                          quantity: item.quantity
                      }
                      purchaseItems.push(newItem)
                  }
            
               
      
               
                
              })
         
        }

       
      })
      
  
      if (purchases.length > 0) {
          insertPurchaseData(purchases, "purchases", purchaseItems, res.headers.link, dataUpdated, subDataUpdated, "Woo", pageNum, date, issueItems)
      } else if (res.data.length > 0) {
          // There is data but the date completed isn't greater than the last update
          // need to continue looping to see if there's more data to compare

          pageNum++;
          pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems);

      } else {
          console.log("No new Woo purchases")
          const query = `
              INSERT INTO updates (source, data_updated, subdata_updated, type)
              VALUES ('Woo', '0', '0', 'Insert Purchase Data')
          `;
          const result = db.query(query)
          console.log(`All data uploaded between: ${new Date(date)} and ${new Date()}`)
        }
  
        
     
        // updateData(client, purchases, {}, "purchases", purchaseItems, res.headers.link, itemsUpdated)
    })
    .catch("error", (err) => {
      console.log("Error: " + err.message);
    });
  
  }
  


  async function insertPurchaseData(data, type, purchaseItems, link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems) {

    const values = []
    const variantDict = {}
      
    data.forEach(item => {

        if (type === "purchases") {
            values.push([item.date, item.sourceId, item.total, item.subtotal, item.discount, item.source])
        } else if (type === "purchaseItems") {
            values.push([item.purchase, item.variant, item.total, item.quantity, item.discount])
            if (item.variant in variantDict) {
                variantDict[item.variant] += item.quantity;
              } else {
                variantDict[item.variant] = item.quantity;
              }
        }

    })

    if (type === "purchases") {
        query = format('INSERT INTO purchases (date, source_id, total, subtotal, discount, source) VALUES %L', values); 
    } else if (type === "purchaseItems") {
        query = format('INSERT INTO purchase_items (purchase, variant, total, quantity, discount) VALUES %L', values); 
    }

    // console.log(query)

    

    if (values.length > 0) {
        // console.log('dis where we screwing up - 581')
        const result = await db.query(query)

        console.log(`Successfully inserted ${values.length} ${type} into DB from ${source}`)
    
    }


    var variantQuery = ""
    const variants = Object.entries(variantDict)
    // console.log('variantDict - insertPurchaseData:')
    // console.log(variantDict)
    // console.log('variants - insertPurchaseData:')
    // console.log(variants)
    if (type === "purchaseItems") {

        if (variants.length > 0) {
            // console.log('dis where we screwing up - 598')
            variantQuery = format("UPDATE variants v set quantity=greatest(cast(v.quantity as float) - cast(new.quantity as float), 0) from (values %L) as new (id, quantity) where v.id=cast(new.id as int)", variants)
            const variantResult = await db.query(variantQuery)
            console.log(`Successfully updated ${variants.length} variants into DB from ${source}`)
        }
 
    }


    // console.log(values)
    

    if (type === "purchases") {
        updatePurchaseData(purchaseItems, "purchaseItems", [], link, dataUpdated + values.length, subDataUpdated, source, pageNum, date, issueItems)
    } else if (type === "purchaseItems") {
        checkPurchasePages(link, dataUpdated, subDataUpdated + values.length, source, pageNum, date, issueItems)   
    }
}


  async function updatePurchaseData(array, type, variants, link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems) {

    const values1 = []
    const values2 = []

    for (const item of array) {
        values1.push(item.variant)
        values2.push(item.purchase)
    }

    // console.log('values1:')
    // console.log(values1)
    // console.log('dis where we screwing up - 630')


    const query1 = format('SELECT id, shopify_id FROM variants WHERE shopify_id in (%L)', values1); 
    const query2 = format('SELECT id, source_id FROM purchases WHERE source_id in (%L)', values2); 

    const newArray = []
    const variantDict = {}
    const purchaseDict = {}

    if (values1.length > 0) {
        const result1 = await db.query(query1)

        if (result1.rows.length > 0) {
            result1.rows.forEach(variant => {
                variantDict[variant.shopify_id] = variant.id
            })    
        }
    
    }

    if (values2.length > 0) {
        const result2 = await db.query(query2)

        if (result2.rows.length > 0) {
            result2.rows.forEach(purchase => {
                purchaseDict[purchase.source_id] = purchase.id
            })    
        }
    }




    // console.log(result1.rows)
    // console.log(result2.rows)

 
    // console.log('variantDict - updatePurchaseData:')
    // console.log(variantDict)
    

  
  
    for (const item of array) {
        item.variant = variantDict[item.variant] ? variantDict[item.variant] : -999;
        item.purchase = purchaseDict[item.purchase] ? purchaseDict[item.purchase] : -999;

        newArray.push(item)
    }

    // console.log('newArray - updatePurchaseData:')
    // console.log(newArray)


    insertPurchaseData(newArray, type, variants, link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems)


    // for (const item of array) {

    //     // console.log(item)

    //     var values = []
    


    //         const query1 = `
    //         SELECT *
    //         FROM variants
    //         WHERE shopify_id=$1
    //         `;
    //         const values1 = [item.variant]

    //         const result1 = await db.query(query1, values1)
        

    //     // Update product ID
    //         const query2 = `
    //             SELECT *
    //             FROM purchases
    //             WHERE source_id=$1
    //         `;
    //         values2 = [item.purchase]


    //         // console.log(query)
    //         const result2 = await db.query(query2, values2)
        



    //     console.log('printing results')
    //     console.log(result1.rows)
    //     console.log(result2.rows)
    //     item.variant = result1.rows.length > 0 ? result1.rows[0].id : -999;
    //     item.purchase = result2.rows.length > 0 ? result2.rows[0].id : -999;

    
    //     newArray.push(item)
    //     if (newArray.length === array.length) {

    //             insertPurchaseData(newArray, type, variants, link, dataUpdated, subDataUpdated, source, pageNum, date)

            
    //     }
    // }
  }





  async function checkPurchasePages(link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems) {
  
    // Check to see if more pages to load
    const links = link ? link.split(',') : []
  
    if (links.length > 1) {

        if (source === "Shopify") {
            const nextPage = links[1].split(';')[0].slice(2,-1);
            const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
            pullShopifyPurchaseData(newUrl, dataUpdated, subDataUpdated, date, issueItems);
          } else if (source === "Woo") {
            pageNum++;
            pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems);
          }
    
    } else {
        // Loading the first page (still more data to load)
        if (link && link.includes('next')) {
    
            // console.log(link)
            if (source === "Shopify") {
                const nextPage = link.split(';')[0].slice(1,-1);
                const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
                pullShopifyPurchaseData(newUrl, dataUpdated, subDataUpdated, date, issueItems);
            } else {
                pageNum++;
                pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems);
            }
            
        } else {
            // Loaded last page (done) => save data
            // console.log('dis where we screwing up - 758')
              const query = `
                INSERT INTO updates (source, data_updated, subdata_updated, type)
                VALUES ($1, $2, $3, 'Insert Purchase Data')
              `;
    
              const result = await db.query(query, [source, dataUpdated, subDataUpdated])
              console.log(`Successfully inserted ${source} update into DB`)

              if (source === "Woo") {
                console.log("<===========================================>")
                console.log(`All data uploaded between: ${new Date(date)} and ${new Date()}`)
                console.log("<===========================================>")

                if (issueItems.length > 0) {

                    console.log(issueItems.length + " Issue Items")
    
                    const message = `If only a number is shown, need to go to Woo and search by that number to find the product that needs a SKU added.\nIf the product name is included, need go to Shopify and search by the order number to find the item with no variant ID:\n\n${issueItems.map(item => item).join("\n")}`
    
    
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
                      from: '"ORDER BOT" <stepan.cannuscio@gmail.com>',
                      to: "stepan.cannuscio@gmail.com", // maybe change to someone else's number (probs Ted's)
                      subject: "Update SKUs", // Subject line
                      text: message, // plain text body
                    })
                    .then(() => console.log("Email Sent"))
                    .catch(error => console.log(error))
    
                    // const message = 
                    // `Need to add SKUS in Woo for these products/variants:\n
                    // ${issueItems.map(item => item).join("\n")}`
                    // twilioClient.messages
                    //   .create({
                    //       body: message,
                    //       from: '+12066274392', // change to new number and put in env variable
                    //       to: `+14848885912` // maybe change to someone else's number (probs ted's)
                    //   })
                    //   .then(message => console.log("SMS sent"))
                    //   .catch(error => console.log(error))
                

                }
              
              } else if (source === "Shopify") {
                  console.log("Pulling Woo data...")
                  pullWooPurchaseData(1, 0, 0, date, issueItems)
                  
              }

             

            
            }
        }
    }
    




//   // Initial Shopify data to load into db
// const shopifyKey = process.env.SHOPIFY_KEY;
// const shopifyUrl = process.env.SHOPIFY_URL;
// const endpoint = 'orders.json'
// const options = "?fields=id, created_at,total_price,total_discounts,line_items"
// var url = 'https://' + shopifyKey + shopifyUrl + endpoint + options;

// pullAllShopifyPurchaseData(client, url, 0)

// Connect to Woo API

// pullWooPurchaseData(1, 0)



// async function pullData() {
//     const updated = await getLastUpdate()
//     console.log(updated)
// }
// 2020-12-03T16:16:55
// const date = new Date('2020-12-03T16:16:55.000')
// pullWooPurchaseData(1, 0, 0, date.toISOString(), [])

// getLastUpdate()


module.exports = getLastUpdate;
  
