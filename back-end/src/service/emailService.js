const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USERNAME || process.env.EMAIL_USER || process.env.EMAIL;
const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPass) {
    console.warn('[emailService] email credentials not set in environment. Emails will not be sent.');
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

const sendOrderPaymentEmail = async (
    to,
    orderId,
    total,
    items,
    shipping_name,
    shipping_phone,
    shipping_address,
    note
) => {

    console.log('[emailService] sendOrderPaymentEmail called', { to, orderId, itemsCount: items?.length, shipping_name, shipping_phone });

    if (!emailUser || !emailPass) {
        console.warn('[emailService] skipping sendMail because credentials are missing');
        return; // don't attempt to send
    }

    const itemListHTML = items
        .map(
            (item) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString()}₫</td>
            <td>${(item.price * item.quantity).toLocaleString()}₫</td>
        </tr>
    `
        )
        .join("");

    const html = `
        <h2>Đơn hàng #${orderId} đặt thành công!</h2>

        <h3>Thông tin giao hàng:</h3>
        <p><b>Người nhận:</b> ${shipping_name}</p>
        <p><b>Số điện thoại:</b> ${shipping_phone}</p>
        <p><b>Địa chỉ:</b> ${shipping_address}</p>
        <p><b>Ghi chú:</b> ${note || "Không có"}</p>

        <h3>Sản phẩm:</h3>
        <table border="1" cellspacing="0" cellpadding="8">
            <tr>
                <th>Sản phẩm</th>
                <th>SL</th>
                <th>Giá</th>
                <th>Tạm tính</th>
            </tr>
            ${itemListHTML}
        </table>

        <h3>Tổng tiền: ${total.toLocaleString()}₫</h3>

        <p>Cảm ơn bạn đã mua hàng!</p>
    `;

    try {
        await transporter.sendMail({
            from: emailUser,
            to,
            subject: `Xác nhận đơn hàng #${orderId}`,
            html,
        });
        console.log('[emailService] email sent to', to);
    } catch (err) {
        console.error('[emailService] sendMail error', err);
        throw err;
    }
};

module.exports = {sendOrderPaymentEmail}