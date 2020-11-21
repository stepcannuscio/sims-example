const express = require('express');
const router = express.Router();
const Order = require('../models/order');

router.get('/', function(req, res, next) {

  const orders = [];

  Order.find({}, function(err, loadedOrders) {
    if (err) {
      console.log(err);
    } else {
    
        loadedOrders.forEach(order => {
        const newOrder = {
            price: order.totalPrice,
            date: order.purchaseDate,
            source: order.source
          }
        
        // product.variants.forEach(variant => {
        //   const newVariant = {
        //     id: variant.id,
        //     title: variant.title,
        //     price: variant.price,
        //     quantity: variant.quantity
        //   }
        //   newProduct.variants.push(newVariant);
        // })

        orders.push(newOrder)
        
      });
      console.log(orders)
      res.json(orders);
    }
});
});

router.get("/:id", (req, res) => {
  console.log(req.body);
  Product.findOne({id: req.params.id}, function(err, product) {
    if (err) {
      res.status(400).json("Error " + err);
    } else {
      console.log(product);
      res.json(product);
    }
  })
});

router.route("/:id/update").post((req, res) => {
  Product.findOne({id: req.params.id}, function(err, product) {
    if (err) {
      res.status(400).json("Error " + err);
    } else {
      console.log(product);
      console.log(req.body)

      product.variants.forEach(variant => {
        if (variant.id in req.body.updateDict) {

          console.log('you know ittt')
          console.log(variant.id)
          variant.quantity = req.body.updateDict[variant.id]
         
        }
      })
      product.save();
      res.json("Product Updated");
    }
  })
});

module.exports = router;
