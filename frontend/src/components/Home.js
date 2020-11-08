import React, {useState} from "react"
import Header from "./Header"
import Sidenav from "./Sidenav"
import Main from "./Main"
import MenuIcon from "../images/menu.png"
// import styled from 'styled-components'

export default function Home() {
    console.log('home')

    // const [sideNavClass, setSideNavClass] = useState("sidenav");
    const [isActive, setIsActive] = useState(false);

    const gridContainer = {
        display: "grid",
        gridTemplateColumns: "1fr", /* Side nav is hidden on mobile */
        gridTemplateTows: "50px 1fr 50px",
        gridTemplateAreas: '"header" "main" "footer"',
        height: "100vh"
      }

    const menuIconStyle = {
        position: "fixed",
        display: "flex",
        top: "5px",
        left: "10px",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        zIndex: "100",
        cursor: "pointer",
        padding: "12px",
    }



    // function toggleSidenav(event) {
    //   if (event.target.id === "toggle-icon" || event.target.id === "toggle-img") {
    //     if (sideNavClass === "sidenav") {
    //       setSideNavClass("sidenav active");
    //     } else {
    //       setSideNavClass("sidenav");
    //     }
    //   }
      
    // }

    function newToggle(e) {
        // e.target.style.transform = "translateX(0)"
        // Sidenav.active
    }
    return (
        <div style={{backgroundColor: "white", height: "100vh"}}>
             <div id="toggle-icon" onClick={newToggle} style={menuIconStyle}>
                <img
                    id="toggle-img"
                    src={MenuIcon}
                    alt="menu icon"
                />
                </div>
            <div style={gridContainer} className="grid-container">
                <Header isLoggedIn={true}/>
                <Sidenav />
                <Main />
            </div>
        </div>
       
    )
    
}