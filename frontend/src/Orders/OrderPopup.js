import {useState, useEffect, useRef} from "react"
import * as router from "./orderAPI"

export default function OrderPopup(props) {
    
    const [data, setData] = useState([])
    const [originalData, setOriginalData] = useState([])
    const [productData, setProductData] = useState([])
    const [variantData, setVariantData] = useState([])
    const [quantity, setQuantity] = useState(0)
    // const [variant, setVariant] = useState(null)
    // const [ogData, setOGData] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [orderBtnText, setOrderBtnText] = useState("Edit Order")
    const [orderItemBtnText, setOrderItemBtnText] = useState("Edit Order Item")
    const [isEditingOrder, setEditingOrder] = useState(false)
    const [isEditingOrderItem, setEditingOrderItem] = useState(false)
    const [editColor, setEditColor] = useState("#76c32d")
    // const [isTrackingHidden, setTrackingHidden] = useState(true)
    const [idsToUpdate, setIdsToUpdate] = useState([])
    const [dataToUpdate, setDataToUpdate] = useState([])
    const [itemsToDelete, setItemsToDelete] = useState([])
    const [itemsToAdd, setItemsToAdd] = useState([])
    const [idsToAdd, setIdsToAdd] = useState([])

    const [isProductSelectHidden, setProductSelectHidden] = useState(true)
    const [isVariantSelectHidden, setVariantSelectHidden] = useState(true)
    const [isQuantityHidden, setQuantityHidden] = useState(true)
    const [isAddBtnHidden, setAddBtnHidden] = useState(true)

    // const [status, setStatus] = useState("")
    // const [tracking, setTracking] = useState("")
    // const [orderDiscount, setOrderDiscount] = useState("")
    // const [orderTotal, setOrderTotal] = useState("")
    // const [orderSubtotal, setOrderSubtotal] = useState(0)

    const orderSubtotal = useRef()
    const orderDiscount = useRef()
    // const orderTotal = useRef()
    const tracking = useRef()
    const status = useRef()
    const product = useRef()
    const variant = useRef()

    // console.log(productData)
    // console.log(variant.current.value)

    // console.log(isTrackingHidden)
    // console.log(status)
    

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
        })

    const inputStyle = {
        margin: "20px auto",
        padding: "10px 20px",
        fontSize: "16px",
        border: "none",
        borderBottom: "1px solid #76c32d"
    }



    function getData() {
        setLoading(true)
        router.loadOrder(props.values.id).then(data => {
            if (data) {
                // console.log(data)
                setData(data)
                // const newData = data.slice()
                const newData = data.map(a => ({...a})) // make copy to compare dataToUpdate with to look for changes
                // console.log(newData)
                setOriginalData(newData)
    

                setLoading(false)      
            }
        })
    }

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        return <div className="loader"></div>;
    }

    function editBtnClicked(e) {
        
       
        if (e.target.id === "order-btn") {
            if (!isEditingOrder) {
                setOrderBtnText("Save Order")
                setEditingOrder(true)
            } else {
                saveOrder()
            }
        } else if (e.target.id === "order-item-btn") {
            if (!isEditingOrderItem) {
                setOrderItemBtnText("Save Order Item")
                setEditingOrderItem(true)
            } else {
                saveOrderItem()
            }
        }
        setEditColor(editColor === "#26B1FF" ? "#76c32d" : "#26B1FF")
        
        
    }

    function saveOrder() {
        const orderData = {
            subtotal: orderSubtotal.current.value ? orderSubtotal.current.value : data[0].order_subtotal,
            discount: orderDiscount.current.value ? orderDiscount.current.value : data[0].order_discount,
            // total: orderTotal.current.value ? orderTotal.current.value : data[0].order_total,
            status: status.current.value ? status.current.value : data[0].status,
            tracking: tracking.current.value ? tracking.current.value : data[0].tracking,
        }

        const discountsToUpdate = []

        data.forEach(item => {
            if (item.discount === "0" || item.discount === 0 || item.discount === "") {
                discountsToUpdate.push(item)
            }
        })

        // const isItemDiscount = data ? true : false

        router.updateOrder(orderData, props.values.id, data, discountsToUpdate).then(data => {
            if (data === "Success") {
                setEditingOrder(false)
                setOrderBtnText("Edit Order")
                getData()

                // reload order item data if the status is completed b/c then would have updated the discount and cost of the items

                // setTrackingHidden(true)
            } else {
                alert("Failed to save order. Please try again.")
                setOrderBtnText("Edit Order")
            }
        })      
    }

    function saveOrderItem() {
        // console.log('Saving order item')

        // make sure to only pass in data with changes

        const updatedData = []

        // console.log(data)
        // console.log(originalData)
        // console.log(dataToUpdate)

        dataToUpdate.forEach(newItem => {
            originalData.forEach(ogItem => {
                if (ogItem.order_item_id === newItem.order_item_id) {

                    // console.log(ogItem)
                    // console.log(newItem)
                    // Same item
                    if ((newItem.quantity !== ogItem.quantity && newItem.quantity)|| 
                        (newItem.cost !== ogItem.cost && newItem.cost) || 
                        // (newItem.subtotal !== ogItem.subtotal) && newItem.subtotal || 
                        (newItem.discount !== ogItem.discount && newItem.discount))
                        // (newItem.total !== ogItem.total) && newItem.total ) 
                        {
                            // data has changed, so should save this item
                            newItem.quantity = newItem.quantity ? newItem.quantity : ogItem.quantity
                            newItem.cost = newItem.cost ? newItem.cost : ogItem.cost
                            // newItem.subtotal = newItem.subtotal ? newItem.subtotal : ogItem.subtotal
                            newItem.discount = newItem.discount ? newItem.discount : ogItem.discount
                            // newItem.total = newItem.total ? newItem.total : ogItem.total

                            updatedData.push(newItem)
                        }
                }
            })
        })

        // const itemsToDelete = []

        // console.log(data)

        // originalData.forEach(item => {
        //     console.log(item)
        //     if (!data.includes(item)) {
        //         itemsToDelete.push(item)
        //     }
        // })

        // console.log(itemsToDelete)

        // const found = originalData.some(item=> data.includes(item))


        

        // console.log(updatedData)
        router.updateOrderItem(updatedData, props.values.id, itemsToDelete, itemsToAdd).then(data => {
            if (data === "Success") {
                setEditingOrderItem(false)
                setOrderItemBtnText("Edit Order Items")
                getData()
                setDataToUpdate([])
                setIdsToUpdate([])
                setItemsToAdd([])
                setItemsToDelete([])
            } else {
                alert("Failed to save order items. Please try again.")
                setOrderItemBtnText("Edit Order Items")
            }
        })
    }
        
        
        

    // function statusChanged(e) {

    //     console.log(e.target.value)

    //     setStatus(e.target.value)

    //     if (e.target.value === "fulfilled") {
    //         setTrackingHidden(false)
    //     } else {
    //         setTrackingHidden(true)
    //     }
    // }

    // function selectChanged(e) {
    //     console.log(e.target.id)
    // }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

