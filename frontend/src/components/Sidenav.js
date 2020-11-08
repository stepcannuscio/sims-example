import React from "react";
import { Link } from "react-router-dom";



// import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

export default function Sidenav(props) {

    // const queries = {
    //     md: '(min-width: 750px)'
    // }

    // const mediaQueryLists = {} // add all MediaQueryList objects here
    // const keys = Object.keys(queries)
    // const matches = {} // contains initial query matches

    // keys.forEach(media => {
    //     if (typeof queries[media] === 'string') {
    //         // adding MediaQueryList object for reach and every query to mediaQueryList objects
    //         mediaQueryLists[media] = windown.matchMedia(queries[media])

    //         // Get initial matches of each query
    //         matches[media] = mediaQueryLists[media].matches
    //     } else {
    //         matches[media] = false
    //     }
    // })


    // const mql = window.matchMedia('(min-width: 46.875em)');

    const sidenavStyle = {
        gridArea: "sidenav",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "240px",
        position: "fixed",
        overflowY: "auto",
        /* box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08); */
        /* Needs to sit above the hamburger menu icon */
        zIndex: "2", 
        backgroundColor: "white",
        transform: "translateX(-245px)",
        transition: "all 0.6s ease-in-out"
      }

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

    function changeDisplay() {
        if (props.isActive) {
            console.log('active')
            sidenavStyle.transform = "translateX(0)"
        }
    }
   
  return (
      
    <aside style={sidenavStyle} className="sidenav">
      <ul style={listStyle}>
          {pages.map((page, index) => (
             <li key={index} className="sidenav__list-item" style={listItemStyle}>
             <Link to={links[index]}>{page}</Link>
           </li>
          ))}

        {/* <li className="sidenav__list-item" style={listItemStyle}>
          <Link to="/">Home</Link>
        </li>
        <li className="sidenav__list-item" style={listItemStyle}>
          <Link to="/inventory">Inventory</Link>
        </li> */}
      </ul>
    </aside>
  );
}
