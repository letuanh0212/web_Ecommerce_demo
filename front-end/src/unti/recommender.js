import instance from "./axios.cusomize";   // <-- SỬA ĐÚNG CHỮ customize

const recommenderApi = async (userId) => {
  try {
    const URL = `/api/user/${userId}`;
    const response = await instance.get(URL);

    // API có thể trả { recommended: [...] } hoặc []
    if (Array.isArray(response.data?.recommended)) {
      return response.data.recommended;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("Error calling recommender API:", error);
    return [];
  }
};

export { recommenderApi };
