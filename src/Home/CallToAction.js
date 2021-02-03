import {useHistory} from "react-router"

export default function CallToAction(props) {

  /*
  
  Displays the number of products that are running low and sends to 
  products page with low product data on click

  */

  const history = useHistory();

  const headingStyle = {
    color: "#1E384D",
    fontSize: "1.5rem"
  }

  const colorStyle = {
    color: props.type === "products" ? "red" : "green",
  }

  const smallText = {
    fontSize: "12px",
  }

  return (
    <div className="cta" onClick={() => {
        if (props.type === "products") {
          history.push("/products", {products: props.data})
        }
      }
      }>
      <h2 style={headingStyle}>{props.text}</h2>
      <strong><p className="cta-main-text" style={colorStyle}>{props.type === "products" ? props.data.length : props.data}</p></strong>
      <p style={smallText}>{props.type === "products" ? "View Products" : "Value of products in inventory"} </p>
    </div>
    )
}