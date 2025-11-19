const mongoose = require("mongoose")


const categorySchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },

  name: { type: String, required: true },
  description: String,
  image: String,

  // Danh mục cha
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },

  // Nếu bạn muốn tăng tốc load menu nhiều cấp
  ancestors: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Category" }
  ],

}, { timestamps: true });


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

