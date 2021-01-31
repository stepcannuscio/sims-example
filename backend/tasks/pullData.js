const axios = require('axios')
var format = require('pg-format') // use to dynamically query DB
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const db = require("../db/dbConfig") // access to DB
const shopifyKey = process.env.SHOPIFY_KEY;
const shopifyUrl = process.env.SHOPIFY_URL;
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

  try {
    const result = await db.query(query)
    const lastUpdate = result.rows[0].date
    const endpoint = 'products.json'
    var options = "?published_at_min="+lastUpdate.toISOString()+"&limit=250&fields=id,title,vendor,image,variants&order=id%20asc";
    var url = 'https://' + shopifyKey + shopifyUrl + endpoint + options;
    pullShopifyProductData(url, 0, 0, lastUpdate)
  } catch {
    console.log("Error pullData/getLastUpdate")
  }


  // MAKE SURE YOU HAVE A VENDOR, PRODUCT, VARIANT, AND PURCHASE WITH ID OF -999

  // insert into vendors (id, name) values (-999, 'No Vendor');
  // insert into products (id, title) values (-999, 'No Product');
  // insert into variants (id, title) values (-999, 'No Variant');
  // insert into purchases (id, source) values (-999, 'No Purchase');

  // const lastUpdate = new Date('2018-01-01T00:00:00.264')
  // const lastUpdate = new Date('2020-09-01T00:00:00.264')


}


function pullShopifyProductData(url, dataUpdated, subDataUpdated, date) {

  // Pull product data
    
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
    if (products.length > 0) {
      // There are new products so need to flow through the updating process
      updateProductData(products, {}, "products", variants, res.headers.link, dataUpdated, subDataUpdated, date)
    } else {
      // No new products so just mark in DB and go to getting purchase data
      console.log("No new products")
      const query = `
          INSERT INTO updates (source, data_updated, subdata_updated, type)
          VALUES ('Shopify', '0', '0', 'Insert Product Data')
      `;
      const result = db.query(query)

      options = "?processed_at_min="+date.toISOString()+"&limit=250&financial_status=paid&fields=id, created_at, total_price, total_discounts, subtotal_price, line_items&order=id%20asc";
      url = 'https://' + shopifyKey + shopifyUrl + 'orders.json' + options;
      pullShopifyPurchaseData(url, 0, 0, date, [])

    }
  })   
}
  
  
async function updateProductData(array, costDict, type, variants, link, dataUpdated, subDataUpdated, date) {

  /* 
    Updates the product data so that the product has a vendor that matches one in DB
    OR
    Updates the variant data so that the variant has a product that matches one in DB
  */ 
  

  const values = []

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
    
  const result = await db.query(query)

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
  
  for (const item of array) {
    if (type === "products") {
        item.vendor = itemDict[item.vendor] ? itemDict[item.vendor] : -999;
    } else if (type === "variants") {
        item.cost = costDict[item.inventoryId] ? costDict[item.inventoryId] : null
        item.product = itemDict[item.product.toString()] ? itemDict[item.product.toString()] : -999;
    }
    newArray.push(item)
  }

  // Now that the data is complete, can move to insert the data into the DB
  insertProductData(newArray, type, variants, link, dataUpdated, subDataUpdated, date)
  
}
  
  
async function insertProductData(data, type, variants, link, dataUpdated, subDataUpdated, date) {

  // Inserts the product/variant data into the DB

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
    // Have to get the cost of the variants before updating variant data
    getCost(variants, link, dataUpdated + values.length, subDataUpdated, date)
  } else if (type === "variants") {
    // All data has been inserted for this page so can move to see if there are more pages to load
    checkProductPages(link, dataUpdated, subDataUpdated + values.length, date)
  }
}

async function getCost(variants, link, dataUpdated, subDataUpdated, date) {

  // Gets the cost of the variants based on the inventory_id in Shopify
  const ids = []
  variants.forEach(variant => {
    ids.push(variant.inventoryId)
  })

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

      /*
        amount_data refers to the outer data that was inserted while amount_subdata
        refers to the inner data 
        i.e. if it's product data, the outer data is products and the inner data is variants
        if it's purchase data, the outer data is purchases and the inner data is purchase_items
      */

      const query = `
        INSERT INTO updates (source, data_updated, subdata_updated, type) 
        VALUES ('Shopify', $1, $2, 'Insert Product Data')
      `;

      const result = await db.query(query, [dataUpdated, subDataUpdated])
      console.log(`Successfully logged Shopify update into DB`)

      options = "?processed_at_min="+date.toISOString()+"&fields=id, created_at, total_price, total_discounts, subtotal_price, line_items&order=id%20asc";
      url = 'https://' + shopifyKey + shopifyUrl + 'orders.json' + options;
      pullShopifyPurchaseData(url, 0, 0, date, [])
    }
  }
}

