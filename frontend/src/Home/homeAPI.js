import axios from "axios";

async function loadPurchases(filter, start, end) {
    return await axios.get('http://localhost:5000/purchases/'+
        filter + (start !== "" ? "/" + start : "/none") + (end !== "" ? "/" + end : "/none"),
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))
}

async function loadLowProducts() {
    return await axios.get('http://localhost:5000/products/low', 
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))      
}

async function loadTopSellingProducts(start, end) {
    return await axios.get('http://localhost:5000/products/top-selling' +
        (start !== "" ? "/" + start : "/none") + (end !== "" ? "/" + end : "/none"), 
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))      
}


export {loadPurchases, loadLowProducts, loadTopSellingProducts}