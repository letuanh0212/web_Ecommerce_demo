const { poolPromise } = require("../config/Sql");

// Lấy items + build text TF-IDF
const getItemsWithText = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT 
      i.id, i.name, COALESCE(i.description,'') AS description, 
      c.name AS category_name, i.createdAt
    FROM Items i
    LEFT JOIN Categories c ON i.category_id = c.id
    ORDER BY i.createdAt DESC
  `);

  const items = result.recordset || [];

  return items.map(it => ({
    id: it.id,
    name: it.name,
    text: `${it.name} ${it.description} ${it.category_name}`.trim()
  }));
};
 
// Lấy lịch sử mua hàng user
const getUserHistory = async (userId) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("userId", userId)
    .query(`
      SELECT oi.item_id
      FROM OrderItems oi
      INNER JOIN Orders o ON oi.order_id = o.id
      WHERE o.user_id = @userId
      ORDER BY o.createdAt DESC
    `);

  return result.recordset.map(r => r.item_id);
};

module.exports = { getItemsWithText, getUserHistory };
