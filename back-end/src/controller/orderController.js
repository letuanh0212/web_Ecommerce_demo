const orderService = require("../service/orderService");
const { sendOrderPaymentEmail } = require("../service/emailService");

// Tạo đơn hàng COD
const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || null;

    const {
      items,
      shipping_name,
      shipping_phone,
      shipping_address,
      note,
      paymentMethod,
    } = req.body;

    const email = req.user?.email || req.body?.email || null;

    console.log("[orderController] createOrder called", { userId, itemsCount: items?.length, paymentMethod });

    if (!items || items.length === 0) {
      console.log("[orderController] empty cart");
      return res.status(400).json({ error: "Giỏ hàng trống" });
    }

    // Tạo đơn (dùng service tạo COD - service đã xử lý transaction và giảm stock)
    console.log("[orderController] creating order via service for user", userId);
    const orderRes = await orderService.createCODOrderService(userId, {
      items,
      shipping_name,
      shipping_phone,
      shipping_address,
      note,
    });

    const orderId = orderRes.orderId;
    console.log("[orderController] order created", { orderId, total: orderRes.totalAmount });

    // Lấy chi tiết order để lấy tên sản phẩm cho email
    const orderDetail = await orderService.getOrderDetailService(orderId, userId);

    // Gửi email xác nhận nếu có email
    if (email) {
      console.log(`[orderController] sending confirmation email to ${email} for order ${orderId}`);
      try {
        await sendOrderPaymentEmail(
          email,
          orderId,
          orderRes.totalAmount || orderRes.finalAmount || 0,
          // map items to shape emailService expects (name, quantity, price)
          (orderDetail.items || []).map(i => ({ name: i.item_name || i.name || '', quantity: i.quantity, price: i.price })),
          shipping_name,
          shipping_phone,
          shipping_address,
          note
        );
        console.log('[orderController] confirmation email sent');
      } catch (mailErr) {
        console.error("[orderController] Send email failed:", mailErr);
      }
    } else {
      console.log('[orderController] no email available to send confirmation');
    }

    return res.json({ success: true, order_id: orderId, total: orderRes.totalAmount || orderRes.finalAmount || 0 });

  } catch (err) {
    console.error("COD Order Error:", err);
    return res.status(500).json({ error: err.message });
  }
};


// ---------------- GET ORDERS BY USER ----------------
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getOrdersByUserService(userId);
    res.json(orders);
  } catch (err) {
    console.error("Get Orders By User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GET ORDER DETAIL ----------------
const getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id, 10);
    const order = await orderService.getOrderDetailService(orderId, userId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get Order Detail Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ORDER STATUS ----------------
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: "Missing status" });

    await orderService.updateOrderStatusService(orderId, status);
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- CANCEL ORDER ----------------
const cancelOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    await orderService.cancelOrderService(orderId);
    res.json({ message: "Đã hủy đơn hàng và hoàn tiền kho" });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GET ORDERS BY STORE ----------------
const getOrdersByStore = async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId, 10);
    const orders = await orderService.getOrdersByStoreService(storeId);
    res.json(orders);
  } catch (err) {
    console.error("Get Orders By Store Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder,
  getOrdersByStore,
};
