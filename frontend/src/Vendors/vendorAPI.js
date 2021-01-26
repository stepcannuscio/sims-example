import axios from "axios";

async function loadSales() {
    return await axios.get('http://localhost:5000/sales/',
        {withCredentials: true})
            .then(res => res.data)
            .catch(err => console.log(err))   
} 

async function saveSale(sale) {
    return await axios.post("http://localhost:5000/sales/", {
          sale: sale
      },
      {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function loadVendors() {
  return await axios.get("http://localhost:5000/vendors/",
    {withCredentials: true})
        .then(res => res.data)
        .catch(err => console.log(err))   
} 

async function loadVendor(id) {
    return await axios.get("http://localhost:5000/vendors/" + id,
      {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function loadVariants(id) {
    console.log(id)
    return await axios.get("http://localhost:5000/vendors/products/" + id,
      {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function saveOrder(order, orderItems, user) {
    return await axios.post("http://localhost:5000/orders/",
        {order: order, orderItems: orderItems, user: user},
        {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function saveVendor(vendor, commMethods) {
    return await axios.post("http://localhost:5000/vendors/",
        {vendor: vendor, commMethods: commMethods},
        {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function sendText(contactName, data, to) {
    return await axios.post("http://localhost:5000/orders/text",
        {contactName: contactName, data: data, to: to},
        {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function sendEmail(contactName, data, to) {
    return await axios.post("http://localhost:5000/orders/email",
        {contactName: contactName, data: data, to: to},
        {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

async function loadOrderProducts(productIds) {
    return await axios.post("http://localhost:5000/vendors/order/",
        {ids: productIds},
        {withCredentials: true})
          .then(res => res.data)
          .catch(err => console.log(err))   
} 

export {loadSales, saveSale, loadVendors, loadVendor, loadVariants, saveOrder, saveVendor, sendText, sendEmail, loadOrderProducts}
