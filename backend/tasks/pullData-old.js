
const https = require('https');
// const mongoose = require("mongoose");

// const Update = require('./models/update');
// const Product = require('./models/product');

require('dotenv').config();

// mongoose.connect(process.env.ATLAS_URI,  {useNewUrlParser: true, useUnifiedTopology: true });

// Connect to Woo API
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const WooCommerce = new WooCommerceRestApi({
  url: process.env.URL,
  consumerKey: process.env.WOO_KEY,
  consumerSecret: process.env.WOO_SECRET,
  version: 'wc/v3'
});

// To initialize data - get all products from Shopify and set quantity to 0
// getLastUpdate('New Products', initialize=true);

function getLastUpdate(source=false, initialize=false) {
  // Get last update from database

  // Set the query if there's a source (i.e. Woo, Shopify, New Products)
  var query = {}
  if (source != false) {
    query = {source: source}
  }

  if (initialize === false) {
    // Find the most recent update (query the source if provided)
    Update.findOne(query, {}, { sort: { 'date' : -1 } }, function(err, update) {
      if (err) {
        console.log(err);
      } else {

        console.log('Looking for most recent update:');
        console.log(`Query: ${query.source || query}`);
        console.log(`Date: ${update.date}`);

        pullData(update.date, source);
        // if (source == 'Shopify' || source == 'Woo' || source == false) {
        //   pullData(update.date, source);
        // } else {
        //   const products = []
        //
        //   var newDate = update.date;
        //   newDate.setHours(newDate.getHours()+4);
        //   var options = "?published_at_min="+newDate.toISOString()+"&fields=title,variants";
        //   var url = 'https://' + process.env.API_KEY + process.env.SHOPIFY_URI + 'products.json' + options;
        //
        //   addData(url, products, source);
        // }

      }
    });
  } else {
    pullData('initialize', source)
  }

  // // Find the most recent update (query the source if provided)
  // Update.findOne(query, {}, { sort: { 'date' : -1 } }, function(err, update) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //
  //     console.log('Looking for most recent update:');
  //     console.log(`Query: ${query.source || query}`);
  //     console.log(`Date: ${update.date}`);
  //
  //     pullData(update.date, source);
  //     // if (source == 'Shopify' || source == 'Woo' || source == false) {
  //     //   pullData(update.date, source);
  //     // } else {
  //     //   const products = []
  //     //
  //     //   var newDate = update.date;
  //     //   newDate.setHours(newDate.getHours()+4);
  //     //   var options = "?published_at_min="+newDate.toISOString()+"&fields=title,variants";
  //     //   var url = 'https://' + process.env.API_KEY + process.env.SHOPIFY_URI + 'products.json' + options;
  //     //
  //     //   addData(url, products, source);
  //     // }
  //
  //   }
  // });
}

function pullData(date, source) {

  if (date === 'initialize') {
    var options = "?fields=title,variants";
    var url = 'https://' + process.env.API_KEY + process.env.SHOPIFY_URI + 'products.json' + options;

    const products = []
    addData(url, products, 'New Products');
  }

  if (source == 'Shopify' || source == false) {

    // For Shopify, 1st see if any new products have been added
    var newDate = date;
    newDate.setHours(newDate.getHours()+4);
    var options = "?published_at_min="+newDate.toISOString()+"&fields=title,variants";
    var url = 'https://' + process.env.API_KEY + process.env.SHOPIFY_URI + 'products.json' + options;

    const products = []
    addData(url, products, 'New Products');

    // Now that new products have been added, pull Shopify orders data
    const updateData = {}
    options = "?processed_at_min="+newDate.toISOString()+"&fields=total_price,line_items";
    url = 'https://' + process.env.API_KEY + process.env.SHOPIFY_URI + 'orders.json' + options;
    pullShopify(url, 'Shopify', updateData);

  }

  if (source == 'Woo' || source == false) {
    // Pull Woo data
    const wooData = {}
    pullWoo(date.toISOString(), 1, wooData, 'Woo');
  }



}

function pullWoo(date, pageNum, updateData, source) {

  console.log("\nPulling data for Woo\n");
  console.log('Orders since ' + date + ":");

  // Set options for the payload
  const data = {
    status: "completed",
    per_page: "50",
    after: date.slice(0,-1), // remove the Z
    page: pageNum
  };

  // Make a call to the API
  WooCommerce.get("orders", data)
    .then((res) => {
      res.data.forEach(order => {



        console.log(`Order total: ${order.total}, date completed: ${order.date_completed}`);

        // Loop through the orders and update dictionary with the change in
        // quantity for the variant ids
        order.line_items.forEach(item => {
          if (item.sku === "") {
            console.log('NO SKU FOR :' + item.name);
          }
          else if (item.sku in updateData) {
            updateData[item.sku] += item.quantity;
          } else {
            updateData[item.sku] = item.quantity;
          }
        });
      });

      const link = res.headers.link;

      console.log('\n\nPage ' + pageNum + ' Complete for Woo\n\n');

      const links = link.split(',');

      if (links.length > 1) {
        const nextPage = links[1].split(';')[0].slice(2,-1);
        pageNum++;
        pullWoo(date, pageNum, updateData);
      } else {
        if (link.includes('next')) {
          const nextPage = link.split(';')[0].slice(1,-1);
          pageNum++;
          pullWoo(date, pageNum, updateData);
        } else {
          console.log('Woo Update Data:')
          console.log(updateData)
          updateDB(updateData, source);
        }
      }
    })
    .catch((error) => {
      console.log(error.response.data);
    });
}

