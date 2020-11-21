const mongoose = require('mongoose');

const productSchema = new mongoose.Schema ({
  id: String,
  title: String,
  vendor: String,
  image: String,
  category: String,
  variants: [{
    id: String,
    title: String,
    price: Number,
    quantity: Number,
    inventoryId: String,
  }],
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
