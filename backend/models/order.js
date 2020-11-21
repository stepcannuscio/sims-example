const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema ({
  purchaseDate: String,
  totalPrice: Number,
  totalDiscount: Number,
  source: String,
  itemsOrdered: [{
      id: String,
      quantity: Number,
  }],
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
