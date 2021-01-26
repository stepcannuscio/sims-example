// import {useState} from "react"
import {useHistory} from "react-router"
// import * as router from "./homeAPI"

export default function CallToAction(props) {

  /*
  
  Displays the number of products that are running low and sends to 
  products page with low product data on click

  */

  // const [data, setData]= useState([])
  // const [productsRunningLow, setProductsRunningLow] = useState(0)

  const history = useHistory();

  const headingStyle = {
    color: "#1E384D",
    fontSize: "1.5rem"
  }

  const productsLowNumStyle = {
    color: props.type === "products" ? "red" : "green",
    fontSize: "30px",
    margin: "20px"
  }

  const smallText = {
    fontSize: "12px",
  }

  // function getData() {
  //   router.loadLowProducts().then(data => {
  //     if (data) {
  //       setData(data)
  //       setProductsRunningLow(data.length)
  //     }
      
  //   })
  // }

  // useEffect(() => {
  //   getData()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  return (
      // <div style={{ width: "50%"}}>
        <div className="cta" onClick={() => {
            if (props.type === "products") {
              history.push("/products", {products: props.data})
            }
          }
          }>
          <h2 style={headingStyle}>{props.text}</h2>
          <strong><p style={productsLowNumStyle}>{props.type === "products" ? props.data.length : props.data}</p></strong>
          <p style={smallText}>{props.type === "products" ? "View Products" : "Value of products in inventory"} </p>
        </div>
      // </div>
    )
}