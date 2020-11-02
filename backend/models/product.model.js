const mongoose = require('mongoose');

// require('dotenv').config();

// mongoose.connect(process.env.ATLAS_URI,  {useNewUrlParser: true, useUnifiedTopology: true });

const productSchema = new mongoose.Schema ({
  title: String,
  variants: [{
    id: String,
    title: String,
    quantity: Number
  }],
  vendor: String
}, {
    timestamps: true
});

// const Product = mongoose.model("Product", productSchema);

module.exports = {productSchema, Product};
