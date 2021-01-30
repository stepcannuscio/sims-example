import axios from "axios";

async function loadOrders() {
    return await axios.get('http://localhost:5000/orders',
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}   

async function loadOrder(id) {
    return await axios.get('http://localhost:5000/orders/'+id,
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}  

async function loadProducts(id) {
    return await axios.get("http://localhost:5000/vendors/" + id,
      {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function loadVariants(id) {
    return await axios.get("http://localhost:5000/orders/products/" + id,
      {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function updateOrder(orderData, id, data, discountsToUpdate) {
    return await axios.post("http://localhost:5000/orders/update",
        {orderData: orderData, id: id, data: data, noDiscounts: discountsToUpdate},
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}  

async function updateOrderItem(data, id, itemsToDelete, itemsToAdd) {
    console.log('updateOrderItem')
    return await axios.post("http://localhost:5000/orders/update-item",
        {data: data, id: id, deletes: itemsToDelete, inserts: itemsToAdd},
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
}  


export {loadOrder, loadOrders, loadProducts, loadVariants, updateOrder, updateOrderItem}