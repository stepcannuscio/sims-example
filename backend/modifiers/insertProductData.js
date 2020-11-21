// const https = require('https');
const axios = require("axios");
const mongoose = require("mongoose");
const path = require('path')

const Update = require('../models/update');
const Product = require('../models/product');
const { load } = require("dotenv/types");

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

// Set up mongoDB connection
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })


function getAllShopifyProductData(url, productsUpdated) {
  console.log(url)

  // Make request to Shopify API
  axios.get(url)
    .then(res => {
      // console.log(res.data)
      // const jsonData = JSON.parse(res.data);
      const products = [];

      // Get all relevant product data
      res.data.products.forEach(product => {
        console.log(product)
        const newProduct = {
          id: product.id,
          title: product.title,
          vendor: product.vendor,
          image: product.image ? product.image.src : null,
          variants: []
        }

        const inventoryIds = []
        // Get all revelant variant data
        product.variants.forEach(variant => {
          const newVariant = {
            id: variant.id,
            title: variant.title,
            price: variant.price,
            quantity: 0,
            inventoryId: variant.inventory_item_id
          }
          
          // if (variant.inventory_item_id) {
          //   inventoryIds.push(variant.inventory_item_id)
          // } else {
          //   console.log(variant.inventory_item_id)
          // }
          
          // axios.get('https://' + shopifyKey + shopifyUrl + "inventory_items.json/")
          //   .then(res => {

          //   })
          //   .catch(err => console.log(err))

          


          // Add variant data to proudct
          newProduct.variants.push(newVariant);
        })
        // Add product to array
        products.push(newProduct)

      });

      // 

      // Use Product model to save product and its data into DB
      products.forEach(product => {
        console.log(product.image)
        const newProduct = new Product ({
          id: product.id,
          title: product.title,
          vendor: product.vendor,
          image: product.image,
          variants: product.variants
        });
        newProduct.save();
        productsUpdated++;
        console.log(newProduct.title);
      })
      const link = res.headers.link
      // Check to see if more pages to load
      const links = link.split(',');
     

      if (links.length > 1) {
        // Loading the middle pages (still more data to load)
        const nextPage = links[1].split(';')[0].slice(2,-1);
        const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
        console.log(newUrl);
        getData(newUrl, productsUpdated);
      } else {
        // Loading the first page (still more data to load)
        if (link.includes('next')) {
          const nextPage = link.split(';')[0].slice(1,-1);
          const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
          console.log(newUrl);
          // getData(newUrl, productsUpdated);

          // UNCOMMENT ABOVE AND DELETE BELOW TO LOAD ALL DATA
          var dt = new Date();
          dt.setHours(dt.getHours()) 
          dt.setMinutes(dt.getMinutes())

          const update = new Update({
              date: dt,
              source: "Shopify",
              type: "Insert Data",
              productsUpdated: productsUpdated
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
              type: "Insert Data",
              productsUpdated: productsUpdated
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

function insertProductCost() {
  
  Product.find({}, function(err, loadedProducts) {
    if (err) {
      // console.log(err);
    } else {
      const inventoryIds = [] 
      loadedProducts.forEach(product => {
        
        product.variants.forEach(variant => {
          inventoryIds.push(variant.inventoryId)
        })
       
      })
      updateItems(inventoryIds)
      

     
    }
  })
  
}

function updateItems(ids) {
  console.log(ids)
  axios.get('https://' + shopifyKey + shopifyUrl + "inventory_items.json?ids="+ids.join(','))
  .then(res => {
      const costData = {}
      res.data.inventory_items.forEach(item => {
        costData[item.id] = item.cost
      })
      // console.log(costData)

      for (var key in costData) {
        Product.find({"variants.inventoryId":key}, function(err, loadedProduct) {
          if (err) {
            // console.log(err);
          } else {
            // Product.updateOne({})
            const newProduct = new Product ({
              id: loadedProduct.id,
              title: loadedProduct.title,
              vendor: loadedProduct.vendor,
              image: loadedProduct.image,
              variants
            })
            
            loadedProduct.cost = costData[key]
            console.log(loadedProduct)
            loadedProduct.save()
            
      }
    
  })

}
  })

     
          
          // const inventoryIds = []
          // loadedProducts.forEach(product => {
            
          //   product.variants.forEach(variant => {
          //     inventoryIds.push(variant.inventoryId)
          //   })
          // })


  
  .catch(err => console.log(err))
}




      // console.log(inventoryIds.join(','))


      // axios.get('https://' + shopifyKey + shopifyUrl + "inventory_items.json?ids="+inventoryIds.join(','))
      //   .then(res => {
      //       const costData = {}
      //       res.data.inventory_items.forEach(item => {
      //         costData[item.id] = item.cost
      //       })
      //       // console.log(costData)

      //       for (var key in costData) {

              
        //     Product.find({"variants.inventoryId":key}, function(err, loadedProduct) {
        //       if (err) {
        //         console.log(err);
        //       } else {
        //         Product.updateOne({})

        //         loadedProduct.cost = costData[key]
        //         loadedProduct.save()
        //         // console.log(loadedProduct)
        //         // const inventoryIds = []
        //         // loadedProducts.forEach(product => {
                  
        //         //   product.variants.forEach(variant => {
        //         //     inventoryIds.push(variant.inventoryId)
        //         //   })
        //         // })


        //       }
        // })
//             }

//       })
//         .catch(err => console.log(err))
   
//     }
//   })
// }



// Initial Shopify data to load into db
const shopifyKey = process.env.SHOPIFY_KEY;
const shopifyUrl = process.env.SHOPIFY_URL;
const endpoint = 'products.json'
const options = "?fields=id,title,vendor,image,variants,product_type"
var url = 'https://' + shopifyKey + shopifyUrl + endpoint + options;

// getAllShopifyProductData(url, 0)
const ids = insertProductCost()


// var productsUpdated = 0
// function getData(url, productsUpdated) {
//     console.log(url)
    
//   https.get(url, (res) => {
//     console.log(url)
//     let data = '';

//     // A chunk of data has been recieved.
//     res.on('data', (chunk) => {
//       data += chunk;
//     });

//     // The whole response has been received. Print out the result.
//     res.on('end', () => {
//       // console.log(JSON.parse(data).explanation);
//       // console.log(JSON.parse(data));
//       const jsonData = JSON.parse(data);
//       const products = [];

//       jsonData.products.forEach(product => {
//         const newProduct = {
//           id: product.id,
//           title: product.title,
//           vendor: product.vendor,
//           image: product.image.src,
//           variants: []
//         }

//         product.variants.forEach(variant => {
//           const newVariant = {
//             id: variant.id,
//             title: variant.title,
//             quantity: 0
//           }
//           newProduct.variants.push(newVariant);
//         })

//         products.push(newProduct)

//       });

//       products.forEach(product => {
//         const newProduct = new Product ({
//           title: product.title,
//           variants: product.variants
//         });
//         newProduct.save();
//         productsUpdated++;
//         console.log(newProduct.title);


//       })
//       const link = res.headers.link;

//       console.log('\n\n1 Page Complete\n\n');


//       const links = link.split(',');

//       if (links.length > 1) {
//         const nextPage = links[1].split(';')[0].slice(2,-1);
//         const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
//         console.log(newUrl);
//         getData(newUrl, productsUpdated);
//       } else {
//         if (link.includes('next')) {
//           const nextPage = link.split(';')[0].slice(1,-1);
//           const newUrl = nextPage.slice(0,8) + shopifyKey + '@' + nextPage.slice(8,);
//           console.log(newUrl);
//           getData(newUrl, productsUpdated);
//         } else {

//         //   // this isn't saving, I don't know why
//         //   const update = new Update({
//         //     date: new Date(),
//         //     productsUpdated: productsUpdated
//         //   })

//         //   update.save();

//             var dt = new Date();
//             dt.setHours(dt.getHours()) 
//             dt.setMinutes(dt.getMinutes())

//             const update = new Update({
//                 date: dt,
//                 source: "Shopify",
//                 productsUpdated: productsUpdated
//             })

//             update.save();

//           console.log('Finished!!!')
//         }
//       }
//     });

//   }).on("error", (err) => {
//     console.log("Error: " + err.message);
//   });

// }

// getData(url, 0);
