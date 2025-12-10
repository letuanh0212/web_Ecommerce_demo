require('dotenv').config();

const { VNPay, ignoreLogger, ProductCode,VnpLocale,dateFormat } = require("vnpay");

const vnpay = new VNPay({
    // ⚡ Cấu hình bắt buộc
    tmnCode: process.env.VNP_TMNCODE ,
    secureSecret: process.env.VNP_HASHSECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',

    // 🔧 Cấu hình tùy chọn
    testMode: true, // Chế độ test
    hashAlgorithm: 'SHA512', // Thuật toán mã hóa
    enableLog: true, // Bật/tắt log
    loggerFn: ignoreLogger, // Custom logger

    // 🔧 Custom endpoints
    endpoints: {
        paymentEndpoint: 'paymentv2/vpcpay.html',
        queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
        getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
    },
});

module.exports = {vnpay}