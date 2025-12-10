const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Email xác nhận đăng ký seller
const sendSellerRegisterEmail = async (email, sellerName) => {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Xác nhận đăng ký cửa hàng",
        html: `
            <h2>Xin chào ${sellerName},</h2>
            <p>Cảm ơn bạn đã đăng ký trở thành cửa hàng bán hàng.</p>
            <p>Thông tin của bạn đã được gửi tới quản trị viên để xét duyệt.</p>
            <p>Bạn sẽ nhận được email khi tài khoản được duyệt.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};
const sendOrderPaymentEmail = async (email, orderCode, totalAmount, items) => {
    const total = Number(totalAmount) || 0;

    const itemsHTML = Array.isArray(items) && items.length > 0
      ? items.map(item => {
          const price = Number(item?.price) || 0;
          const quantity = Number(item?.quantity) || 1;
          const name = item?.name || "N/A";
          return `
            <tr>
              <td style="padding:8px; border:1px solid #ddd;">${name}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center;">${quantity}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:right;">${price.toLocaleString()}₫</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:right;">${(price * quantity).toLocaleString()}₫</td>
            </tr>
          `;
        }).join("")
      : `
        <tr>
          <td colspan="4" style="padding:8px; text-align:center;">Không có sản phẩm</td>
        </tr>
      `;

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: `Xác nhận thanh toán đơn hàng #${orderCode}`,
        html: `
        <div style="font-family:Arial,sans-serif; color:#333; line-height:1.6; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:10px; background:#f9f9f9;">
          <h2 style="color:#4CAF50;">🎉 Cảm ơn bạn đã mua hàng!</h2>
          <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đã được thanh toán thành công.</p>
          
          <h3 style="border-bottom:1px solid #ddd; padding-bottom:5px;">Chi tiết sản phẩm</h3>
          <table style="width:100%; border-collapse:collapse; margin-top:10px;">
            <thead>
              <tr>
                <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">Sản phẩm</th>
                <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">SL</th>
                <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">Đơn giá</th>
                <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <h3 style="text-align:right; margin-top:15px;">Tổng: <span style="color:#e91e63;">${total.toLocaleString()}₫</span></h3>

          <p style="margin-top:30px;">Bạn có thể xem lịch sử đơn hàng trong tài khoản của mình.</p>
          <p>Chúc bạn một ngày tốt lành!<br/><strong>Shop của bạn</strong></p>
        </div>
        `
    };

    await transporter.sendMail(mailOptions);
};


module.exports = {
    sendSellerRegisterEmail,
    sendOrderPaymentEmail
};
