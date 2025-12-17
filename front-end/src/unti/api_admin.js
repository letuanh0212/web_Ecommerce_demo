import instance from './axios.cusomize'; // axios instance unwraps `response.data`

const adminApi = {
  getUsers: () => instance.get('/api/admin/users'),
  getSellers: () => instance.get('/api/admin/sellers'),
  //getStats: () => instance.get('/api/admin/stats'),
  getStores: () => instance.get('/api/admin/stores'),
  getOrders: (limit = 1000) => instance.get(`/api/admin/orders?limit=${limit}`),
  deleteStore: (id) => instance.delete(`/api/admin/stores/${id}`),
  // User management
  createUser: (data) => instance.post('/api/admin/users', data),
  updateUser: (id, data) => instance.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => instance.delete(`/api/admin/users/${id}`),
  lockUser: (id, lock = true) => instance.put(`/api/admin/users/${id}/lock`, { lock }),
};

export default adminApi;