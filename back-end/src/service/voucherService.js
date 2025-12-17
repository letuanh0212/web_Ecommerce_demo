const { poolPromise, sql } = require("../config/Sql");

// CHECK OWNER OF STORE
const checkStoreOwnership = async (storeId, userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("id", sql.Int, storeId)
        .query(`SELECT owner_id FROM Stores WHERE id=@id`);

    if (result.recordset.length === 0) return false;
    const ownerId = result.recordset[0].owner_id;
    // log for debugging ownership checks
    console.log(`checkStoreOwnership: storeId=${storeId}, ownerId=${ownerId}, userId=${userId}`);
    // allow loose equality to tolerate string/number types from token
    return ownerId == userId;
};

// CHECK DUPLICATE VOUCHER CODE
const checkDuplicateCode = async (code, storeId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("code", sql.NVarChar, code)
        .input("store_id", sql.Int, storeId)
        .query(`
            SELECT id FROM Vouchers
            WHERE code=@code AND store_id=@store_id
        `);

    return result.recordset.length > 0;
};

// CREATE
const createVoucherService = async (data, userId) => {
    try {
        const {
            store_id,
            code,
            discount_type,
            discount_value,
            min_order_value,
            quantity,
            start_date,
            end_date
        } = data;

        // Check owner
        const isOwner = await checkStoreOwnership(store_id, userId);
        if (!isOwner) throw new Error("Forbidden: You are not the owner of this store");

        // Check duplicate code
        const exists = await checkDuplicateCode(code, store_id);
        if (exists) throw new Error("Voucher code already exists in this store");

        const pool = await poolPromise;

        const result = await pool.request()
            .input("store_id", sql.Int, store_id)
            .input("code", sql.NVarChar, code)
            .input("discount_type", sql.VarChar, discount_type)
            .input("discount_value", sql.Decimal(18, 2), discount_value)
            .input("min_order_value", sql.Decimal(18, 2), min_order_value)
            .input("quantity", sql.Int, quantity)
            .input("start_date", sql.DateTime, start_date)
            .input("end_date", sql.DateTime, end_date)
            .query(`
                INSERT INTO Vouchers
                (store_id, code, discount_type, discount_value, min_order_value, quantity, start_date, end_date)
                OUTPUT INSERTED.*
                VALUES (@store_id, @code, @discount_type, @discount_value, @min_order_value, @quantity, @start_date, @end_date)
            `);

        return result.recordset[0];

    } catch (err) {
        throw new Error(err.message);
    }
};

// GET ALL BY STORE
const getVouchersByStoreService = async (storeId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("store_id", sql.Int, storeId)
        .query(`
            SELECT *
            FROM Vouchers
            WHERE store_id=@store_id
            ORDER BY id DESC
        `);
    return result.recordset;
};

// GET BY CODE (LOCAL ONLY – REMOVE GLOBAL)
const getVoucherByCodeService = async (code, storeId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("code", sql.NVarChar, code)
        .input("store_id", sql.Int, storeId)
        .query(`
            SELECT *
            FROM Vouchers
            WHERE code=@code
            AND store_id=@store_id
            AND quantity > 0
            AND start_date <= GETDATE()
            AND end_date >= GETDATE()
        `);

    return result.recordset[0] || null;
};

// UPDATE
const updateVoucherService = async (id, data, userId) => {
    try {
        const pool = await poolPromise;

        // Get voucher
        const voucherRes = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT store_id, code FROM Vouchers WHERE id=@id");

        if (voucherRes.recordset.length === 0)
            throw new Error("Voucher does not exist");

        const { store_id, code: oldCode } = voucherRes.recordset[0];

        // Check owner
        const isOwner = await checkStoreOwnership(store_id, userId);
        if (!isOwner) throw new Error("Forbidden: Not owner");

        // Check duplicate code if changing code
        if (data.code && data.code !== oldCode) {
            const exists = await checkDuplicateCode(data.code, store_id);
            if (exists) throw new Error("Voucher code already exists");
        }

        const {
            code,
            discount_type,
            discount_value,
            min_order_value,
            quantity,
            start_date,
            end_date
        } = data;

        await pool.request()
            .input("id", sql.Int, id)
            .input("code", sql.NVarChar, code)
            .input("discount_type", sql.VarChar, discount_type)
            .input("discount_value", sql.Decimal(18, 2), discount_value)
            .input("min_order_value", sql.Decimal(18, 2), min_order_value)
            .input("quantity", sql.Int, quantity)
            .input("start_date", sql.DateTime, start_date)
            .input("end_date", sql.DateTime, end_date)
            .query(`
                UPDATE Vouchers
                SET code=@code, discount_type=@discount_type, discount_value=@discount_value,
                    min_order_value=@min_order_value, quantity=@quantity,
                    start_date=@start_date, end_date=@end_date
                WHERE id=@id
            `);

        return true;

    } catch (err) {
        throw new Error(err.message);
    }
};

