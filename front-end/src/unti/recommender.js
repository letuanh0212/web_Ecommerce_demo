import instance from "./axios.cusomize";

const recommenderApi = async (userId) => {
  try {
    const response = await instance.get(
      `http://localhost:8000/recommend/${userId}`
    );

    // vì interceptor đã return response.data
    // nên response chính là data từ FastAPI

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.recommended)) {
      return response.recommended;
    }

    return [];
  } catch (error) {
    console.error("Error calling recommender API:", error);
    return [];
  }
};

export { recommenderApi };
