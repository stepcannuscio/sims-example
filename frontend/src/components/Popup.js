
import ProductPopup from "../Products/ProductPopup"
import VendorPopup from "../Vendors/VendorPopup"
import OrderPopup from "../Orders/OrderPopup"
import OutsideAlerter from "./OutsideAlerter"

export default function Popup(props) {
    
    /*
    
    Popup when a row is clicked in a table.
    Sets the popup based on the type of table.

    */ 

    const values = props.data.row.values

    return (
        <div className="modal-content">

            {props.type === "products" 
            ?

            <OutsideAlerter hide={props.toggle}>
                <ProductPopup values={values} toggle={props.toggle}/>
            </OutsideAlerter>

            :

            props.type === "vendor"
            ?

            <OutsideAlerter hide={props.toggle}>
                <VendorPopup data={props.data} values={values} toggle={props.toggle} user={props.user}/>
            </OutsideAlerter>

            :

            <OutsideAlerter hide={props.toggle}>
                <OrderPopup values={values} toggle={props.toggle}/>
            </OutsideAlerter>
                
              
    }    
            
    </div>
    )
}