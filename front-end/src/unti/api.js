import instance from "./axios.cusomize";

const createUserApi = (name,email, phone, address, password,role) => {
    const URL = "/v1/api/register";
    const data = {name,email, phone, address, password,role} ;

    return instance.post(URL,data);
}

const LoginApi = (email, password) => {
    const URL = "/v1/api/login";
    const data = {email, password} ;

    return instance.post(URL,data);
}

const getUserApi = () => {
    const URL = "/v1/api/users";
    return instance.get(URL); 
}
const getSellerApi = () => {
    const URL = "/v1/api/sellers";
    return instance.get(URL); 
}

const getcheckStoreApi = (userId) => {
    const URL = `/v1/api/seller/store/${userId}`;
    return instance.get(URL); 
}

export {createUserApi,LoginApi,getUserApi,getSellerApi,getcheckStoreApi}