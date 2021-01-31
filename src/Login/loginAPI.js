import axios from "axios";
import * as constants from "../constants"

async function login(username, password) {
    return await axios.post(constants.BASE_API_URL + '/api/user/login', 
        {
            username: username,
            password: password
        },
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}   

async function checkUser() {
    return await axios.get(constants.BASE_API_URL + '/api/user', 
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}

async function logout() {
    return await axios.get(constants.BASE_API_URL + '/api/user/logout/', 
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}




export {login, checkUser, logout}