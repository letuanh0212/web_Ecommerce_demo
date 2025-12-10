

import instance from "./axios.cusomize";   // instance đã unwrap `response.data` trong interceptor

const recommenderApi = async (userId) => {
  try {
    const URL = `/api/user/${userId}`;
    // instance.get trả về trực tiếp `response.data` vì interceptor đã unwrap
    const response = await instance.get(URL);

    // response có thể là { recommended: [...] } hoặc mảng trực tiếp
    if (Array.isArray(response?.recommended)) {
      return response.recommended;
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  } catch (error) {
    console.error("Error calling recommender API:", error);
    return [];
  }
};

export { recommenderApi };