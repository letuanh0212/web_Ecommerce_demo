const { poolPromise, sql } = require("../config/Sql");

// Lấy items + variants
const getItemsWithFeatures = async () => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT 
                i.id AS item_id, i.name, i.category_id, i.price, 
                v.id AS variant_id, v.size, v.color, v.pattern
            
                FROM Items i
                LEFT JOIN ItemVariants v ON v.item_id = i.id
        `);

        const itemsRaw = result.recordset;
        if (!itemsRaw.length) return [];

        const categories = [...new Set(itemsRaw.map(i => i.category_id).filter(c => c !== null))];
        const colors = [...new Set(itemsRaw.map(i => i.color).filter(c => c))];
        const sizes = [...new Set(itemsRaw.map(i => i.size).filter(s => s))];
        const patterns = [...new Set(itemsRaw.map(i => i.pattern).filter(p => p))];
        const maxPrice = Math.max(...itemsRaw.map(i => i.price));

        const encodeFeaturesForItem = (item, variants) => {
            const categoryVec = categories.map(c => (c === item.category_id ? 1 : 0));
            const colorVec = colors.map(c => variants.some(v => v.color === c) ? 1 : 0);
            const sizeVec = sizes.map(s => variants.some(v => v.size === s) ? 1 : 0);
            const patternVec = patterns.map(p => variants.some(v => v.pattern === p) ? 1 : 0);
            const priceNorm = [item.price / maxPrice];
            return [...categoryVec, ...colorVec, ...sizeVec, ...patternVec, ...priceNorm];
        };

        const itemsGrouped = {};
        itemsRaw.forEach(row => {
            if (!itemsGrouped[row.item_id]) {
                itemsGrouped[row.item_id] = {
                    id: row.item_id,
                    name: row.name,
                    category_id: row.category_id,
                    price: row.price,
                    variants: []
                };
            }
            if (row.variant_id) {
                itemsGrouped[row.item_id].variants.push({
                    id: row.variant_id,
                    size: row.size,
                    color: row.color,
                    pattern: row.pattern
                });
            }
        });

        const items = Object.values(itemsGrouped).map(item => ({
            id: item.id,
            name: item.name,
            category_id: item.category_id,
            price: item.price,
            features: encodeFeaturesForItem(item, item.variants)
        }));

        return items;
    } catch (err) {
        console.error("Error getting items:", err);
        return [];
    }
};

// Lấy lịch sử user
const getUserHistory = async (userId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT oi.item_id
                FROM Orders o
                JOIN OrderItems oi ON o.id = oi.order_id
                WHERE o.user_id = @userId
            `);
        return result.recordset.map(r => r.item_id);
    } catch (err) {
        console.error("Error getting user history:", err);
        return [];
    }
};

module.exports = { getItemsWithFeatures, getUserHistory };
