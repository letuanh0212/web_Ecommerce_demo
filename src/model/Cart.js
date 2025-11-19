const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },   // giá lúc thêm
      variant: {
        size: String,
        color: String,
        pattern: String
      }
    }
  ],
  status: { type: String, enum: ['active', 'ordered'], default: 'active' }
}, { timestamps: true });

//cartSchema.index({ user_id: 1 });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;