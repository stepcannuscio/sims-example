import axios from "axios";

async function login(username, password) {
    return await axios.post('http://localhost:5000/user/login', 
        {
            username: username,
            password: password
        },
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}   

export {login}