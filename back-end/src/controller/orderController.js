const orderService = require("../service/orderService");
const { sendOrderPaymentEmail } = require("../service/emailService");

// ---------------- CREATE ORDER + SEND EMAIL ----------------
// const createOrder = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { items ,email} = req.body;

//         if (!items || items.length === 0)
//             return res.status(400).json({ error: "Giỏ hàng trống" });

//         // Tạo đơn hàng trong service
//         const result = await orderService.createOrderService(userId, items);
//         console.log("check result>>>>>>>>>", result);

//         // ---------------- GỬI EMAIL XÁC NHẬN ----------------
//         if (result?.email) {
//             await sendOrderPaymentEmail(
//                 result.email,
//                 result.orderCode,
//                 result.totalAmount,
//                 result.items
//             );
//         } else {
//             console.warn("⚠ Không có email để gửi!");
//         }

//         res.json({
//             message: "Đặt hàng thành công!",
//             ...result
//         });

//     } catch (err) {
//         console.error("Create Order Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// };
// ---------------- CREATE ORDER + SEND EMAIL ----------------
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, email } = req.body;  // Lấy email từ FE

        if (!items || items.length === 0)
            return res.status(400).json({ error: "Giỏ hàng trống" });

        // Tạo đơn hàng trong service
        const result = await orderService.createOrderService(userId, items);
        console.log("check result>>>>>>>>>", result);

        // Gắn thêm thông tin email, orderCode, totalAmount, items để gửi email
        result.email = email;                   // email từ FE
        result.orderCode = result.order_id;     // orderCode dùng để hiển thị
        result.totalAmount = result.total;      // tổng tiền
        result.items = items;                   // danh sách sản phẩm
    
        // ---------------- GỬI EMAIL XÁC NHẬN ----------------
        if (result?.email) {
            await sendOrderPaymentEmail(
                result.email,
                result.orderCode,
                result.totalAmount,
                result.items
            );
        } else {
            console.warn(" Không có email để gửi!");
        }

        res.json({
            message: "Đặt hàng thành công! Email xác nhận đã gửi.",
            ...result
        });

    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(500).json({ error: err.message });
    }
};


// ---------------- GET ORDERS BY USER ----------------
const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await orderService.getOrdersByUserService(userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- GET ORDER DETAIL ----------------
const getOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await orderService.getOrderDetailService(req.params.id, userId);

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- UPDATE STATUS ----------------
const updateOrderStatus = async (req, res) => {
    try {
        await orderService.updateOrderStatusService(req.params.id, req.body.status);
        res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- CANCEL ORDER ----------------
const cancelOrder = async (req, res) => {
    try {
        await orderService.cancelOrderService(req.params.id);
        res.json({ message: "Đã hủy đơn hàng và hoàn tiền kho" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- SELLER: GET ORDERS BY STORE ----------------
const getOrdersByStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const orders = await orderService.getOrdersByStoreService(storeId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- EXPORT ----------------
module.exports = {
    createOrder,
    getOrdersByUser,
    getOrderDetail,
    updateOrderStatus,
    cancelOrder,
    getOrdersByStore
};
