import mongoose from "mongoose";

// =======================
// 🔹 USER
// =======================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
}, { timestamps: true });

// =======================
// 🔹 STORE
// =======================
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  store_address: String,
  phone: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// =======================
// 🔹 ARTICLE (bài viết của cửa hàng)
// =======================
const articleSchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  related_items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }], // liên kết bài viết tới sản phẩm cụ thể
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// =======================
// 🔹 CATEGORY
// =======================
const categorySchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  name: { type: String, required: true },
  description: String,
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // danh mục cha
  image: String, 
}, { timestamps: true });

// =======================
// 🔹 ITEM (sản phẩm)
// =======================
const itemSchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  name: { type: String, required: true },
  description: String,
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

}, { timestamps: true });

// =======================
// 🔹 CART
// =======================

//cart 2 
const cartSchema2 = new mongoose.Schema({
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

cartSchema.index({ user_id: 1 });


// =======================
// 🔹 ORDER
// =======================
const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  total_price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  shipment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment" },
}, { timestamps: true });

// =======================
// 🔹 ORDER DETAIL
// =======================
const orderDetailSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// =======================
// 🔹 PAYMENT
// =======================
const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  method: { type: String, enum: ['cash', 'credit', 'momo', 'paypal'], required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  amount: { type: Number, required: true },
  paidAt: Date
});

// =======================
// 🔹 SHIPMENT
// =======================
const shipmentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  address: { type: String, required: true },
  city: String,
  phone: String,
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  shippedAt: Date,
  deliveredAt: Date
});

// =======================
// 🔹 EXPORT TẤT CẢ MODEL
// =======================
const Models = {
  User: mongoose.model("User", userSchema),
  Store: mongoose.model("Store", storeSchema),
  Article: mongoose.model("Article", articleSchema),
  Category: mongoose.model("Category", categorySchema),
  Item: mongoose.model("Item", itemSchema),
  Cart: mongoose.model("Cart", cartSchema),
  Order: mongoose.model("Order", orderSchema),
  OrderDetail: mongoose.model("OrderDetail", orderDetailSchema),
  Payment: mongoose.model("Payment", paymentSchema),
  Shipment: mongoose.model("Shipment", shipmentSchema),
};

export default Models;
