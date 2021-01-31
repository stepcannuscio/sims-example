import axios from "axios";
import * as constants from "../constants"

async function loadPurchases(filter, start, end) {
    return await axios.get(constants.BASE_API_URL + '/api/purchases/'+
        filter + (start !== "" ? "/" + start : "/none") + (end !== "" ? "/" + end : "/none"),
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))
}

export {loadPurchases}