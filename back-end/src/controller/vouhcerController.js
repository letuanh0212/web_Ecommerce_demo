const {
    createVoucherService,
    getVouchersByStoreService,
    getVoucherByCodeService,
    updateVoucherService,
    deleteVoucherService,
    applyVoucherService,
    saveVoucherService,
    getUserVouchersService
} = require("../service/voucherService");

const createVoucherController = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        const voucher = await createVoucherService(data, userId);

        res.status(201).json({
            message: "Voucher created successfully",
            voucher
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getVouchersByStoreController = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const vouchers = await getVouchersByStoreService(storeId);

        res.status(200).json({
            message: "Vouchers fetched successfully",
            vouchers
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getVoucherByCodeController = async (req, res) => {
    try {
        const { code } = req.params;
        const { storeId } = req.query;

        const voucher = await getVoucherByCodeService(code, storeId);

        res.status(200).json({
            message: "Voucher fetched successfully",
            voucher
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateVoucherController = async (req, res) => {
    try {
        const userId = req.user.id;
        const voucherId = req.params.id;

        await updateVoucherService(voucherId, req.body, userId);

        res.status(200).json({ message: "Voucher updated successfully" });
    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const deleteVoucherController = async (req, res) => {
    try {
        const userId = req.user.id;
        const voucherId = req.params.id;

        await deleteVoucherService(voucherId, userId);

        res.status(200).json({ message: "Voucher deleted successfully" });

    } catch (err) {
        res.status(403).json({ message: err.message });
    }
};

const applyVoucherController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, code, orderId } = req.body;

        const result = await applyVoucherService(userId, storeId, code, orderId);

        res.status(200).json({
            message: "Voucher applied successfully",
            ...result
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const saveVoucherController = async (req, res) => {
    try {
        const userId = req.user.id;
        const voucherId = req.params.id;

        const userVoucher = await saveVoucherService(userId, voucherId);

        res.status(201).json({
            message: "Voucher saved successfully",
            success: true,
            userVoucher
        });
    } catch (err) {
        // Return 409 for "already saved" to distinguish from other errors
        const status = err.message.includes("already") ? 409 : 400;
        res.status(status).json({ message: err.message, success: false });
    }
};

// GET USER'S SAVED VOUCHER IDS FOR A STORE
const getUserSavedVoucherIdsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const storeId = req.params.storeId;

        const pool = require("../config/database").poolPromise;
        const sql = require("mssql");
        const poolInstance = await pool;

        const result = await poolInstance.request()
            .input("user_id", sql.Int, userId)
            .input("store_id", sql.Int, storeId)
            .query(`
                SELECT uv.voucher_id
                FROM UserVouchers uv
                JOIN Vouchers v ON uv.voucher_id = v.id
                WHERE uv.user_id = @user_id AND v.store_id = @store_id
            `);

        const savedIds = result.recordset.map(r => r.voucher_id);
        res.status(200).json({
            message: "Saved voucher IDs fetched",
            savedVoucherIds: savedIds
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserVouchersController = async (req, res) => {
    try {
        const userId = req.user.id;
        const vouchers = await getUserVouchersService(userId);

        res.status(200).json({
            message: "User vouchers fetched successfully",
            vouchers
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createVoucherController,
    getVouchersByStoreController,
    getVoucherByCodeController,
    updateVoucherController,
    deleteVoucherController,
    applyVoucherController,
    saveVoucherController,
    getUserVouchersController,
    getUserSavedVoucherIdsController
};
