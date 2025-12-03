import instance from "./axios.cusomize";

const elasticSearchApi = (keyword) => {
    const URL = `/v1/api/search?keyword=${encodeURIComponent(keyword)}`;
    return instance.get(URL);
}

export { elasticSearchApi };