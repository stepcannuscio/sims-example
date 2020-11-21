

import {useState, useEffect} from "react"
import axios from "axios"
import delta8Image from "../images/delta8-thc-products.jpg"
export default function Popup(props) {

    const [isEditing, setIsEditing] = useState(false)
    const [editColor, setEditColor] = useState("#76c32d")
    const [btnText, setBtnText] = useState("Edit")
    const [product, setProduct] = useState({})
    const [isLoading, setLoading] = useState(true)
    const [dataToUpdate, setDataToUpdate] = useState([])

    const productData = props.product.row.values

    function getProduct() {
        axios.get('http://localhost:5000/products/'+productData.id, {withCredentials: true}).then(res => {
            if (res.data) {
                setProduct(res.data)
                setLoading(false)      
            } else {
                console.log("Error getting product data")
            }
        });
      }
      useEffect(() => {
        getProduct()
      }, []);
      
    function handleClick() {
        props.toggle()
    }

    function editClicked(e) {
        if (btnText === "Edit") {
            setBtnText("Save")
        } else {
            // Save data
            const updateDict = {}
            dataToUpdate.forEach(item => {
                updateDict[item.id] = item.quantity
            })
         
            if (dataToUpdate.length > 0) {
                axios.post('http://localhost:5000/products/'+productData.id+'/update', {updateDict}, {withCredentials: true}).then(res => {
                if (res.data === "Product Updated") {
                    setBtnText("Edit")
                    getProduct()
                } else {
                    console.log('error saving')
                }
        })
            } else {
                console.log('no data to save')
            }
            
            
        }
        setIsEditing(!isEditing)
        setEditColor(editColor === "#26B1FF" ? "#76c32d" : "#26B1FF")
    }

    const editBtnStyle = {
        color: "white",
        backgroundColor: editColor,
        padding: "7px 30px",
        borderRadius: "5px",
        border: "none",
        fontSize: "16px",
    }

    const tableHeaderStyle = {
        paddingBottom: "10px"
    }

    const tableCellStyle = {
        paddingRight: "20px", 
        border: "none"
    }

    function editInput(e) {
        if (e.target.value !== e.target.placeholder) {
            // Quantity value has changed for this variant
            const newData = {
                "id": e.target.id,
                "quantity": e.target.value
            }
            setDataToUpdate(oldArray => [...oldArray, newData])
        }
    }

    if (isLoading) {
        return <div className="loader"></div>;
    }
    
 
    return (
        <div className="modal">
            <div className="modal_content">
                <span className="close" onClick={handleClick}>&times;    </span>
                <p></p>
                {product.image ? <img style={{width: "10%"}} src={product.image} alt="product image"/> : <p></p>}
                <h2>{product.title}</h2>
            
                <button onClick={editClicked} style={editBtnStyle}>{btnText}</button>
                <table style={{textAlign: "center"}}>
                    <thead >
                        <tr>
                            <th style={tableHeaderStyle}>Variant</th>
                            <th style={tableHeaderStyle}>Price</th>
                            <th style={tableHeaderStyle}>Quantity</th>
                            <th style={tableHeaderStyle}> </th>
                        </tr>
                    </thead>

                    <tbody>
                    {product.variants.map((variant, index) => {
                            return (
                                <tr key={index}>
                                    <td style={tableCellStyle}>{variant.title}</td>
                                    <td style={tableCellStyle}>{variant.price}</td>
                                    {isEditing 
                                        ? 
                                        <td style={tableCellStyle}>
                                            <input onChange={editInput} id={variant.id} placeholder={variant.quantity}></input>
                                        </td>
                                        :
                                        <td style={tableCellStyle}>{variant.quantity}
                                        </td>
                                        }
                                </tr>
                            ) 
                        })
                    }   
                    </tbody>
                </table>
            </div>
      </div>
    )
}