function pullShopify(url, source, updateData) {

  console.log('');
  console.log('Pulling data from Shopify...');

  https.get(url, (res) => {

    console.log(`URL: ${url}`)
    let data = '';

    // A chunk of data has been recieved.
    res.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    res.on('end', () => {

      const jsonData = JSON.parse(data);

      // There are new orders
      if (jsonData.orders.length > 0) {

        // Loop through the orders and update dictionary with the change in
        // quantity for the variant ids
        jsonData.orders.forEach(order => {
          console.log(order.total_price);
          order.line_items.forEach(item => {
            if (item.variant_id in updateData) {
              updateData[item.variant_id] += item.quantity;
            } else {
              updateData[item.variant_id] = item.quantity;
            }
          });
        });

        // Get next page if there's more data to load
        getNextPage(res, source, updateData);
      } else {
        // No new orders
        console.log('No data to update.');
        saveUpdate([], source);
      }

    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

function addData(url, totalProducts, source) {

  console.log('');
  console.log('Adding data from Shopify...');
  console.log(`URL: ${url}`)

  https.get(url, (res) => {
    // console.log(`URL: ${url}`)
    let data = '';

    // A chunk of data has been recieved.
    res.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    res.on('end', () => {

      console.log('\nLoaded a page for ' + source + '\n');

      const jsonData = JSON.parse(data);

      const products = [];

      // Loop through the products in the data and create new object
      jsonData.products.forEach(product => {
        const newProduct = {
          title: product.title,
          variants: []
        }

        // Add all variants to the object, initializing quantity to 0
        product.variants.forEach(variant => {
          const newVariant = {
            id: variant.id,
            title: variant.title,
            quantity: 0
          }
          newProduct.variants.push(newVariant);
        })

        products.push(newProduct)

      });

      // Loop through the new products and save them in the db
      products.forEach(product => {
        const newProduct = new Product ({
          title: product.title,
          variants: product.variants
        });
        newProduct.save();
        console.log(newProduct.title);

      })

      // Pass a combined array of products to keep track of ALL products added
      var combinedProducts = totalProducts.concat(products);

      // Get next page if there is more data to load
      getNextPage(res, source, combinedProducts, add=true);

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}

function getNextPage(res, source, data, add=false) {

  const link = res.headers.link;

  // Link exists in the header
  if (link) {

    // Format the link so can use in next API call
    const links = link.split(',');

    if (links.length > 1) {
      // Middle pages
      const nextPage = links[1].split(';')[0].slice(2,-1);
      const newUrl = nextPage.slice(0,8) + process.env.API_KEY + '@' + nextPage.slice(8,);
      if (add == false) {
        pullShopify(newUrl, source, data);
      } else {
        addData(newUrl, data, source);
      }

    } else {
      if (link.includes('next')) {
        // First page
        const nextPage = link.split(';')[0].slice(1,-1);
        const newUrl = nextPage.slice(0,8) + process.env.API_KEY + '@' + nextPage.slice(8,);
        if (add == false) {
          pullShopify(newUrl, source, data);
        } else {
          addData(newUrl, data, source);
        }
      } else {
        // Last page
        console.log(source + ' Update Data:');
        console.log(data);
        updateDB(data, source);
      }
    }
  } else {
    // Link doesn't exist, so no other pages
    console.log(source + ' Update Data:');
    console.log(data);
    updateDB(data, source);
  }
}

function updateDB(data, source) {

  if (source === 'Woo' || source === 'Shopify') {

    // Create an array of all of the variant ids to be updated
    const keys = Object.keys(data);
    const newKeys = [];

    // Find the products which have these variant ids
    Product.find({"variants.id": keys}, function(err, foundItems) {
      if (err) {
        console.log(err);
      } else {

        // Loop through the products to find their variants that need updating
        // and decrement their quantity by the new amount
        foundItems.forEach(item => {
          item.variants.forEach(variant => {
            if (variant.id in data) {
              variant.quantity -= data[variant.id];
              console.log('Update item: ' + variant);
            }
          });
          item.save();

        });

        saveUpdate(keys, source);

      }
    });
  } else {
    // source is New Products
    saveUpdate(data, source);
  }
}

function saveUpdate(keys, source) {

  // Save the update with the current date, the source it's updating from,
  // and the amount of products that it's updating from that source

  var dt = new Date();
  dt.setHours(dt.getHours() - 4) // set to EST from UTC

  const update = new Update({
    date: dt,
    source: source,
    productsUpdated: keys.length
  })

  console.log('Complete - update saved');

  update.save();

}

module.exports = getLastUpdate;
