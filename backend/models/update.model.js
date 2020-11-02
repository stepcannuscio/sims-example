const mongoose = require('mongoose');

// require('dotenv').config();

// mongoose.connect(process.env.ATLAS_URI,  {useNewUrlParser: true, useUnifiedTopology: true });

const updateSchema = new mongoose.Schema ({
  source: String,
  productsUpdated: Number
},{
    timestamps: true
}
);

const Update = mongoose.model("Update", updateSchema);

// const update = new Update({
//   date: new Date(),
//   source: 'Shopify',
//   productsUpdate: 4455
// })


module.exports = {Update, updateSchema};
