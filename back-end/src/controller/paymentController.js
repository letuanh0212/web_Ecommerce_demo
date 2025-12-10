const querystring = require('qs');
const crypto = require('crypto');
const moment = require('moment');

const createVnpayPayment = async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        const tmnCode = process.env.VNP_TMNCODE;
        const secretKey = process.env.VNP_HASHSECRET;
        const returnUrl = process.env.VNP_RETURN_URL;

        const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

        const date = moment().format("YYYYMMDDHHmmss");
        const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang #${orderId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = date;

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;
        const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

        return res.json({ paymentUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating VNPAY URL" });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secretKey = process.env.VNP_HASHSECRET;

        const secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        if (secureHash === signed) {
            if (vnp_Params['vnp_ResponseCode'] === '00') {
                return res.json({ message: "Payment success", data: vnp_Params });
            } else {
                return res.json({ message: "Payment failed", data: vnp_Params });
            }
        } else {
            return res.status(400).json({ message: "Invalid checksum" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Payment validation error" });
    }
};

// Sắp xếp object đúng chuẩn VNPAY
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(k => sorted[k] = obj[k]);
    return sorted;
}

module.exports = {
    createVnpayPayment,
    vnpayReturn,
};
