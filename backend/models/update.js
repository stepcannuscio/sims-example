const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema ({
  source: String,
  amountUpdated: Number,
  type: String,
},{
    timestamps: true
}
);

const Update = mongoose.model("Update", updateSchema);

module.exports = Update