//     function editInput(e) {
//         // e.preventDefault()
//         // console.log(orderSubtotal)
//         // console.log(e.target.value)
//         // console.log(e.target.id)
//         switch(e.target.id) {
//             case "order-subtotal":
//                 // setOrderSubtotal(e.target.value)
//                 console.log(e.target.value)
//                 console.log(orderSubtotal.current.value)
//                 break;
//             case "order-total":
//                 setOrderTotal(e.target.value)
//                 // break;
//             case "order-discount":
//                 setOrderDiscount(e.target.value)
//                 break
//             case "tracking":
//                 setTracking(e.target.value)
//                 break
//             case "status":
//                 setStatus(e.target.value)
//                 break
//             default:
//               break
//     }
// }

    function editInput(data, value, type) {
        data[type] = value // update the value to be what was entered in the inputs
        // console.log(data)

        if (value !== "0" && value !== 0 && value !== "") {
            

            if (idsToUpdate.includes(data.order_item_id)) {
                // Item is in array so let's update it
                dataToUpdate.forEach((item, index) => {
                    
                    if (item.order_item_id === data.order_item_id) {
                        var array = [...dataToUpdate]; // make a separate copy of the array
                        if (index !== -1) {
                            array.splice(index, 1);
                            setDataToUpdate(array);
                        } 
       
                            setDataToUpdate(oldArray => [...oldArray, data])   
                       
                  
               
                        // console.log(newData.quantity)
                        // if (newData.quantity !== "0" && newData.quantity !== 0 && newData.quantity !== "") {
                        //     console.log('are we calling here')
                    }  
                   
                    
                })
            } else if (idsToAdd.includes(data.variant_id)) {
                // console.log('dis where we at dawg')

                itemsToAdd.forEach((item, index) => {
                    if (item.variant_id === data.variant_id) {
                        var array = [...itemsToAdd]; // make a separate copy of the array
                        if (index !== -1) {
                            array.splice(index, 1);
                            setItemsToAdd(array);
                        } 
                        setItemsToAdd(oldArray => [...oldArray, data])   
                    }  
                   
                })


            } else {

                    setIdsToUpdate(oldArray => [...oldArray, data.order_item_id])
                    setDataToUpdate(oldArray => [...oldArray, data])
 
            }
    
        } 

        // console.log(data)

      


        // var newData = item
        // newData[type] = value
        // console.log(newData)
        // const newData = {
        //     item_id: id,
        //     quantity: 
        //     variantTitle: data.variant,
        //     variantId: data.variant_id,
        //     cost: data.cost,
        //     quantity: orderQuantity,
        //     subtotal: Math.round(data.cost * orderQuantity * 100, 2) / 100
        // }

        // if (variantsToUpdate.includes(data.variant_id)) {
        //     // Item is in array so let's update it
        //     dataToUpdate.forEach((item, index) => {
                
    }

    function remove(itemToRemove) {

        // console.log(itemToRemove)

        data.forEach((item, index) => {
            if (item.order_item_id === itemToRemove.order_item_id) {
                var array = [...data]; // make a separate copy of the array
                setItemsToDelete(oldArray => [...oldArray, item.order_item_id])   
                if (index !== -1) {
                    array.splice(index, 1);
                    // console.log(data)
                    setData(array);
                }             
            }
        })

        // if (dataToUpdate.length > 0) {
        //     dataToUpdate.forEach((item, index) => {   
        //         if (item.order_item_id === itemToRemove.order_item_id) {
        //             var array = [...dataToUpdate]; // make a separate copy of the array
        //             if (index !== -1) {
        //                 array.splice(index, 1);
        //                 setDataToUpdate(array);
        //             } 
        //         }
        //     })
        // }
    }

    function addItem() {

        // event.nativeEvent.target[index].text

        const variantIndex = variant.current.selectedIndex
        const productIndex = product.current.selectedIndex
        // console.log(variant.current[variantIndex].text)
        // console.log(product.current.value)

      

        const newData = {
            product: product.current[productIndex].text,
            variant: variant.current[variantIndex].text,
            variant_id: variant.current.value.split('-')[0],
            cost: variant.current.value.split('-')[1],
            quantity: quantity,
            discount: 0
        }

        setData(oldArray => [...oldArray, newData])  
        setItemsToAdd(oldArray => [...oldArray, newData]) 
        setIdsToAdd(oldArray => [...oldArray, newData.variant_id])

        setProductSelectHidden(true)
        setVariantSelectHidden(true)
        setQuantityHidden(true)
        setAddBtnHidden(true)

        setProductData([])
        setVariantData([])
        setQuantity(0)




    }

    // function remove(data, element) {
    //     variantData.forEach((item, index) => {
    //         if (item.variant_id === element.variant_id) {
    //             var array = [...data]; // make a separate copy of the array
    //             if (index !== -1) {
    //                 array.splice(index, 1);
    //                 setVariantData(array);
    //             }             
    //         }
    //     })

    //     if (dataToUpdate.length > 0) {
    //         dataToUpdate.forEach((item, index) => {   
    //             if (item.variantId === element.variant_id) {
    //                 var array = [...dataToUpdate]; // make a separate copy of the array
    //                 if (index !== -1) {
    //                     array.splice(index, 1);
    //                     setDataToUpdate(array);
    //                 } 
    //             }
    //         })
    //     }
    // }

    function startAddFlow() {
        

        router.loadProducts(data[0].vendor_id).then(data => {
            if (data) {
                
                setProductData(data.products)
                setProductSelectHidden(false)
                // setEditingOrderItem(false)
                // setOrderItemBtnText("Edit Order Items")
                // getData()
            } else {
                alert("Failed to load products. Please try again.")
             
            }
        })
        
    }

    function loadVariants(productId) {
        // console.log(productId)
        router.loadVariants(productId).then(data => {
            if (data) {
                
                setVariantData(data)
                setVariantSelectHidden(false)
                // setEditingOrderItem(false)
                // setOrderItemBtnText("Edit Order Items")
                // getData()
            } else {
                alert("Failed to load variants. Please try again.")
             
            }
        })
    }
    

    const EditItem = (props) => {
        return (
            <div style={{display: "inline-block"}}>
            <p style={{display: "inline-block", margin: "10px",fontSize: "1.1rem"}}>{`${props.title}: `}</p>
            <input className="table-cell" type="text" id={props.id} ref={props.refName} placeholder={props.placeholder}/>
        </div>
        )
      
    }

    return (
        <div>
            <div className="top-content">
                <span className="close" onClick={() =>  props.toggle()}>&times;    </span>
                <h2 style={{fontSize: "2rem"}}>Order #{data.length > 0 ? data[0].order_id : "Error loading data"}</h2>
                <p style={{fontSize: "1.4rem"}}>Vendor: {data.length > 0 ? data[0].name : ""}</p>
                <div>
                {isEditingOrder
                ? 
                <div>
                    <EditItem title="Subtotal" id="order-subtotal" placeholder={data.length > 0 ? formatter.format(data[0].order_subtotal) : ""} refName={orderSubtotal}/>
                    <EditItem title="Discount" id="order-discount" placeholder={data.length > 0 ? formatter.format(data[0].order_discount) : ""} refName={orderDiscount}/>
                    <p style={{display: "inline-block", margin: "10px", fontSize: "1.1rem"}}>Total: {data.length > 0 ? formatter.format(data[0].order_total) : ""}</p>
                    {/* <EditItem title="Total" id="order-total" placeholder={data.length > 0 ? formatter.format(data[0].order_total) : ""} refName={orderTotal}/>  */}
                </div>
                :
                <div>
                    <p style={{display: "inline-block", margin: "10px",fontSize: "1.1rem"}}>Subtotal: {data.length > 0 ? formatter.format(data[0].order_subtotal) : ""}</p>
                    <p style={{display: "inline-block", margin: "10px", fontSize: "1.1rem"}}>Discount: {data.length > 0 ? formatter.format(data[0].order_discount) : ""}</p>
                    <p style={{display: "inline-block", margin: "10px", fontSize: "1.1rem"}}>Total: {data.length > 0 ? formatter.format(data[0].order_total) : ""}</p>
                </div>
                }
                   

                </div>

                {isEditingOrder 
                ?
                <div style={{textAlign: "center"}}>
                    <select style={inputStyle} defaultValue={data.length > 0 ? data[0].status : "submitted"} ref={status}>
                        <option value="submitted">Submitted</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="completed">Completed</option>
                    </select>
                    <br />
                    {/* <input hidden={isTrackingHidden} style={inputStyle} placeholder="Tracking" onChange={(e) => setTracking(e.target.value)}></input><br/>
                    <input hidden={isTrackingHidden} style={inputStyle} placeholder="Discount (i.e. 180.02)" onChange={(e) => setDiscount(e.target.value)}></input> */}
                    <EditItem title="Tracking" id="tracking" placeholder={data.length > 0  && data[0].tracking ? data[0].tracking : "Enter tracking..."} refName={tracking}/>
                    
                </div>
                :
                <div>
                    <p style={{fontSize: "1.1rem", color: data.length > 0 && data[0].status === "submitted" ? "red" : data.length > 0 && data[0].status==="fulfilled" ? "orange" : "green"}}>Status: {data.length > 0 ? capitalizeFirstLetter(data[0].status) : ""}</p>
                    <p style={{margin: "10px",fontSize: "1.1rem"}}>Tracking: {data.length > 0 && data[0].tracking ? data[0].tracking : ""}</p>
                </div>
                }

               
                <div>
                    <p style={{display: "inline-block", margin: "10px", fontSize: "1.1rem"}}>Submitted: {data.length > 0 ? data[0].submitted_date : ""}</p>
                    <p style={{display: "inline-block", margin: "10px", fontSize: "1.1rem"}}>Fulfilled: {data.length > 0 ? data[0].fulfilled_date : ""}</p>
                    <p style={{display: "inline-block", margin: "10px", fontSize: "1.1rem"}}>Completed: {data.length > 0 ? data[0].completed_date : ""}</p>
                </div>
                
                
                {/* <button hidden={isTrackingHidden ? data[0] && data[0].status === "completed" : false} onClick={editBtnClicked} className="edit-btn" style={{backgroundColor: editColor}}>{btnText}</button>
                 */}
                 <button hidden={isEditingOrderItem || (data.length > 0 && data[0].status === "completed")} onClick={editBtnClicked} className="edit-btn" id="order-btn"style={{backgroundColor: editColor}}>{orderBtnText}</button>
                 <button hidden={isEditingOrder || (data.length > 0 && data[0].status === "completed")} onClick={editBtnClicked} className="edit-btn" id='order-item-btn' style={{backgroundColor: editColor}}>{orderItemBtnText}</button>
            </div>

            <table style={{textAlign: "center"}}>
                <thead >
                    <tr>
                        <th className="table-header">Product</th>
                        <th className="table-header">Variant</th>
                        <th className="table-header">Cost/unit</th>
                        <th className="table-header">Quantity</th>
                        <th className="table-header">Subtotal</th>
                        <th className="table-header">Discount</th>
                        <th className="table-header">Total</th>
                        <th className="table-header">Remove</th>
                    </tr>
                </thead>
                <tbody>
                {data.map((item, index) => {
                    return (
                         isEditingOrderItem
                            ? 
                            <tr key={index}>
                                <td className="table-cell">{item.product}</td>
                                <td className="table-cell">{item.variant}</td>
                                {/* <td className="table-cell">{formatter.format(item.subtotal / item.quantity)}</td> */}

                                <td className="table-cell">
                                    <input className="table-cell" type="text" onChange={(e) => editInput(item, e.target.value, "cost")} placeholder={formatter.format(item.cost)} />
                                </td>
     
                                <td className="table-cell">
                                    <input className="table-cell" type="text" onChange={(e) => editInput(item, e.target.value, "quantity")} placeholder={item.quantity} />
                                </td>
                                
                               
                                <td className="table-cell">{formatter.format(item.cost * item.quantity)}</td>
                                <td className="table-cell">
                                    <input className="table-cell" type="text" onChange={(e) => editInput(item, e.target.value, "discount")} placeholder={formatter.format(item.discount)} />
                                </td>
                                <td className="table-cell">{formatter.format((item.cost * item.quantity) - item.discount)}</td>  
                                <td><span className="close" style={{color: "red"}} onClick={() =>  remove(item)}>&times;</span></td>
                            </tr>
          
                            :
                            <tr key={index}>
                                <td className="table-cell">{item.product}</td>
                                <td className="table-cell">{item.variant}</td>
                                {/* <td className="table-cell">{formatter.format(item.subtotal / item.quantity)}</td> */}
                                <td className="table-cell">{formatter.format(item.cost)}</td>
                                <td className="table-cell">{item.quantity}</td>
                                
                                <td className="table-cell">{formatter.format(item.cost * item.quantity)}</td> 
                                <td className="table-cell">{formatter.format(item.discount)}</td>
                                <td className="table-cell">{formatter.format((item.cost * item.quantity) - item.discount)}</td>    
                            </tr>
                            
                    )
                    })
                }
                </tbody>
            </table>
            {isEditingOrderItem
            ?
            <div>
    
            <button onClick={startAddFlow}>+</button>
            <select ref={product} hidden={isProductSelectHidden} defaultValue="default" onChange={(e) => {
                loadVariants(e.target.value)
            }}>
            <option value="default">Choose Product:</option>
                {productData.map(product => {
                    return (
                        <option value={product.id}>{product.title}</option>         
                    )
                    
                })}
            </select>

            <select ref={variant} hidden={isVariantSelectHidden} defaultValue="default" onChange={(e) => {
                setQuantityHidden(false)
                // setVariant(e.target.value)
            }}>
            <option value="default">Choose Variant:</option>
                {variantData.map(variant => {
                    
                    return (
                        <option value={`${variant.id}-${variant.cost}`}>{variant.title}</option>         
                    )
                    
                })}
            </select>
            <input hidden={isQuantityHidden} defaultValue="0" onChange={(e) => {
                setQuantity(e.target.value)
                setAddBtnHidden(false)
            }}></input>
            <button hidden={isAddBtnHidden} onClick={addItem}>Add Item</button>
            </div>
            :
            <p></p>
                }

        </div>
    )
}