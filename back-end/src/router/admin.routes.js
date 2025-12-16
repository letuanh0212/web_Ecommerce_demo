const router = require('express').Router();
const { poolPromise } = require('../config/Sql');
const { verifyToken, checkRole } = require('../middleware/verify_token');
const { GetAllUsers, GetAllsellers } = require('../controller/userController');

// All admin routes require authentication + admin role
router.use(verifyToken, checkRole(['admin']));

// Example: get all users (reuse existing controller)
router.get('/users', async (req, res) => {
  try {
    const users = await GetAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Example: get all sellers
router.get('/sellers', async (req, res) => {
  try {
    const sellers = await GetAllsellers();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Example: basic dashboard stats (counts)
router.get('/stats', async (req, res) => {
  try {
    const pool = await poolPromise;

    // Users and sellers counts via existing controllers (may be heavier on DB)
    const users = await GetAllUsers();
    const sellers = await GetAllsellers();

    // Orders count via direct SQL (Orders table expected)
    const ordersResult = await pool.request().query('SELECT COUNT(*) AS totalOrders FROM Orders');
    const totalOrders = ordersResult.recordset && ordersResult.recordset[0] ? ordersResult.recordset[0].totalOrders : 0;

    // Stores count via direct SQL (Stores table expected)
    const storesResult = await pool.request().query('SELECT COUNT(*) AS totalStores FROM Stores');
    const totalStores = storesResult.recordset && storesResult.recordset[0] ? storesResult.recordset[0].totalStores : 0;

    res.json({
      users: Array.isArray(users) ? users.length : null,
      sellers: Array.isArray(sellers) ? sellers.length : null,
      orders: totalOrders,
      stores: totalStores
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: list all orders (with optional limit)
router.get('/orders', async (req, res) => {
  try {
    const { limit } = req.query;
    const pool = await poolPromise;
    const q = `SELECT TOP(${limit && Number(limit) > 0 ? Number(limit) : 1000}) o.*, u.name AS user_name
               FROM Orders o
               LEFT JOIN Users u ON o.user_id = u.id
               ORDER BY o.createdAt DESC`;

    const result = await pool.request().query(q);
    res.json(result.recordset || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: delete a store and related data
router.delete('/stores/:id', async (req, res) => {
  try {
    const storeId = Number(req.params.id);
    if (!storeId) return res.status(400).json({ message: 'Invalid store id' });

    const { deleteStoreCascadeService } = require('../service/storeService');

    await deleteStoreCascadeService(storeId);
    res.json({ message: 'Store and related data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
