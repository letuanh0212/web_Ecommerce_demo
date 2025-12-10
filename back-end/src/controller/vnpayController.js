const { vnpay } = require('../config/vnpay'); // file bạn vừa tạo

// POST /api/vnpay/create
const createVnpayPayment = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        if (!orderId || !amount) return res.status(400).json({ message: "Missing orderId or amount" });

        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount,             // đơn vị VND
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_IpAddr: req.ip || '127.0.0.1',
            vnp_OrderType: 'other'
        });

        console.log("Payment URL:", paymentUrl);
        return res.json({ paymentUrl });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating payment URL" });
    }
};

// GET /api/vnpay/return
const vnpayReturn = async (req, res) => {
    try {
        const result = vnpay.verifyReturnUrl(req.query);
        if (result.isSuccess) {
            return res.send(`Thanh toán thành công! Mã giao dịch: ${req.query.vnp_TransactionNo}`);
        } else {
            return res.send(`Thanh toán thất bại: ${result.message}`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error verifying payment");
    }
};

module.exports = { createVnpayPayment, vnpayReturn };
