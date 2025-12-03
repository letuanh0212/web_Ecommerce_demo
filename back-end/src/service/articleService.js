const { poolPromise, sql } = require("../config/Sql");

// 1. Service: Tạo bài viết
const createArticleService = async (data) => {
    try {
        const { store_id, item_id, title, description, image, isPublished } = data;
        const pool = await poolPromise;
        const result = await pool.request()
            .input("store_id", sql.Int, store_id)
            .input("item_id", sql.Int, item_id)
            .input("title", sql.NVarChar, title)
            .input("description", sql.NVarChar, description)
            .input("image", sql.NVarChar, image)
            .input("isPublished", sql.Bit, isPublished || 0)
            .query(`
                INSERT INTO Articles (store_id, item_id, title, description, image, isPublished)
                OUTPUT INSERTED.*
                VALUES (@store_id, @item_id, @title, @description, @image, @isPublished)
            `);
        return result.recordset[0];
    } catch (err) {
        throw new Error(err.message);
    }
};

// 2. Service: Lấy tất cả bài viết
const getAllArticlesService = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query("SELECT * FROM Articles WHERE isPublished = 1 ORDER BY createdAt DESC");
        return result.recordset;
    } catch (err) {
        throw new Error(err.message);
    }
};

// 3. Service: Lấy bài viết theo Store
const getArticlesByStoreService = async (storeId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("store_id", sql.Int, storeId)
            .query("SELECT * FROM Articles WHERE store_id = @store_id");
        return result.recordset;
    } catch (err) {
        throw new Error(err.message);
    }
};

// 4. Service: Lấy chi tiết bài viết (và tăng view)
const getArticleByIdService = async (id) => {
    try {
        const pool = await poolPromise;
        // Tăng view
        await pool.request()
            .input("id", sql.Int, id)
            .query("UPDATE Articles SET views = views + 1 WHERE id = @id");

        // Lấy chi tiết
        const result = await pool.request()
            .input("id_select", sql.Int, id)
            .query("SELECT * FROM Articles WHERE id = @id_select");

        return result.recordset[0];
    } catch (err) {
        throw new Error(err.message);
    }
};

// 5. Service: Cập nhật bài viết
const updateArticleService = async (id, data) => {
    try {
        const { title, description, image, isPublished } = data;
        const pool = await poolPromise;
        await pool.request()
            .input("id", sql.Int, id)
            .input("title", sql.NVarChar, title)
            .input("description", sql.NVarChar, description)
            .input("image", sql.NVarChar, image)
            .input("isPublished", sql.Bit, isPublished)
            .query(`
                UPDATE Articles
                SET title = @title, 
                    description = @description, 
                    image = @image, 
                    isPublished = @isPublished,
                    updatedAt = GETDATE()
                WHERE id = @id
            `);
        return true;
    } catch (err) {
        throw new Error(err.message);
    }
};

// 6. Service: Xóa bài viết
const deleteArticleService = async (id) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Articles WHERE id = @id");
        return true;
    } catch (err) {
        throw new Error(err.message);
    }
};

// 7. Service: Tăng lượt Like (Lưu User ID vào mảng JSON)
const likeArticleService = async (articleId, userId) => {
    const pool = await poolPromise;
    
    // 1. Lấy thông tin hiện tại của bài viết
    const articleResult = await pool.request()
        .input("id", sql.Int, articleId)
        .query("SELECT liked_by_users, likes FROM Articles WHERE id = @id");

    if (articleResult.recordset.length === 0) {
        throw new Error("Bài viết không tồn tại");
    }

    const article = articleResult.recordset[0];
    
    // 2. Parse chuỗi JSON từ SQL ra mảng Javascript
    let likedUsers = [];
    try {
        // Nếu null hoặc rỗng thì coi như mảng rỗng
        likedUsers = JSON.parse(article.liked_by_users || "[]");
    } catch (e) {
        likedUsers = [];
    }

    // 3. QUAN TRỌNG: Kiểm tra xem User này đã có trong danh sách chưa
    const userIdInt = parseInt(userId); // Đảm bảo so sánh số với số
    if (likedUsers.includes(userIdInt)) {
        throw new Error("Bạn đã thích bài viết này rồi!");
    }

    // 4. Nếu chưa like -> Thêm ID vào mảng
    likedUsers.push(userIdInt);

    // 5. Convert ngược lại thành chuỗi JSON để lưu xuống SQL
    const newLikedJson = JSON.stringify(likedUsers);

    // 6. Cập nhật xuống DB
    await pool.request()
        .input("id", sql.Int, articleId)
        .input("json", sql.NVarChar, newLikedJson)
        .query(`
            UPDATE Articles 
            SET likes = likes + 1, 
                liked_by_users = @json 
            WHERE id = @id
        `);

    return true;
};
module.exports = {
    createArticleService,
    getAllArticlesService,
    getArticlesByStoreService,
    getArticleByIdService,
    updateArticleService,
    deleteArticleService,
    likeArticleService
};