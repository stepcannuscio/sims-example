import axios from "axios";

async function loadLowProducts() {
    return await axios.get('http://localhost:5000/products/low',
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}

async function loadProducts() {
    return await axios.get('http://localhost:5000/products/',
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
} 

async function loadProduct(id, filter, start, end, variantId) {
    const endURI = variantId ? "/" + variantId : "/none"
    return await axios.get('http://localhost:5000/products/'+id+"/"+
    filter + (start !== "" ? "/" + start : "/none") + (end !== "" ? "/" + end : "/none")+endURI ,
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
} 

async function updateProduct(updates, id) {
    return await axios.post('http://localhost:5000/products/'+id+'/update',
        {data: updates},
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
} 

export {loadLowProducts, loadProducts, loadProduct, updateProduct}

