import instance from "./axios.cusomize";

const createUserApi = (name, age, city , gmail, password) => {
    const URL = "/v1/api/register";
    const data = {name, age, city , gmail, password} ;

    return instance.post(URL,data);
}

const LoginApi = (name, password) => {
    const URL = "/v1/api/login";
    const data = {name, password} ;

    return instance.post(URL,data);
}

const getUserApi = () => {
    const URL = "/v1/api/user";
    return instance.get(URL); 
}

export {createUserApi,LoginApi,getUserApi}