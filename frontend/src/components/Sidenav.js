import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/logo.png"

export default function Sidenav(props) {

  /*

  Sets the sidenav with its corresponding links
  
  */

  const listStyle = {
      textAlign: "center",
      padding: "0",
      marginTop: "85px",
      listStyleType: "none"
  }

  const listItemStyle = {
      padding: "20px",
      color: "#1E384D",
      fontWeight: "400",
      borderBottom: "1px solid rgb(30,56,77, .1)"
    }

  const pages = ["Home", "Products", "Vendors", "Orders"]
  const links = ["/", "/products", "/vendors", "/orders"]

  const location = useLocation()

  return (
      
    <aside className={props.class}>
      <div style={{margin: "10% auto", textAlign: "center"}}>
        <a href="/#"><img src={logo} alt="burmans logo" className="sidebar-logo"/></a>
      </div>
      <ul style={listStyle}>
          {pages.map((page, index) => {
            return (
             <li key={index} style={listItemStyle}>
             {links[index] === location.pathname 
              ? 
              <strong><Link to={links[index]}>{page}</Link></strong>
              :
              <Link to={links[index]}>{page}</Link>
             }
           </li>
            )
          })}
      </ul>
    </aside>
  );
}
