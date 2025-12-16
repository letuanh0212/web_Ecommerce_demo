import instance from './axios.cusomize'; // axios instance unwraps `response.data`

const adminApi = {
  getUsers: () => instance.get('/api/admin/users'),
  getSellers: () => instance.get('/api/admin/sellers'),
  //getStats: () => instance.get('/api/admin/stats'),
  getStores: () => instance.get('/api/admin/stores'),
  getOrders: (limit = 1000) => instance.get(`/api/admin/orders?limit=${limit}`),
  deleteStore: (id) => instance.delete(`/api/admin/stores/${id}`),
};

export default adminApi;
