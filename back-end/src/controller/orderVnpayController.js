// controllers/orderVnpayController.js
const { poolPromise, sql } = require("../config/Sql");
const { vnpay } = require('../config/vnpay'); // config vnpay bạn đã có

// Tạo order + order items và trả về paymentUrl
const createOrderAndVnpay = async (req, res) => {
  try {
    const userId = req.user?.id || null; // verifyToken middleware có thể set req.user
    const { items, email, total_amount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    const pool = await poolPromise;
    const trx = pool.transaction(); // nếu DB MSSQL, dùng transaction
    await trx.begin();

    try {
      // 1) Insert order vào Orders table (giả định table Orders có columns: id (IDENTITY), user_id, email, total_amount, status, created_at)
      const insertOrderQuery = `
        INSERT INTO Orders (user_id, email, total_amount, status, created_at)
        OUTPUT INSERTED.id
        VALUES (@userId, @email, @totalAmount, @status, GETDATE())
      `;

      const orderResult = await trx.request()
        .input('userId', sql.Int, userId)
        .input('email', sql.NVarChar, email || null)
        .input('totalAmount', sql.Decimal(18,2), total_amount || 0)
        .input('status', sql.NVarChar, 'PENDING')
        .query(insertOrderQuery);

      const orderId = orderResult.recordset[0].id;

      // 2) Insert order items
      const insertItemRequest = trx.request();
      for (const it of items) {
        // it: { item_id, variant_id, quantity, price }
        await trx.request()
          .input('orderId', sql.Int, orderId)
          .input('itemId', sql.Int, it.item_id)
          .input('variantId', sql.Int, it.variant_id || null)
          .input('qty', sql.Int, it.quantity)
          .input('price', sql.Decimal(18,2), it.price)
          .query(`
            INSERT INTO OrderItems (order_id, item_id, variant_id, quantity, price)
            VALUES (@orderId, @itemId, @variantId, @qty, @price)
          `);
      }

      // 3) Commit transaction
      await trx.commit();

      // 4) Build vnpay payment url (reuse your vnpay util)
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: total_amount,          // theo vnpay config hiện tại của bạn
        vnp_TxnRef: orderId.toString(),
        vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
        vnp_ReturnUrl: process.env.VNP_RETURN_URL,
        vnp_IpAddr: req.ip || '127.0.0.1',
        vnp_OrderType: 'other'
      });

      return res.json({ orderId, paymentUrl });

    } catch (errInner) {
      await trx.rollback();
      console.error("Transaction error:", errInner);
      return res.status(500).json({ message: "Error creating order" });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createOrderAndVnpay };
