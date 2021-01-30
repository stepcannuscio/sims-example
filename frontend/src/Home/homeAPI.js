import axios from "axios";

async function loadPurchases(filter, start, end) {
    return await axios.get('http://localhost:5000/purchases/'+
        filter + (start !== "" ? "/" + start : "/none") + (end !== "" ? "/" + end : "/none"),
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))
}

export {loadPurchases}