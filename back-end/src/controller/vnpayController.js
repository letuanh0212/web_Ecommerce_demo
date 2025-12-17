const orderService = require("../service/orderService");
const { sendOrderPaymentEmail } = require("../service/emailService");
const { poolPromise, sql } = require("../config/Sql");
const { VNPay } = require("vnpay");
const crypto = require('crypto');

const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMNCODE,
    secureSecret: process.env.VNP_HASHSECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: 'SHA512',
});

// Temporary storage for pending orders
const pendingOrders = new Map();

// ---------- CREATE PAYMENT URL (CHUẨN VNPAY) ----------
const createVnpayOrderService = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { items, shipping_name, shipping_phone, shipping_address, note } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No items in order" });
        }

        console.log("[vnpayController] create called", { userId, itemsCount: items.length });

        // Generate unique transaction reference
        const txnRef = crypto.randomUUID();

        // Store order data temporarily
        pendingOrders.set(txnRef, { userId, items, shipping_name, shipping_phone, shipping_address, note });

        // Calculate amount
        let totalAmount = 0;
        items.forEach(i => totalAmount += i.price * i.quantity);
        const vnpAmount = totalAmount;

        let ipAddr = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
        if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1' || ipAddr.startsWith('::ffff:')) {
            ipAddr = '127.0.0.1';
        }

        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: vnpAmount,
            vnp_IpAddr: ipAddr,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toán đơn hàng`,
        });

        console.log("[vnpayController] created paymentUrl", {
            txnRef,
            vnpAmount,
            paymentUrl
        });

        return res.json({
            success: true,
            txnRef,
            paymentUrl,
            vnpAmount
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

        const verify = vnpay.verifyReturnUrl(req.query);

        if (!verify.isSuccess) {
            console.error('[vnpayController] Payment verification failed:', verify.message);
            return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
        }

        const txnRef = req.query.vnp_TxnRef;

        // Get stored order data
        const orderData = pendingOrders.get(txnRef);
        if (!orderData) {
            console.error('[vnpayController] No pending order found for txnRef:', txnRef);
            return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
        }

        // Create the order now that payment is successful
        const order = await orderService.createCODOrderService(
            orderData.userId,
            orderData
        );

        const orderId = order.orderId;

        // Update order status to paid
        const pool = await poolPromise;
        await pool.request()
            .input("id", sql.Int, orderId)
            .query(`UPDATE Orders SET status='paid', updatedAt=GETDATE() WHERE id=@id`);

        // Get order details for email
        const orderResult = await pool.request()
            .input("id", sql.Int, orderId)
            .query(`
                SELECT o.*, u.email
                FROM Orders o
                JOIN Users u ON o.user_id = u.id
                WHERE o.id = @id
            `);

        if (orderResult.recordset.length > 0) {
            const order = orderResult.recordset[0];

            // Get order items
            const itemsResult = await pool.request()
                .input("order_id", sql.Int, orderId)
                .query(`
                    SELECT oi.quantity, oi.price, i.name
                    FROM OrderItems oi
                    JOIN Items i ON oi.item_id = i.id
                    WHERE oi.order_id = @order_id
                `);

            // Send email
            await sendOrderPaymentEmail(
                order.email,
                orderId,
                order.total_amount,
                itemsResult.recordset.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                order.shipping_name,
                order.shipping_phone,
                order.shipping_address,
                order.note
            );
        }

        // Clean up pending order
        pendingOrders.delete(txnRef);

        return res.redirect(`${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`);

    } catch (err) {
        console.error(err);
        return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
};

module.exports = { createVnpayOrderService, vnpayReturn };
