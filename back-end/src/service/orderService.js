// src/service/orderService.js
const { poolPromise, sql } = require("../config/Sql");

// ===========================
// 1. CREATE ORDER
// ===========================
const createCODOrderService = async (userId, data) => {
    const { items, shipping_name, shipping_phone, shipping_address, note } = data;

    console.log("[orderService] createCODOrderService called", { userId, itemsCount: items?.length });

    if (!items || items.length === 0) throw new Error("No items in order");

    let totalAmount = 0;
    items.forEach(i => totalAmount += i.price * i.quantity);

    const finalAmount = totalAmount;

    const pool = await poolPromise;

    const transaction = new sql.Transaction(pool);

    try {
        console.log("[orderService] beginning transaction for order, totalAmount:", totalAmount);
        await transaction.begin();

        // Create order inside transaction
        const req = new sql.Request(transaction);
        const orderResult = await req
            .input("user_id", sql.Int, userId)
            .input("status", sql.NVarChar, "pending")
            .input("total_amount", sql.Decimal(18, 2), totalAmount)
            .input("final_amount", sql.Decimal(18, 2), finalAmount)
            .input("shipping_name", sql.NVarChar, shipping_name)
            .input("shipping_phone", sql.NVarChar, shipping_phone)
            .input("shipping_address", sql.NVarChar, shipping_address)
            .input("note", sql.NVarChar, note || "")
            .query(`
                INSERT INTO Orders (user_id, status, total_amount, final_amount, shipping_name, shipping_phone, shipping_address, note)
                OUTPUT INSERTED.id
                VALUES (@user_id, @status, @total_amount, @final_amount, @shipping_name, @shipping_phone, @shipping_address, @note)
            `);

        const orderId = orderResult.recordset[0].id;

        // Insert order items and decrement stock
        for (let it of items) {
            const subtotal = it.price * it.quantity;

            await new sql.Request(transaction)
                .input("order_id", sql.Int, orderId)
                .input("item_id", sql.Int, it.item_id)
                .input("variant_id", sql.Int, it.variant_id || null)
                .input("quantity", sql.Int, it.quantity)
                .input("price", sql.Decimal(18, 2), it.price)
                .input("subtotal", sql.Decimal(18, 2), subtotal)
                .query(`
                    INSERT INTO OrderItems(order_id, item_id, variant_id, quantity, price, subtotal)
                    VALUES (@order_id, @item_id, @variant_id, @quantity, @price, @subtotal)
                `);

            // If variant exists, check and decrement variant stock
            if (it.variant_id) {
                const vRes = await new sql.Request(transaction)
                    .input("id", sql.Int, it.variant_id)
                    .query("SELECT stock FROM ItemVariants WHERE id=@id");

                if (vRes.recordset.length === 0) throw new Error("Variant not found");
                const cur = vRes.recordset[0].stock || 0;
                if (cur < it.quantity) throw new Error("Insufficient variant stock");

                await new sql.Request(transaction)
                    .input("qty", sql.Int, it.quantity)
                    .input("id", sql.Int, it.variant_id)
                    .query("UPDATE ItemVariants SET stock = stock - @qty WHERE id = @id");
            }

            // Decrement item stock
            const iRes = await new sql.Request(transaction)
                .input("id", sql.Int, it.item_id)
                .query("SELECT stock FROM Items WHERE id=@id");

            if (iRes.recordset.length === 0) throw new Error("Item not found");
            const itemCur = iRes.recordset[0].stock || 0;
            if (itemCur < it.quantity) throw new Error("Insufficient item stock");

            await new sql.Request(transaction)
                .input("qty", sql.Int, it.quantity)
                .input("id", sql.Int, it.item_id)
                .query("UPDATE Items SET stock = stock - @qty WHERE id = @id");
        }

        await transaction.commit();
        console.log("[orderService] transaction committed, orderId:", orderId);

        return {
            orderId,
            totalAmount,
            finalAmount,
            status: "pending",
        };

    } catch (err) {
        console.error("[orderService] transaction error, rolling back:", err.message);
        await transaction.rollback();
        throw new Error(err.message);
    }
};


// ===========================
// 2. GET ORDERS BY USER
// ===========================
const getOrdersByUserService = async (userId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("user_id", sql.Int, userId)
        .query(`
            SELECT 
                id, user_id, total_amount, final_amount, status,
                shipping_name, shipping_phone, shipping_address, note,
                createdAt, updatedAt
            FROM Orders
            WHERE user_id = @user_id
            ORDER BY createdAt DESC
        `);

    return result.recordset;
};


// ===========================
// 3. GET ORDER DETAILS
// ===========================
// const getOrderDetailService = async (orderId, userId) => {
//     const pool = await poolPromise;

//     const orderResult = await pool.request()
//         .input("id", sql.Int, orderId)
//         .query(`SELECT * FROM Orders WHERE id = @id`);

//     if (orderResult.recordset.length === 0) return null;

//     const order = orderResult.recordset[0];

//     // Check quyền user
//     if (userId && order.user_id !== userId)
//         throw new Error("Access denied");

