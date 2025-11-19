const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  related_items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }], 
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });


const Article = mongoose.model('Article', articleSchema);

module.exports = Article;