import instance from "./axios.cusomize";

// Gọi API gợi ý sản phẩm cho user đã đăng nhập
const recommenderApi = async (userId) => {
  try {
    const URL = `/api/user/${userId}`; // truyền userId trong URL
    const response = await instance.get(URL);
    return response.data; // { recommended: [...] }
  } catch (error) {
    console.error("Error calling recommender API:", error);
    return { recommended: [] }; // fallback nếu lỗi
  }
};

export { recommenderApi };
