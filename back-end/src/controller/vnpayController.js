const orderService = require("../service/orderService");
const { sendOrderPaymentEmail } = require("../service/emailService");
const { poolPromise, sql } = require("../config/Sql");
const qs = require("qs");
const crypto = require("crypto");
const moment = require("moment");

// Hàm sort đúng chuẩn
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    keys.forEach(key => sorted[key] = obj[key]);
    return sorted;
}

// ---------- CREATE PAYMENT URL (CHUẨN VNPAY) ----------
const createVnpayOrderService = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { items, shipping_name, shipping_phone, shipping_address, note } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No items in order" });
        }

        console.log("[vnpayController] create called", { userId, itemsCount: items.length });

        // 1. Tạo đơn trước
        const order = await orderService.createCODOrderService(
            userId,
            { items, shipping_name, shipping_phone, shipping_address, note }
        );

        const orderId = order.orderId;
        const amount = order.totalAmount; // VND

        // 2. CHỈ NHÂN 100 TẠI ĐÂY
        const vnpAmount = amount * 100;

        const createDate = moment().format("YYYYMMDDHHmmss");
        const expireDate = moment().add(15, "minutes").format("YYYYMMDDHHmmss");

        const params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: process.env.VNP_TMNCODE,
            vnp_Amount: vnpAmount.toString(),
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId.toString(),
            vnp_OrderInfo: `Thanh toán đơn hàng #${orderId}`,
            vnp_OrderType: "other",
            vnp_Locale: "vn",
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_IpAddr: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
        };

        // Sort
        const sorted = sortObject(params);
        const signData = qs.stringify(sorted, { encode: false });

        // Hash SHA512
        const hmac = crypto.createHmac("sha512", process.env.VNP_HASHSECRET);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        sorted.vnp_SecureHash = signed;

        const paymentUrl = `${process.env.VNP_URL}?${qs.stringify(sorted, { encode: false })}`;

        console.log("[vnpayController] created order and paymentUrl", {
            orderId,
            amount,
            vnpAmount,
            paymentUrl
        });

        return res.json({
            success: true,
            orderId,
            paymentUrl
        });

    } catch (err) {
        console.error("[VNPAY ERROR]", err);
        return res.status(500).json({ message: err.message });
    }
};

// ---------- RETURN ----------
const vnpayReturn = async (req, res) => {
    try {
        console.log('[vnpayController] return called', req.query);

        const pool = await poolPromise;

        const orderId = req.query.vnp_TxnRef;

        // Update order
        await pool.request()
            .input("id", sql.Int, orderId)
            .query(`UPDATE Orders SET status='paid', updatedAt=GETDATE() WHERE id=@id`);

        return res.redirect(`${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`);
    } catch (err) {
        console.error(err);
        return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
};

module.exports = { createVnpayOrderService, vnpayReturn };
