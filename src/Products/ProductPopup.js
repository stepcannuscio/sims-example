import "../styles/Popup.css"
import {useState, useEffect} from "react"
import {useHistory} from "react-router-dom"
import * as router from "./productAPI"
import SalesChart from "../components/SalesChart"
import DateFilter from "../components/DateFilter"

export default function ProductPopup(props) {

    const [btnText, setBtnText] = useState("Edit")
    const [isEditing, setIsEditing] = useState(false)
    const [editColor, setEditColor] = useState("#76c32d")
    const [isPurchasesHidden, setPurchasesHidden] = useState(true)
    const [data, setData] = useState([])
    const [variant, setVariant] = useState("default")

    const [originalPurchases, setOriginalPurchases] = useState([])
    const [dateFilter, setDateFilter] = useState('month')
    const [startDate, setStartData] = useState("")
    const [endDate, setEndDate] = useState("")

    const [purchases, setPurchases] = useState([])
    const [originalData, setOriginalData] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [idsToUpdate, setIdsToUpdate] = useState([])
    const [dataToUpdate, setDataToUpdate] = useState([])

    const history = useHistory()

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      })

    const imageStyle = {
        width: "15%",
        margin: "20px 0",
        display: "inline-block",
        float: "left"
    }

    const titleStyle = {
        fontSize: "30px"
    }

    function getData(filter="month", start="", end="", variantId=null) {

        setLoading(true)
        router.loadProduct(props.values.id, filter, start, end, variantId).then(data => {
            if (data !== "Error") {
                if (data.productData) {
                    setData(data.productData)
                    const newData = data.productData.map(a => ({...a})) // make copy to compare dataToUpdate with to look for changes
                    setOriginalData(newData)
                    const newPurchases = data.purchaseData.map(a => ({...a}))
                    setOriginalPurchases(newPurchases)
                }
                setPurchases(data.purchaseData)                
            } else {
                alert("Error getting data. Please try again or contact Step.")
            }
            setLoading(false)    
        });
      }

    function editBtnClicked(e) {
        if (btnText === "Edit") {
            setBtnText("Save")
        } else {
            saveData()
        }
        setIsEditing(!isEditing)
        setEditColor(editColor === "#26B1FF" ? "#76c32d" : "#26B1FF")
    }

    function saveData() {

        const updatedData = []

        dataToUpdate.forEach(newItem => {
            originalData.forEach(ogItem => {
                if (ogItem.variant_id === newItem.variant_id) {
                    // Same item
                    if ((newItem.quantity !== ogItem.quantity && newItem.quantity) || 
                        (newItem.cost !== ogItem.cost && newItem.cost ))
                        {
                            // data has changed, so should save this item
                            newItem.quantity = newItem.quantity ? newItem.quantity : ogItem.quantity
                            newItem.cost = newItem.cost ? newItem.cost : ogItem.cost

                            updatedData.push(newItem)
                        }
                }
            })
        })

        if (updatedData.length > 0) {
            router.updateProduct(updatedData, props.values.id).then(data => {
                if (data === "Success") {
                    setBtnText("Edit")
                    getData()
                    setDataToUpdate([])
                    setIdsToUpdate([])
                } else {
                    alert("Failed to save product. Please try again.")
                    setBtnText("Edit")
                }
            })
        } else {
            setBtnText("Edit")
        }
    }

    function editInput(data, value, type) {
        data[type] = value // update the value to be what was entered in the inputs
        if (idsToUpdate.includes(data.variant_id)) {
            // Item is in array so let's update it
            dataToUpdate.forEach((item, index) => {
                if (item.variant_id === data.variant_id) {
                    var array = [...dataToUpdate]; // make a separate copy of the array
                    if (index !== -1) {
                        array.splice(index, 1);
                        setDataToUpdate(array);
                    } 
                        setDataToUpdate(oldArray => [...oldArray, data])   
                }  
            })
        } else {
            setIdsToUpdate(oldArray => [...oldArray, data.variant_id])
            setDataToUpdate(oldArray => [...oldArray, data])
        }             
    }


    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        return <div className="loader"></div>;
    }
    
    return (
        <div>
            <div className="top-content">
                <span className="close" onClick={() => props.toggle()}>&times;    </span>
                {data[0]  ? <img style={imageStyle} src={data[0].image} alt="product"/> : <p></p>}
                
                <h2 style={titleStyle}>{data[0] ? data[0].title : "Default"}</h2>
                
                <p>Shopify ID: {data[0] ? data[0].shopify_id : "Default"}</p>
                <button onClick={editBtnClicked} className="edit-btn" style={{backgroundColor: editColor}}>{btnText}</button>
                <button onClick={() => history.push("/vendors", {vendor: props.values.vendor})}className="edit-btn" style={{color: "#76c32d"}}>Order</button>
            </div>

        <div hidden={originalPurchases.length <= 0} style={{textAlign: "center", margin: "20px 0"}}>
          <button className="btn" onClick={() => setPurchasesHidden(!isPurchasesHidden)}>{isPurchasesHidden ? "Show" : "Hide"} Product Purchases</button>
        </div>   
            
            {originalPurchases.length > 0 && !isPurchasesHidden
            ? 
            <div>
                <DateFilter dateFilter={dateFilter} startDate={startDate} endDate={endDate} variant={variant} variantData={data} reload={(filter, start, end, id) => {
                    setDateFilter(filter)
                    setStartData(start)
                    setEndDate(end)
                    setVariant(id)
                    getData(filter, start, end, id)
                }}/>
                <SalesChart data={purchases}/>
            </div>
            :
            originalPurchases.length > 0 && isPurchasesHidden
            ?
            <p></p>
            :
            <p style={{textAlign: "center"}}>No Purchases Yet!</p>
            }     

            <table style={{textAlign: "center"}}>
                <thead >
                    <tr>
                        <th className="table-header">Variant</th>
                        <th className="table-header">Shopify ID</th>            
                        <th className="table-header">Purchases/day</th>
                        <th className="table-header">Quantity</th>
                        <th className="table-header">Cost/unit</th>
                        <th className="table-header">Stock Level</th>
                        <th className="table-header">Recent Order</th>
                    </tr>
                </thead>
                <tbody>
                {data.map((item, index) => {   
                    const bgColor = item.stockLevel === "Low" ? "red" : item.stockLevel === "Medium" ? "#FFD300" : "#4CAF50"
                    return (  
                        isEditing 
                            ? 
                        <tr key={index}>
                            <td className="table-cell">{item.variant}</td>
                            <td className="table-cell">{item.variant_shopify_id}</td>
                            <td className="table-cell">{item.salesPerDay}</td>
                            <td className="table-cell">
                                <input className="table-cell" type="text" onChange={(e) => editInput(item, e.target.value, "quantity")} placeholder={item.quantity} />
                            </td>
                            <td className="table-cell">
                                <input className="table-cell" type="text" onChange={(e) => editInput(item, e.target.value, "cost")} placeholder={formatter.format(item.cost)} />
                            </td>
                            <td className="table-cell stock-level" style={{backgroundColor: bgColor}}>{item.stockLevel}</td>                        
                            <td className="table-cell">{item.recentOrder}</td>
                        </tr>
                        :
                        <tr key={index}>
                          <td className="table-cell">{item.variant}</td>
                            <td className="table-cell">{item.variant_shopify_id}</td>
                            <td className="table-cell">{item.salesPerDay}</td>
                            <td className="table-cell">
                                {item.quantity}
                            </td>
                            <td className="table-cell">
                                {formatter.format(item.cost)}
                            </td>
                            <td className="table-cell stock-level" style={{backgroundColor: bgColor}}>{item.stockLevel}</td>                        
                            <td className="table-cell">{item.recentOrder}</td>
                        </tr>
                    ) 
                })}   
                </tbody>
            </table>            
        </div>
    )
}

