import axios from "axios";
import * as constants from "../constants"

async function loadOrders() {
    return await axios.get(constants.BASE_API_URL + '/api/orders',
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}   

async function loadOrder(id) {
    return await axios.get(constants.BASE_API_URL + '/api/orders/'+id,
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}  

async function loadProducts(id) {
    return await axios.get(constants.BASE_API_URL + "/api/vendors/" + id,
      {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function loadVariants(id) {
    return await axios.get(constants.BASE_API_URL + "/api/orders/products/" + id,
      {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function updateOrder(orderData, id, data, discountsToUpdate) {
    return await axios.post(constants.BASE_API_URL + "/api/orders/update",
        {orderData: orderData, id: id, data: data, noDiscounts: discountsToUpdate},
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}  

async function updateOrderItem(data, id, itemsToDelete, itemsToAdd) {
    return await axios.post(constants.BASE_API_URL + "/api/orders/update-item",
        {data: data, id: id, deletes: itemsToDelete, inserts: itemsToAdd},
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}  


export {loadOrder, loadOrders, loadProducts, loadVariants, updateOrder, updateOrderItem}