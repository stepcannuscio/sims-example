import {useState, useEffect, useMemo, useRef} from "react"
import "../styles/Popup.css"
import Table from "../components/Table"
import ProgressBar from "./ProgressBar"
import * as router from "./vendorAPI"
import * as helpers from "../helpers"

export default function VendorPopup(props) {

    const [percentage, setPercentage] = useState(0)
    const [btnText, setBtnText] = useState("Order")
    const [isLoading, setLoading] = useState(true)
    const [editColor, setEditColor] = useState("#76c32d")

    const [dataToUpdate, setDataToUpdate] = useState([])
    const [variantsToUpdate, setVariantsToUpdate] = useState([])
    const [data, setData] = useState([])
    const [commMethods, setCommMethods] = useState([])
    const [commMethod, setCommMethod] = useState(null)
    const [variantData, setVariantData] = useState([])
    const [isOrdering, setOrdering] = useState(false)
    const [orderState, setOrderState] = useState(null)

    const [isAddItemHidden, setAddItemHidden] = useState(true)

    const addProductName = useRef()
    const addVariantName = useRef()
    const addQuantity = useRef()
    const addCost = useRef()

    const orderSteps = 4

    const columns = useMemo(
        () => [
        {
            Header: 'ID',
            accessor: 'id', // Product ID
            sortDescFirst: true
            },
          {
            Header: 'Product',
            accessor: 'title',
            sortDescFirst: true
          },
          {
            Header: 'Variant',
            accessor: 'variant',
            sortDescFirst: true,
            show: true
          },
          {
            Header: 'Quantity',
            accessor: 'quantity',
            sortDescFirst: true,
          },
          {
            Header: 'Purchases/day',
            accessor: 'salesPerDay',
            sortDescFirst: true,
          },
          {
            Header: 'Stock Level',
            accessor: 'stockLevel',
            disableSortBy: true
          },
          {
            Header: 'Recent Order',
            accessor: 'recentOrder',
            disableSortBy: true
          },
        ],
        []
    )

    function getData() {
        setLoading(true)
        router.loadVendor(props.values.id).then(data => {
            if (data) {
                setData(data.products) // sets the product data for the table
                setCommMethods(data.commMethods)
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function chooseProducts() {
        // Start Order - change to page where we choose which products to order
        setOrdering(true)
        setBtnText("Next")
        setOrderState("Choose Products")
        setPercentage(100/orderSteps)
        setVariantData([])
        setDataToUpdate([])
        setVariantsToUpdate([])
    }

    function chooseVariants() {
        // Going to next page of ordering after chose products to choose variants and quantities

        if (variantsToUpdate.length > 0) {
            // Only load variant data if a product was selected
            setLoading(true)
            setPercentage(100/orderSteps * 2) // update progress bar
            setOrderState("Choose Variants/Qty")

            router.loadOrderProducts(variantsToUpdate).then(data => {
                if (data !== "Error") {
                    setLoading(false)
                    setVariantData(data)
                    setBtnText("Review")
                    setDataToUpdate([])
                    setVariantsToUpdate([])
                } else {
                    alert("Error getting order products. Please try again or contact Step.")
                }
            })
        } else {
            alert("No products selected")
        }
       
    }

    function chooseCommunication() {
        // Going to next page to review order and submit or use communication method
        setPercentage(100/orderSteps * 3) // update progress bar
        setOrderState("Choose Communication")
    }

    function reviewOrder(value) {
        setOrderState("Review Order")
        setBtnText("Submit")
        setEditColor("#26B1FF")
        setPercentage(100/orderSteps * 4) // update progress bar

        if (value === "Website") {
            window.open(`https://${props.values.website}`,'_blank') // NEED TO CHANGE
        }
    }

    function submitOrder() {
        // Send message and save order
             
        const order = {
            vendor: props.data.row.values.id,
            subtotal: 0,
            status: "submitted"
        }

        const orderItems = []
        dataToUpdate.forEach(item => {
            if (item.quantity !== 0 || item.quantity !== "") {
                order.subtotal += item.subtotal
                orderItems.push({
                    variant: item.variantId,
                    subtotal: item.subtotal, // this is the subtotal including multiple qtys
                    quantity: item.quantity
                })
            }
        
        })
     
        if (dataToUpdate.length > 0) {
            if (commMethod === "Text") {
                router.sendText(props.values.contact_name, dataToUpdate, "4848885912").then(data => { // NEED TO CHANGE
                    if (data === "Success") {
                        save(order, orderItems)
                    } else {
                        alert("Failed to send text. Please try again.")
                    }     
                })
            }
            else if (commMethod === "Email") {
                router.sendEmail(props.values.contact_name, dataToUpdate, "stepan.cannuscio@gmail.com").then(data => { // NEED TO CHANGE
                    if (data === "Success") {
                        save(order, orderItems)
                    } else {
                        alert("Failed to send email. Please try again.")
                    }     
                })
            } else if (["Website", "Call", "Manual Order"].includes(commMethod)) {
                save(order, orderItems)
            } else {
                alert("No communication method selected! Contact Step for help")
            }
        }
    }

    function resetOrder() {
        setOrderState(null)
        setOrdering(false)
        setDataToUpdate([]) // empty dataToUpdate from any previous orders
        setVariantsToUpdate([]) // empty variantsToUpdate from any previous orders
        setPercentage(0)
        setEditColor("#76c32d")
        setBtnText("Order")
    }


    function orderBtnClicked(e) {
        if (!isOrdering) {
            chooseProducts()
        } else if (orderState === "Choose Products") {
            chooseVariants()
        } else if (orderState === "Choose Variants/Qty") {
            if (dataToUpdate.length > 0) {
                chooseCommunication() 
            } else {
                alert("Please add a variant to this order.")
            }
        } else if (orderState === "Choose Communication") {
            setCommMethod(e.target.value)
            reviewOrder(e.target.value)
        }  else if (orderState === "Review Order") {
            submitOrder()
        } 
    }
    
    function backBtnClicked() {
        if (orderState === "Choose Products") {
            resetOrder()
        } else if (orderState === "Choose Variants/Qty") {
            chooseProducts()
        } else if (orderState === "Choose Communication") {
            setPercentage(100/orderSteps * 2) // update progress bar
            setOrderState("Choose Variants/Qty")
            setBtnText("Review")
        } else if (orderState === "Review Order") {
            chooseCommunication()
        } 
    }

    function save(order, orderItems) {
        router.saveOrder(order, orderItems, props.user.id).then(data => {
            if (data === "Success") {
                resetOrder()
                props.toggle()
            } else {
                alert("Failed to save data. Please try again.")
            }
        })
    }

    function rowSelected(rowData, isAllSelected) {
        if (rowData === "all") {
            setDataToUpdate([]) // clear before adding all rows to the array to update
            setVariantsToUpdate([])
            if (!isAllSelected) { // this means all are selected (it's opposite)
                data.forEach(item => {
                    setDataToUpdate(oldArray => [...oldArray, item])
                    setVariantsToUpdate(oldArray => [...oldArray, item.id])
                })
            } 
        } else {
            if (!rowData.isSelected) { // this means the row is selected (it's opposite)
                setDataToUpdate(oldArray => [...oldArray, rowData.values])
                setVariantsToUpdate(oldArray => [...oldArray, rowData.values.id])
            } else {
                // remove from arrays if you unselect it
                var array2 = [...variantsToUpdate]; // make a separate copy of the array
                var index2 = array2.indexOf(rowData.values.id)
                if (index2 !== -1) {
                    array2.splice(index2, 1);
                    setVariantsToUpdate(array2);
                }         
            } 
        }
       
    }

    function remove(data, element) {
        variantData.forEach((item, index) => {
            if (item.variant_id === element.variant_id) {
                var array = [...data]; // make a separate copy of the array
                if (index !== -1) {
                    array.splice(index, 1);
                    setVariantData(array);
                }             
            }
        })
        if (dataToUpdate.length > 0) {
            dataToUpdate.forEach((item, index) => {   
                if (item.variantId === element.variant_id) {
                    var array = [...dataToUpdate]; // make a separate copy of the array
                    if (index !== -1) {
                        array.splice(index, 1);
                        setDataToUpdate(array);
                    } 
                }
            })
        }
    }

    function addOrderItem(data, orderQuantity) {
        
        const newData = {
            productTitle: data.title,
            productId: data.id,
            variantTitle: data.variant,
            variantId: data.variant_id,
            cost: data.cost,
            quantity: orderQuantity,
            subtotal: Math.round(data.cost * orderQuantity * 100, 2) / 100
        }

        if (variantsToUpdate.includes(data.variant_id)) {
            // Item is in array so let's update it
            dataToUpdate.forEach((item, index) => {                
                if (item.variantId === data.variant_id) {
                    var array = [...dataToUpdate]; // make a separate copy of the array
                    if (index !== -1) {
                        array.splice(index, 1);
                        setDataToUpdate(array);
                    } 
                    if (newData.quantity !== "0" && newData.quantity !== 0 && newData.quantity !== "") {
                        setDataToUpdate(oldArray => [...oldArray, newData])   
                    } else {
                        var variantsArray = [...variantsToUpdate]; // make a separate copy of the array
                        if (index !== -1) {
                            variantsArray.splice(index, 1);
                            setVariantsToUpdate(variantsArray);
                        } 
                    }
                }
            })
        } else {
            if (newData.quantity !== "0" || newData.quantity !== "") {
                setVariantsToUpdate(oldArray => [...oldArray, data.variant_id])
                setDataToUpdate(oldArray => [...oldArray, newData])
            }
        }
    }


    function addItem() {
        if (addProductName.current.value === "" || addVariantName.current.value === "" ||
            addQuantity.current.value === "" || addCost.current.value === "") {
                alert("Please fill out all fields to manually add an item.")
        } else {
            const newData = {
                productTitle: addProductName.current.value,
                variantTitle: addVariantName.current.value,
                quantity: addQuantity.current.value,
                cost: addCost.current.value,
                subtotal: addQuantity.current.value * addCost.current.value
            }
            setDataToUpdate(oldArray => [...oldArray, newData])
        }
    }

    if (isLoading) {
        return <div className="loader"></div>;
    }

    return (
        <div>   
            <div className="top-content">
                <ProgressBar percentage={percentage}/>
                <span className="close" onClick={() =>  props.toggle()}>&times;    </span>
                <h2 >{data && data[0] ? helpers.capitalizeFirstLetter(data[0].name) : "No Products"}</h2>
                <div>
                    <p>Products: {props.values.products}</p>
                    <p>Low Products: {props.values.low_products}</p>
                    <p>Deals: {props.values.deals}</p>
                    <p>Order Minimum: {props.values.order_minimum}</p>
                    <p>Contact Name: {helpers.capitalizeFirstLetter(props.values.contact_name)}</p>
                    <p>Email: {props.values.email}</p>
                    <p>Phone: {props.values.phone}</p>
                </div>
                {isOrdering ? <button onClick={backBtnClicked} className="edit-btn" style={{backgroundColor: "grey"}}>Back</button> : null }
                <button hidden={orderState === "Choose Communication"} onClick={(e) => orderBtnClicked(e)} className="edit-btn" style={{backgroundColor: editColor}}>{btnText}</button>
                {
                commMethods 
                ? 
                commMethods.map((method, index) => {
                    return (
                        <button key={index} hidden={orderState !== "Choose Communication"} onClick={(e) => orderBtnClicked(e)} value={helpers.capitalizeFirstLetter(method.method)} className="edit-btn" style={{backgroundColor: "#76c32d"}}>{helpers.capitalizeFirstLetter(method.method)}</button>
                    )
                })
                :
                <button>Error</button>
                }
                <button hidden={orderState !== "Choose Communication"} onClick={(e) => orderBtnClicked(e)} className="edit-btn" value="Manual Order" style={{backgroundColor: "orange"}}>Manual Order</button>
            </div>
      
            {isOrdering 
            ?
            <div>
                <div>
                    {orderState === "Choose Variants/Qty" 
                    ?
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Variant</th>
                                <th>Current Quantity</th>
                                <th>Purchases/day</th>
                                <th>Stock Level</th>
                                <th>Cost/unit</th>
                                <th>Recent Order</th>
                                <th>Order Quantity</th>
                                
                                <th>Remove</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {variantData.map((variant, index) => {
                                const bgColor = variant.stockLevel === "Low" ? "red" : variant.stockLevel === "Medium" ? "#FFD300" : "#4CAF50"
                                return (
                                    <tr key={index}>
                                        <td className="table-cell">{variant.title}</td>
                                        <td className="table-cell">{variant.variant}</td>
                                        <td className="table-cell">{variant.quantity}</td>
                                        <td className="table-cell">{variant.salesPerDay}</td>
                                        <td className="table-cell stock-level" style={{backgroundColor: bgColor}}>{variant.stockLevel}</td>
                                        <td>{helpers.formatter.format(variant.cost)}</td>
                                        <td>{variant.recentOrder}</td>
                                        <td ><input type="text" placeholder="0" style={{fontSize: "16px"}}placeholder={variant.orderQuantity || 0} onChange={(e) => {
                                            variant.orderQuantity = e.target.value
                                            addOrderItem(variant, e.target.value) 
                                        }}/></td>
                                        <td><span className="close" style={{color: "red"}} onClick={() =>  remove(variantData, variant)}>&times;</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    :
                    ["Choose Communication", "Review Order", "Submit Order"].includes(orderState)
                    ?
                    <div>
                        <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Variant</th>
                                <th>Quantity</th>
                                <th>Cost/unit</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataToUpdate.map((order_item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{order_item.productTitle}</td>
                                        <td>{order_item.variantTitle}</td>
                                        <td>{order_item.quantity}</td>
                                        <td>{helpers.formatter.format(order_item.cost)}</td>
                                        <td>{helpers.formatter.format(order_item.subtotal)}</td>
                                    </tr>
                                )  
                            })}
                        </tbody>
                        </table>
                        <div hidden={isAddItemHidden}>
                            <input ref={addProductName} placeholder="Product Name"></input>
                            <input ref={addVariantName} placeholder="Variant Name"></input>
                            <input ref={addQuantity} placeholder="Quantity"></input>
                            <input ref={addCost} placeholder="Cost/unit"></input>
                            <button onClick={addItem}>Add Item</button>
                        </div>
                        <button onClick={() => setAddItemHidden(false)}>+</button>
                        
                    </div>
                    :
                <Table columns={columns} data={data} search={true} type="order" checkbox={true} popupEnabled={false} perPage={5} update={(data, isAllSelected) => rowSelected(data, isAllSelected)}/>
                }     
                </div>
            </div>
            :
            <Table columns={columns} data={data} type="order" search={true} popupEnabled={false} perPage={5}/>
}       
  </div>
    )
}