import axios from "axios";
import * as constants from "../constants"

async function loadLowProducts() {
    return await axios.get(constants.BASE_API_URL + '/api/products/low',
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}

async function loadProducts() {
    return await axios.get(constants.BASE_API_URL + '/api/products/',
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
} 

async function loadProduct(id, filter, start, end, variantId) {
    const endURI = variantId ? "/" + variantId : "/none"
    return await axios.get(constants.BASE_API_URL + '/api/products/'+id+"/"+
    filter + (start !== "" ? "/" + start : "/none") + (end !== "" ? "/" + end : "/none")+endURI ,
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
} 

async function updateProduct(updates, id) {
    return await axios.post(constants.BASE_API_URL + '/api/products/'+id+'/api/update',
        {data: updates},
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
} 

export {loadLowProducts, loadProducts, loadProduct, updateProduct}

