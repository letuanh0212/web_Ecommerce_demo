const { poolPromise } = require("../config/Sql");
const { analyzeTextES } = require("./elasticAnalyze");

// LẤY ITEM + TẠO TEXT TF-IDF
const getItemsWithText = async () => {
    const pool = await poolPromise;

    // Query lấy items từ SQL
    const result = await pool.request().query(`
        SELECT 
            i.id, 
            i.name, 
            i.description, 
            c.name AS category_name
        FROM Items i
        LEFT JOIN Categories c ON i.category_id = c.id
        ORDER BY i.id DESC
    `);

    const items = result.recordset;   // <<--- BẠN BỊ MẤT DÒNG NÀY

    // Phân tích text bằng Elasticsearch, CHẠY TUẦN TỰ để tránh lỗi 429
    const itemsWithKeywords = [];

    for (const item of items) {
        const combined = `${item.name} ${item.description} ${item.category_name}`;
        const keywords = await analyzeTextES(combined);

        itemsWithKeywords.push({
            id: item.id,
            name: item.name,
            text: keywords
        });

        // Nghỉ 50ms để Elasticsearch không quá tải
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return itemsWithKeywords;
};


// LẤY LỊCH SỬ USER ĐÃ XEM / MUA
const getUserHistory = async (userId) => {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT oi.item_id
        FROM OrderItems oi
        INNER JOIN Orders o ON oi.order_id = o.id
        WHERE o.user_id = ${userId}
        ORDER BY o.createdAt DESC
    `);

    // Trả về mảng [item_id, item_id, ...]
    return result.recordset.map(r => r.item_id);
};

module.exports = { 
    getItemsWithText,
    getUserHistory
};
