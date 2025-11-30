import instance from "./axios.cusomize";


// GET all items by store
const getItemsByStoreApi = (storeId) => {
  const URL = `/v1/api/seller/items/${storeId}`;
  return instance.get(URL);
};

// CREATE item
const createItemApi = (data) => {
  const URL = `/v1/api/seller/items`;
  return instance.post(URL, data);
};

// UPDATE item
const updateItemApi = (itemId, data) => {
  const URL = `/v1/api/seller/items/${itemId}`;
  return instance.put(URL, data);
};

// DELETE item
const deleteItemApi = (itemId) => {
  const URL = `/v1/api/seller/items/${itemId}`;
  return instance.delete(URL);
};

export {
  getItemsByStoreApi,
  createItemApi,
  updateItemApi,
  deleteItemApi,
};
