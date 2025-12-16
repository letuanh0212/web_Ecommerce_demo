const {
    createVoucherService,
    getVouchersByStoreService,
    getVoucherByCodeService,
    updateVoucherService,
    deleteVoucherService,
    applyVoucherService
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

module.exports = {
    createVoucherController,
    getVouchersByStoreController,
    getVoucherByCodeController,
    updateVoucherController,
    deleteVoucherController,
    applyVoucherController
};
