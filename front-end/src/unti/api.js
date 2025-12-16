import instance from "./axios.cusomize";

// ======================
// AUTH
// ======================
const createUserApi = (name, email, phone, address, password, role) => {
    return instance.post("/api/register", {
        name, email, phone, address, password, role
    });
};

const LoginApi = (email, password) => {
    return instance.post("/api/login", { email, password });
};


// ======================
// USER
// ======================
const getUserApi = () => {
    return instance.get("/api/users");
};


// ======================
// SELLER
// ======================
const getSellerApi = () => {
    return instance.get("/api/sellers");
};

const getcheckStoreApi = (userId) => {
    return instance.get(`/api/seller/store/${userId}`);
};


// ======================
// ARTICLES / BLOG
// ======================
const getAllArticlesApi = () => {
    return instance.get("/api/articles");
};

const getArticleDetailApi = (id) => {
    return instance.get(`/api/articles/${id}`);
};

const likeArticleApi = (id) => {
    return instance.put(`/api/articles/${id}/like`);
};


// ======================
// PRODUCTS & CATEGORIES
// ======================
const getAllProductsApi = () => {
    return instance.get("/api/items");
};

const getAllCategoriesApi = () => {
    return instance.get("/api/categories");
};


// ======================
// ORDER (USER)
// ======================
const getUserOrderHistoryApi = () => {
    return instance.get("/api/orders/user/history");
};

const getOrderDetailApi = (orderId) => {
    return instance.get(`/api/orders/${orderId}`);
};

const cancelOrderApi = (orderId) => {
    return instance.post(`/api/orders/${orderId}/cancel`);
};

// ======================
// ADMIN
// ======================
const getUsersApi = () =>
  instance.get("/api/admin/users");

// Sellers
const getSellersApi = () =>
  instance.get("/api/admin/sellers");

// Orders list (limit optional)
const getOrdersApi = (limit = 1000) =>
  instance.get(`/api/admin/orders?limit=${limit}`);

// Delete store
const deleteStoreApi = (storeId) =>
  instance.delete(`/api/admin/stores/${storeId}`);

const getAllOrdersApi = () => {
    return instance.get("/api/admin/orders");
};

const getStatsApi = () => {
    return instance.get("/api/admin/stats");
}
// ======================
// EXPORT
// ======================
export {
    createUserApi,
    LoginApi,
    getUserApi,
    getSellerApi,
    getcheckStoreApi,

    getAllArticlesApi,
    getArticleDetailApi,
    likeArticleApi,

    getAllProductsApi,
    getAllCategoriesApi,

    getUserOrderHistoryApi,
    getOrderDetailApi,
    cancelOrderApi,

    getAllOrdersApi,
    getStatsApi,
    getUsersApi,
    getSellersApi,
    getOrdersApi,
    deleteStoreApi,
};
