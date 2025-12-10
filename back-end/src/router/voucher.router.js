const express = require("express");
const router = express.Router();
const { verifyToken,checkRole } = require("../middleware/verify_token");
const {
    createVoucherController,
    getVouchersByStoreController,
    getVoucherByCodeController,
    updateVoucherController,
    deleteVoucherController,
    applyVoucherController
} = require("../controllers/voucherController");

router.post("/", verifyToken, createVoucherController);
router.get("/store/:storeId", getVouchersByStoreController);
router.get("/code/:code", getVoucherByCodeController);
router.put("/:id", verifyToken, updateVoucherController);
router.delete("/:id", verifyToken, deleteVoucherController);
router.post("/apply", verifyToken, applyVoucherController);

module.exports = router;
