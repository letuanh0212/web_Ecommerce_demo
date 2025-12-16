import instance from './axios.cusomize'; // axios instance unwraps `response.data`

const adminApi = {
  getUsers: () => instance.get('/api/admin/users'),
  getSellers: () => instance.get('/api/admin/sellers'),
  getStats: () => instance.get('/api/admin/stats'),
  getOrders: (limit = 1000) => instance.get(`/api/admin/orders?limit=${limit}`),
  deleteStore: (id) => instance.delete(`/api/admin/stores/${id}`),
  // Add more admin-specific wrappers here, e.g.:
  // updateOrderStatus: (orderId, status) => instance.put(`/api/admin/orders/${orderId}/status`, { status })
};

export default adminApi;