//     // Lấy items
//     const itemsResult = await pool.request()
//         .input("order_id", sql.Int, orderId)
//         .query(`
//             SELECT 
//                 oi.*,
//                 i.name AS item_name,
//                 COALESCE(iv.image, 
//                     (SELECT TOP 1 image FROM ItemImages WHERE item_id = i.id)
//                 ) AS item_image
//             FROM OrderItems oi
//             JOIN Items i ON oi.item_id = i.id
//             LEFT JOIN ItemVariants iv ON oi.variant_id = iv.id
//             WHERE oi.order_id = @order_id
//         `);

//     order.items = itemsResult.recordset;
//     return order;
// };


const getOrderDetailService = async (orderId, userId) => { // userId để check quyền xem
    try {
        const pool = await poolPromise;
        
        // Lấy thông tin chung
        const orderResult = await pool.request()
            .input("id", sql.Int, orderId)
            .query("SELECT * FROM Orders WHERE id = @id");

        if (orderResult.recordset.length === 0) return null;
        const order = orderResult.recordset[0];

        // Check quyền (Chỉ chủ đơn hoặc Admin/Seller mới được xem - tạm thời check chủ đơn)
        // if (order.user_id !== userId) throw new Error("Forbidden"); 

        // Lấy chi tiết món
        const itemsResult = await pool.request()
            .input("order_id", sql.Int, orderId)
            .query(`
                SELECT 
                    oi.*, 
                    i.name as item_name, 
                    -- Ưu tiên lấy ảnh của variant (nếu có), nếu không thì lấy ảnh chính của sản phẩm
                    COALESCE(iv.image, (SELECT TOP 1 image FROM ItemImages WHERE item_id = i.id)) as item_image
                FROM OrderItems oi
                JOIN Items i ON oi.item_id = i.id
                -- Dùng LEFT JOIN vì không phải sản phẩm nào trong đơn hàng cũng có variant
                LEFT JOIN ItemVariants iv ON oi.variant_id = iv.id
                WHERE oi.order_id = @order_id
            `);

        order.items = itemsResult.recordset;
        return order;
    } catch (err) {
        throw new Error(err.message);
    }
};

// ===========================
// 4. UPDATE ORDER STATUS
// ===========================
const updateOrderStatusService = async (id, status) => {
    const pool = await poolPromise;

    await pool.request()
        .input("id", sql.Int, id)
        .input("status", sql.NVarChar(50), status)
        .query(`
            UPDATE Orders 
            SET status = @status, updatedAt = GETDATE() 
            WHERE id = @id
        `);

    return true;
};


// ===========================
// 5. CANCEL ORDER (RESTOCK)
// ===========================
const cancelOrderService = async (orderId) => {
    const pool = await poolPromise;

    const check = await pool.request()
        .input("id", sql.Int, orderId)
        .query(`SELECT status FROM Orders WHERE id = @id`);

    if (check.recordset.length === 0) throw new Error("Order not found");

    const status = check.recordset[0].status;

    if (["cancelled", "shipped", "completed"].includes(status))
        throw new Error(`Cannot cancel order with status: ${status}`);

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const itemsResult = await new sql.Request(transaction)
            .input("order_id", sql.Int, orderId)
            .query("SELECT * FROM OrderItems WHERE order_id = @order_id");

        // hoàn kho
        for (const item of itemsResult.recordset) {

            if (item.variant_id) {
                await new sql.Request(transaction)
                    .input("qty", sql.Int, item.quantity)
                    .input("id", sql.Int, item.variant_id)
                    .query("UPDATE ItemVariants SET stock = stock + @qty WHERE id = @id");
            }

            await new sql.Request(transaction)
                .input("qty", sql.Int, item.quantity)
                .input("id", sql.Int, item.item_id)
                .query("UPDATE Items SET stock = stock + @qty WHERE id = @id");
        }

        await new sql.Request(transaction)
            .input("id", sql.Int, orderId)
            .query(`
                UPDATE Orders 
                SET status = 'cancelled', updatedAt = GETDATE()
                WHERE id = @id
            `);

        await transaction.commit();
        return true;

    } catch (err) {
        await transaction.rollback();
        throw new Error(err.message);
    }
};


// ===========================
// 6. GET ORDERS BY STORE
// ===========================
const getOrdersByStoreService = async (storeId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("store_id", sql.Int, storeId)
        .query(`
            SELECT DISTINCT 
                o.id, o.user_id,
                u.name AS user_name,
                o.total_amount, o.final_amount, o.status,
                o.shipping_name, o.shipping_phone, o.shipping_address, o.note,
                o.createdAt, o.updatedAt
            FROM Orders o
            JOIN OrderItems oi ON o.id = oi.order_id
            JOIN Items i ON oi.item_id = i.id
            JOIN Users u ON o.user_id = u.id
            WHERE i.store_id = @store_id
            ORDER BY o.createdAt DESC
        `);

    return result.recordset;
};


// ===========================
module.exports = {
    createCODOrderService,
    getOrdersByUserService,
    getOrderDetailService,
    updateOrderStatusService,
    cancelOrderService,
    getOrdersByStoreService
};
