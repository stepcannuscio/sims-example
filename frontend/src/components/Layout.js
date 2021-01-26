import React, {useState} from "react"
import Header from "./Header"
import Sidenav from "./Sidenav"
import MenuIcon from "../images/menu.png"

export default function Layout({ children, user }) {

    /* 
    
    Sets the layout to maintain the same header and sidenav
    Also provides the ability to toggle the sidenav open and closed on mobile
    
    */

    const [sideNavClass, setSideNavClass] = useState("sidenav");

    function menuClicked(e) {
        if (sideNavClass === "sidenav") {
            setSideNavClass("sidenav active")
        } else {
            setSideNavClass("sidenav")
        }
    }

    return (
        <div>
             <div id="toggle-icon" onClick={menuClicked} className="sidenav__close-icon">
                <img
                    id="toggle-img"
                    className="menu-icon"
                    src={MenuIcon}
                    alt="menu icon"
                />
                </div>
            <div className="grid-container">
                <Header user={user}/>
                <Sidenav user={user} class={sideNavClass}/>
                {children}
            </div>
        </div>
       
    )
}