// DELETE
const deleteVoucherService = async (id, userId) => {
    const pool = await poolPromise;

    const voucherRes = await pool.request()
        .input("id", sql.Int, id)
        .query("SELECT store_id FROM Vouchers WHERE id=@id");

    if (voucherRes.recordset.length === 0)
        throw new Error("Voucher does not exist");

    const storeId = voucherRes.recordset[0].store_id;

    const isOwner = await checkStoreOwnership(storeId, userId);
    if (!isOwner) throw new Error("Forbidden: Not owner");

    await pool.request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Vouchers WHERE id=@id");

    return true;
};

// APPLY VOUCHER
const applyVoucherService = async (userId, storeId, code, orderId) => {
    try {
        const pool = await poolPromise;

        // Get voucher
        const voucher = await getVoucherByCodeService(code, storeId);
        if (!voucher) throw new Error("Invalid or expired voucher");

        // Get order
        const orderRes = await pool.request()
            .input("id", sql.Int, orderId)
            .query("SELECT * FROM Orders WHERE id=@id");

        if (orderRes.recordset.length === 0)
            throw new Error("Order does not exist");

        const order = orderRes.recordset[0];

        // CHECK store of order
        if (order.store_id !== storeId)
            throw new Error("Voucher does not belong to this store");

        // CHECK min value
        if (order.total_amount < voucher.min_order_value)
            throw new Error("Order does not meet minimum value");

        // CALCULATE
        let discount = voucher.discount_type === "percent"
            ? order.total_amount * (voucher.discount_value / 100)
            : voucher.discount_value;

        if (discount > order.total_amount) discount = order.total_amount;

        const finalAmount = order.total_amount - discount;

        // UPDATE ORDER
        await pool.request()
            .input("id", sql.Int, orderId)
            .input("final_amount", sql.Decimal(18, 2), finalAmount)
            .query(`
                UPDATE Orders
                SET final_amount=@final_amount
                WHERE id=@id
            `);

        // REDUCE QUANTITY
        await pool.request()
            .input("id", sql.Int, voucher.id)
            .query("UPDATE Vouchers SET quantity = quantity - 1 WHERE id=@id");

        return { success: true, discount, finalAmount };

    } catch (err) {
        throw new Error(err.message);
    }
};

// GET USER'S SAVED VOUCHERS
const getUserVouchersService = async (userId) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT 
                    uv.id as user_voucher_id,
                    uv.max_uses,
                    uv.used_count,
                    v.id,
                    v.code,
                    v.discount_type,
                    v.discount_value,
                    v.min_order_value,
                    v.quantity,
                    v.start_date,
                    v.end_date,
                    v.store_id,
                    s.name as store_name
                FROM UserVouchers uv
                JOIN Vouchers v ON uv.voucher_id = v.id
                LEFT JOIN Stores s ON v.store_id = s.id
                WHERE uv.user_id = @user_id
                AND uv.used_count < uv.max_uses
                ORDER BY v.end_date ASC
            `);

        return result.recordset;
    } catch (err) {
        throw new Error(err.message);
    }
};

// SAVE VOUCHER (User saves voucher to their collection)
const saveVoucherService = async (userId, voucherId) => {
    try {
        const pool = await poolPromise;

        // Check voucher exists
        const voucherRes = await pool.request()
            .input("id", sql.Int, voucherId)
            .query("SELECT id, quantity FROM Vouchers WHERE id=@id");

        if (voucherRes.recordset.length === 0)
            throw new Error("Voucher does not exist");

        const voucher = voucherRes.recordset[0];

        // Check if user already saved this voucher
        const existRes = await pool.request()
            .input("user_id", sql.Int, userId)
            .input("voucher_id", sql.Int, voucherId)
            .query("SELECT id FROM UserVouchers WHERE user_id=@user_id AND voucher_id=@voucher_id");

        if (existRes.recordset.length > 0)
            throw new Error("Voucher already saved");

        // Insert into UserVouchers
        const result = await pool.request()
            .input("user_id", sql.Int, userId)
            .input("voucher_id", sql.Int, voucherId)
            .input("max_uses", sql.Int, 1)
            .input("used_count", sql.Int, 0)
            .query(`
                INSERT INTO UserVouchers (user_id, voucher_id, max_uses, used_count)
                OUTPUT INSERTED.*
                VALUES (@user_id, @voucher_id, @max_uses, @used_count)
            `);

        // Decrement voucher quantity
        await pool.request()
            .input("id", sql.Int, voucherId)
            .query("UPDATE Vouchers SET quantity = quantity - 1 WHERE id=@id AND quantity > 0");

        return result.recordset[0];

    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = {
    checkStoreOwnership,
    createVoucherService,
    getVouchersByStoreService,
    getVoucherByCodeService,
    updateVoucherService,
    deleteVoucherService,
    applyVoucherService,
    saveVoucherService,
    getUserVouchersService
};
