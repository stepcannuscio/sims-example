import React from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png"

export default function Sidenav(props) {

    const listStyle = {
        textAlign: "center",
        padding: "0",
        marginTop: "85px",
        listStyleType: "none"
    }

    const listItemStyle = {
        padding: "20px",
        color: "rgb(34, 43, 69)",
        borderBottom: "1px solid rgb(237, 241, 247)"
      }

    const pages = ["Home", "Inventory"]
    const links = ["/", "/inventory"]

  return (
      
    <aside className={props.class}>
      <div style={{margin: "10% auto", textAlign: "center"}}>
        <a href="/#"><img src={logo} alt="burmans logo" className="sidebar-logo"/></a>
      </div>
      <ul style={listStyle}>
          {pages.map((page, index) => {
            return (
             <li key={index} className="sidenav__list-item" style={listItemStyle}>
             <Link to={links[index]}>{page}</Link>
           </li>
            )
          })}
      </ul>
    </aside>
  );
}
