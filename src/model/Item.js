const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  variants: [
    {
      size: String,
      color: String,
      pattern: String, 
      stock: { type: Number, default: 0 },
      image: String
    }
  ],
  images: [String],
  description: String,

}, { timestamps: true });


const Item = mongoose.model('Item', itemSchema);

module.exports = Item;