async function pullShopifyPurchaseData(url, dataUpdated, subDataUpdated, date, issueItems) {
  // Make request to Shopify API
  axios.get(url)
    .then(res => {
      const purchases = [];
      const purchaseItems = [];

      // Get all relevant product data
      res.data.orders.forEach(purchase => {
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

            // If there's no variant_id for this Shopify purchase, add to issuesItems
            if (item.variant_id) {
                purchaseItems.push(newItem)
            } else {
                issueItems.push(`${purchase.id} - ${item.title}`)
            }

        })
      });

      // If there's purchases, let's flow through to insert these purchases into DB
      if (purchases.length > 0) {
        insertPurchaseData(purchases, "purchases", purchaseItems, res.headers.link, dataUpdated, subDataUpdated, "Shopify", 0, date, issueItems)
      } else {
        // If no purchase, mark in DB and then pull Woo purchase data
        console.log("No new Shopify purchases")
        const query = `
            INSERT INTO updates (source, data_updated, subdata_updated, type)
            VALUES ('Shopify', '0', '0', 'Insert Purchase Data')
        `;
        const result = db.query(query)

        console.log("Pulling Woo data...")
        pullWooPurchaseData(1, 0, 0, date, issueItems)
      }
    })
}



async function pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems) {

    /*
      Format the dates as we need them:
        timeAdjusted: sets the time to be 5 hours earlier that it is now b/c of the timezone difference
        lastWeek: sets the date to be a week before the original date b/c need to look through a week's
                  worth of Woo purchase data to look for purchases whose status has changed to Completed
    */

  const newDate = new Date(date)
  const timeAdjusted = new Date(newDate.setHours(newDate.getHours()-5))
  const lastWeek = new Date(newDate.setDate(newDate.getDate()-7))

  const data = {
      status: "completed",
      after: lastWeek.toISOString().slice(0,-1), // '2021-01-16T16:16:00.000'
      per_page: "100",
      orderby: "date",
      order: "asc",
      page: pageNum
  }

  WooCommerce.get("orders", data)
  .then((res) => {

    const purchases = [];
    const purchaseItems = [];

    res.data.forEach(purchase => {

      if (purchase.date_completed >= timeAdjusted.toISOString().slice(0,-1)) {
        // Only load data where it was completed after the last update
      
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
  
        /* 
          Don't log purchase data for variants w/o a SKU b/c won't be able to find a product match
          Add to issueItems instead
        */ 
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
    
    // If there's data let's flow through to insert purchases into DB
    if (purchases.length > 0) {
        insertPurchaseData(purchases, "purchases", purchaseItems, res.headers.link, dataUpdated, subDataUpdated, "Woo", pageNum, date, issueItems)
    } else if (res.data.length > 0) {
      // There is data but the date completed isn't greater than the last update
      // need to continue looping to see if there's more data to compare
      pageNum++
      pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems)
    } else {
      // There's no new data so let's log it in DB --> Finished
      console.log("No new Woo purchases")
      const query = `
          INSERT INTO updates (source, data_updated, subdata_updated, type)
          VALUES ('Woo', '0', '0', 'Insert Purchase Data')
      `;
      const result = db.query(query)
      console.log(`All data uploaded between: ${new Date(date)} and ${new Date()}`)
    }
  })
  .catch("error", (err) => {
    console.log("Error: " + err.message);
  });
}

async function insertPurchaseData(data, type, purchaseItems, link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems) {

  // Insert purchase data into the DB

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

  if (values.length > 0) {
    const result = await db.query(query)
    console.log(`Successfully inserted ${values.length} ${type} into DB from ${source}`)
  }

  var variantQuery = ""
  const variants = Object.entries(variantDict)

  // Update the variant quantity if inserting purchase item data
  if (type === "purchaseItems") {
    if (variants.length > 0) {
      variantQuery = format("UPDATE variants v set quantity=greatest(cast(v.quantity as float) - cast(new.quantity as float), 0) from (values %L) as new (id, quantity) where v.id=cast(new.id as int)", variants)
      const variantResult = await db.query(variantQuery)
      console.log(`Successfully updated ${variants.length} variants into DB from ${source}`)
    }
  }

  if (type === "purchases") {
    // Move to update purchase data if currently updating purchases
    updatePurchaseData(purchaseItems, "purchaseItems", [], link, dataUpdated + values.length, subDataUpdated, source, pageNum, date, issueItems)
  } else if (type === "purchaseItems") {
    // Check to see if more pages if current updating purchase items (finished inserting this page)
    checkPurchasePages(link, dataUpdated, subDataUpdated + values.length, source, pageNum, date, issueItems)   
  }
}


async function updatePurchaseData(array, type, variants, link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems) {

  // Update the purchase item data to match with the variant id and purchase id from DB

  const values1 = [] // shopify variant ids
  const values2 = [] // shopify purchase ids

  for (const item of array) {
    values1.push(item.variant)
    values2.push(item.purchase)
  }

  // Get the ids from DB that match with variant and purchase id from shopify
  const query1 = format('SELECT id, shopify_id FROM variants WHERE shopify_id in (%L)', values1); 
  const query2 = format('SELECT id, source_id FROM purchases WHERE source_id in (%L)', values2); 

  const newArray = []
  const variantDict = {}
  const purchaseDict = {}

  if (values1.length > 0) {
    // Get variant ids from DB
    const result1 = await db.query(query1)

    // Match variant ids with the purchase item data
    if (result1.rows.length > 0) {
      result1.rows.forEach(variant => {
        variantDict[variant.shopify_id] = variant.id
      })    
    }
  }

  if (values2.length > 0) {
    // Get purchase ids from DB
    const result2 = await db.query(query2)

    // Match purchase ids with the purchase item data
    if (result2.rows.length > 0) {
      result2.rows.forEach(purchase => {
        purchaseDict[purchase.source_id] = purchase.id
      })    
    }
  }

  // Update purchase item data with the new variant and purchase ids from DB
  for (const item of array) {
    item.variant = variantDict[item.variant] ? variantDict[item.variant] : -999;
    item.purchase = purchaseDict[item.purchase] ? purchaseDict[item.purchase] : -999;
    newArray.push(item)
  }
  // Insert this newly updated data
  insertPurchaseData(newArray, type, variants, link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems)
}





async function checkPurchasePages(link, dataUpdated, subDataUpdated, source, pageNum, date, issueItems) {

  // Check to see if more pages to load

  // Get the link from the API call which includes the previous and next pages
  const links = link ? link.split(',') : []

  if (links.length > 1) {
    // We are in the middle pages b/c there's both a next and previous page

    if (source === "Shopify") {
      // Format URL for next page call if Shopify
      const nextPage = links[1].split(';')[0].slice(2,-1);
      const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
      pullShopifyPurchaseData(newUrl, dataUpdated, subDataUpdated, date, issueItems);
    } else if (source === "Woo") {
      // Just increase the page num if Woo
      pageNum++;
      pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems);
    }
  
  } else {
    // There's just one link so need to see if there's a next page link or just current page link
    if (link && link.includes('next')) {
      // There is a next page link which means we're on the first page
      if (source === "Shopify") {
        // Format URL for next page call if Shopify
        const nextPage = link.split(';')[0].slice(1,-1);
        const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
        pullShopifyPurchaseData(newUrl, dataUpdated, subDataUpdated, date, issueItems);
      } else {
        // Just increase the page num if Woo
        pageNum++;
        pullWooPurchaseData(pageNum, dataUpdated, subDataUpdated, date, issueItems);
      }
        
    } else {
      // There is no next page link which means we're on the last page --> log update
      const query = `
        INSERT INTO updates (source, data_updated, subdata_updated, type)
        VALUES ($1, $2, $3, 'Insert Purchase Data')
      `;

      // Log the update including the amount updated in DB
      const result = await db.query(query, [source, dataUpdated, subDataUpdated])
      console.log(`Successfully inserted ${source} update into DB`)

      if (source === "Woo") {
        // If the source is Woo then we have finished updating all data and can send issue items
        console.log("<===========================================>")
        console.log(`All data uploaded between: ${new Date(date)} and ${new Date()}`)
        console.log("<===========================================>")

        // If there's issue items then send an email with the items
        if (issueItems.length > 0) {

          console.log(issueItems.length + " Issue Items")

          const message = `If only a number is shown, need to go to Woo and search by that number to find the product that needs a SKU added.\nIf the product name is included, need go to Shopify and search by the order number to find the item with no variant ID:\n\n${issueItems.map(item => item).join("\n")}`

          // Creates reusable transporter object using the default SMTP transport for sending the email
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
        }
          
      } else if (source === "Shopify") {
        // If the source is Shopify then need to pull Woo purchase data
        console.log("Pulling Woo data...")
        pullWooPurchaseData(1, 0, 0, date, issueItems)    
      }
    }
  }
}

module.exports = getLastUpdate;
  
